import { AudioReceiveStream, EndBehaviorType, VoiceConnection } from "@discordjs/voice";
import { PassThrough, Readable, Stream, pipeline } from "stream";
import vosk, { SpeakerRecognizerParam } from "vosk";
import { doesContainTriggerKeywords, getVoskRecognize } from "./voice-detection/vosk";
import { transcribeStreamAzure } from "./voice/azure";
import { handleQueryItemsInternal, processTranscript } from "./bot";
import { GuildTextBasedChannel, TextBasedChannel } from "discord.js";
import { subscribeOpusStream } from "./discord/createListeningStream";
import { opus } from "prism-media";
import fs from "fs";
export class UserVoiceSession {
    private connection: VoiceConnection;
    private channel?: TextBasedChannel | GuildTextBasedChannel;
    private userId: string;

    private releasedSpeakingResources: boolean = false;

    /**
     * The discord stream transformed to pcm
     */
    pcmStream: PassThrough | undefined = new PassThrough({
        highWaterMark: 1024,
        autoDestroy: true,
    });

    /**
     * Only start transcription once.
     */
    transcriptionStarted: boolean = false;

    /**
     * The voice recognition engine
     */
    voskRecognizser: vosk.Recognizer<SpeakerRecognizerParam>;

    transcriptionResult: string = "";

    startTimestamp: number = new Date().getTime();
    endOfflineDetectionTimestamp: number = 0;
    endSpeakingTimestamp: number = 0;
    endTranscriptionTimestamp: number = 0;
    endItemQueryTimestamp: number = 0;

    userFileRecordingName: string;

    public constructor(
        userId: string,
        connection: VoiceConnection,
        channel?: TextBasedChannel | GuildTextBasedChannel,
    ) {
        this.userId = userId;
        this.connection = connection;
        this.channel = channel;
        this.voskRecognizser = getVoskRecognize(userId);
        this.userFileRecordingName = `${this.userId}-${this.startTimestamp}.pcm`;

        // subscribe to the opus stream
        const opusStream = subscribeOpusStream(connection.receiver, this.userId);
        const decoder = new opus.Decoder({
            frameSize: 960,
            channels: 1,
            rate: 16000,
            streamOptions: { autoDestroy: true },
        });
        const userFileRecordingStream = fs.createWriteStream(this.userFileRecordingName, {
            autoClose: true,
        });
        // pipe opus stream to ogg, then to the pass through
        pipeline(opusStream, decoder, this.pcmStream, userFileRecordingStream, err => {
            if (err) {
                console.error("❌ Error in opus stream pipeline", err);
            } else {
                console.log("✅ opus stream pipeline finished");
            }
            opusStream.destroy();
            decoder.destroy();
            userFileRecordingStream.destroy();
        });

        console.log("pipeline setup");

        this.pcmStream.on("data", this.voskDataListener);
        // this.pcmStream.on("data", () => {});
        this.pcmStream.on("end", this.voskCompletionListener);
        console.log("data listener added");

        // this.stream.resume();

        // this.oggStream.on("end", async () => {
        //     console.log("oggStream end event");
        // });

        // this.pcmStream.on("resume", () => {
        //     console.log("opus stream resume event");
        // });
        // this.pcmStream.on("end", () => {
        //     console.log("opus stream end event");
        // });
        // this.pcmStream.on("error", err => {
        //     console.log("opus stream error event", err);
        // });
        // this.pcmStream.on("close", () => {
        //     console.log("opus stream close event");
        // });
        // this.pcmStream.on("data", () => {
        //     console.log("got an opus packet");
        // });
        // this.oggStream.on("data", () => {
        //     console.log("got an ogg packet");
        // });
    }
    /**
     * The vosk data listener, writes data to vosk and does eager detection for trigger keywords
     * @param data Buffer
     */
    voskDataListener = async (data: Buffer) => {
        // console.log("voskDataListener wrote data");
        if (this.releasedSpeakingResources) {
            console.log(
                "!!!!!!!!!!!!!!! voskDataListener: releasedSpeakingResources, returning early",
            );
            return;
        }
        if (this.transcriptionStarted) {
            console.log("!!!!!!!!!!!!!!! voskDataListener: transcriptionStarted, returning early");
            return;
        }

        // also write to vosk recognizer
        const end_of_speech = this.voskRecognizser.acceptWaveform(data);
        if (end_of_speech) {
            // if (DEBUG_VOSK) console.log("end of speech for ", rec.result());

            if (await doesContainTriggerKeywords(this.voskRecognizser.result())) {
                console.log(">>> early return via end_of_speech result, cleaning up");
                this.startTranscription();
            }
        } else {
            if (await doesContainTriggerKeywords(this.voskRecognizser.partialResult())) {
                console.log(">>> early return via partial result, cleaning up");
                this.startTranscription();
            }
        }
    };

    /**
     * The vosk completion listener.
     */
    voskCompletionListener = async () => {
        if (this.releasedSpeakingResources) {
            console.log(
                "!!!!!!!!!!!!!!! voskDataListener: releasedSpeakingResources, returning early",
            );
            return;
        }

        this.releasedSpeakingResources = true;
        this.endOfflineDetectionTimestamp = new Date().getTime();

        const finalResult = this.voskRecognizser.finalResult();
        console.log("vosk end event: finished reading data, finalResult: ", finalResult);

        let containsKeywords = await doesContainTriggerKeywords(finalResult);
        if (containsKeywords) {
            this.startTranscription();
        } else {
            this.releaseTranscriptionResources();
        }
        this.voskRecognizser.reset();
        // this.voskRecognizser.free();
    };

    /**
     * Start the transcription process. Cleans up stream after.
     * @returns
     */
    startTranscription() {
        if (this.transcriptionStarted) {
            console.log("transcription already started, avoiding starting again.");
            return;
        }
        this.transcriptionStarted = true;

        // go
        transcribeStreamAzure(this.userFileRecordingName, null)
            .then(transcription => {
                this.transcriptionResult = transcription;
                this.endTranscriptionTimestamp = new Date().getTime();
                // console.log("transcript callback, destroying wav transcript stream");
                this.releaseTranscriptionResources();
                return transcription;
            })
            .then(processTranscript)
            .then(query => handleQueryItemsInternal(query, this.connection, this.channel))
            .then(() => {
                this.endItemQueryTimestamp = new Date().getTime();
                this.printMetrics();
                this.connection = undefined;
                this.channel = undefined;
            })
            .catch(error => {
                console.error("❌ Error in transcribe process", error);
            });
    }
    printMetrics = () => {
        const metrics = {
            // Stream: this.pcmStream,
            // OggStream: this.oggStream,
            // OggStreamPassthrough: this.through,
            // WavAudioStream: this.wavAudioStream,
            "User Id": this.userId,
            "Transcription Result": this.transcriptionResult,
            "🗣️ Offline Detection Time": `${
                this.endOfflineDetectionTimestamp - this.startTimestamp
            } ms`,
            "💬 Speaking Time": `${this.endSpeakingTimestamp - this.startTimestamp} ms`,
            "📝 Transcription Time": `${
                this.endTranscriptionTimestamp - this.endSpeakingTimestamp
            } ms`,
            "🌎 Item Query Time": `${
                this.endItemQueryTimestamp - this.endTranscriptionTimestamp
            } ms`,
            "⏳ Total Time after user done speaking": `${
                this.endItemQueryTimestamp - this.endSpeakingTimestamp
            } ms`,
            "🕦 Total Time": `${this.endItemQueryTimestamp - this.startTimestamp} ms`,
        };

        console.log("Metrics: ------------------------------------");
        console.log(metrics);
        console.log("         ------------------------------------");
    };

    async releaseSpeakingResources() {
        console.log("releaseSpeakingResources called");
        // this.wavAudioStream.end();
        // this.oggStream.end();
        // this.oggStream.unpipe();

        // this.pcmStreamPassthrough.end();
        this.pcmStream.removeAllListeners();
    }

    releaseTranscriptionResources() {
        console.log("releaseTranscriptionResources called");
        fs.rm(this.userFileRecordingName, err => {
            if (err) {
                console.error("❌ Error removing file", err);
            }
        });

        this.pcmStream = undefined;
        // this.pcmStream.removeAllListeners();
        // this.pcmStream.destroy();
        // this.pcmStream = undefined;
        // this.oggStream.unpipe();
        // this.oggStreamPassthrough.destroy();

        // this.wavAudioStream.removeAllListeners();
        // this.wavAudioStream.destroy();

        // this.oggStream.removeAllListeners();
        // this.oggStream.destroy();
        // this.stream();
        // this.stream.removeAllListeners();
        // this.stream.destroy();
    }
}

export class UserState {
    userId: string;

    private lastActiveUserSession: UserVoiceSession | undefined;

    private connection: VoiceConnection;
    private channel?: TextBasedChannel | GuildTextBasedChannel;

    public constructor(userId: string) {
        console.log("Creating new UserState");
        this.userId = userId;
    }
    /**
     * Called when the user starts talking, may be called after user starts talking event
     */
    onStartRecognitionSession() {
        console.log("onStartRecognitionSession for ", this.userId);

        if (this.lastActiveUserSession) {
            // this.lastActiveUserSession.pcmStream = undefined;
            this.lastActiveUserSession = undefined;
        }

        const userSession = new UserVoiceSession(this.userId, this.connection, this.channel);

        this.lastActiveUserSession = userSession;

        return userSession;
    }
    /**
     * Called when we determined the user stops talking. May be called after user stops talking event
     */
    async onStopRecognitionSession(session: UserVoiceSession) {
        console.log("onStopRecognitionSession for ", this.userId);

        await session.releaseSpeakingResources();
    }
    /**
     * Might be called in the middle of a recognition session, or after one was handled
     * @param stream
     * @param connection
     * @param channel
     */
    onNewStream(connection: VoiceConnection, channel?: TextBasedChannel | GuildTextBasedChannel) {
        console.log("onNewStream for ", this.userId);
        this.connection = connection;
        this.channel = channel;

        // let session = this.userSession;
        let session: UserVoiceSession = this.lastActiveUserSession;

        if (
            session == undefined ||
            session?.pcmStream == undefined ||
            session?.pcmStream?.destroyed === true
        ) {
            console.log(" -> onStartRecognitionSession", session?.pcmStream?.destroyed);
            session = this.onStartRecognitionSession();
            session.pcmStream.once("end", () => {
                this.onUserStoppedTalking();
            });
        } else {
            console.log("note: no timeout to clear, and old stream is not destroyed.");
        }
    }
    async onUserStoppedTalking() {
        this.connection.removeAllListeners(this.userId);
        const session = this.lastActiveUserSession;

        session.endSpeakingTimestamp = new Date().getTime();

        this.onStopRecognitionSession(session);
        console.log("onUserStoppedTalking for ", this.userId);
    }

    toString() {
        return `UserState: ${this.userId}`;
    }
}
