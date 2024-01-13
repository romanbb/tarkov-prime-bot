import { AudioReceiveStream, EndBehaviorType, VoiceConnection } from "@discordjs/voice";
import { PassThrough, Readable, Stream, pipeline } from "stream";
import wav from "wav";
import ffmpeg from "fluent-ffmpeg";
import vosk, { SpeakerRecognizerParam } from "vosk";
import { doesContainTriggerKeywords, getVoskRecognize } from "./voice-detection/vosk";
import { transcribeStreamAzure } from "./voice/azure";
import { handleQueryItemsInternal, processTranscript } from "./bot";
import { GuildTextBasedChannel, TextBasedChannel } from "discord.js";
import { subscribeOpusStream } from "./discord/createListeningStream";
import { opus } from "prism-media";
import fs from "fs";
import { clear } from "console";
export class UserVoiceSession {
    private connection: VoiceConnection;
    private channel?: TextBasedChannel | GuildTextBasedChannel;
    private userId: string;

    private releasedSpeakingResources: boolean = false;

    /**
     * The discord opus stream
     */
    pcmStream: PassThrough | undefined = new PassThrough();
    /**
     * The ogg stream which comes from the opus stream
     */
    // oggStream: prism.opus.OggLogicalBitstream = new prism.opus.OggLogicalBitstream({
    //     opusHead: new prism.opus.OpusHead({
    //         channelCount: 2,
    //         sampleRate: 48000,
    //     }),
    //     pageSizeControl: {
    //         maxPackets: 10,
    //     },
    // });
    /**
     * The wav stream which comes from the oggStream
     */
    // wavAudioStream: wav.Reader = new wav.Reader();

    /**
     * The ogg passthrough stream, a copy of the original stream which will be used for transcription
     */
    pcmStreamPassthrough: PassThrough = new PassThrough();

    /**
     * Only start transcription once.
     */
    transcriptionStarted: boolean = false;

    /**
     * The voice recognition engine
     */
    voskRecognizser: vosk.Recognizer<SpeakerRecognizerParam>;

    ffmpegStream1: import("stream").Writable | PassThrough;

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
        const decoder = new opus.Decoder({ frameSize: 960, channels: 1, rate: 16000 });
        const userFileRecordingStream = fs.createWriteStream(this.userFileRecordingName);
        // pipe opus stream to ogg, then to the pass through
        pipeline(opusStream, decoder, this.pcmStream, userFileRecordingStream, err => {
            if (err) {
                console.error("❌ Error in opus stream pipeline", err);
            } else {
                console.log("✅ opus stream pipeline finished");
            }
        });
        // console.log("pcmStream", this.pcmStream);
        // pipeline(this.pcmStream, this.pcmStreamPassthrough, err => {
        //     if (err) {
        //         console.error("❌ Error in pcmStreamPassthrough stream pipeline", err);
        //     } else {
        //         console.log("✅ pcmStreamPassthrough stream pipeline finished");
        //     }
        // });
        console.log("pipeline setup");

        this.pcmStream.on("data", this.voskDataListener);
        // this.pcmStream.on("data", () => {});
        this.pcmStream.on("end", this.voskCompletionListener);
        console.log("data listener added");

        // this.stream.pipe(this.oggStream).pipe(this.oggStreamPassthrough);
        // this.stream.resume();

        // this.oggStream.on("end", async () => {
        //     console.log("oggStream end event");
        // });

        // this.pcmStream.on("pause", () => {
        //     console.log("opus stream pause event");
        //     this.pcmStreamPassthrough.uncork();
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

        console.log(">> I WOULD START TRANSCRIPTION HERE <<<");
        // go!
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
            })
            .catch(error => {
                console.error("❌ Error in transcribe process", error);
            });
    }
    printMetrics = () => {
        const metrics = {
            // Stream: this.pcmStream,
            // OggStream: this.oggStream,
            // OggStreamPassthrough: this.pcmStreamPassthrough,
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
        // this.pcmStream.unpipe();

        // this.wavAudioStream.end();
        // this.oggStream.end();
        // this.oggStream.unpipe();

        // this.pcmStreamPassthrough.end();

        this.ffmpegStream1?.end();
        this.ffmpegStream1.removeAllListeners();

        // await this.voskCompletionListener();
        // this.voskRecognizser.free();
    }

    releaseTranscriptionResources() {
        console.log("releaseTranscriptionResources called");
        fs.rmSync(this.userFileRecordingName);
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
    internalActiveStreamId: string = new Date().getTime().toString();

    userId: string;

    private lastActiveUserSession: UserVoiceSession | undefined;
    private userTimeoutHandle: NodeJS.Timeout | undefined;

    private connection: VoiceConnection;
    private channel?: TextBasedChannel | GuildTextBasedChannel;

    public constructor(userId: string) {
        this.userId = userId;
    }
    /**
     * Called when the user starts talking, may be called after user starts talking event
     */
    onStartRecognitionSession() {
        console.log("onStartRecognitionSession for ", this.userId);

        const userSession = new UserVoiceSession(this.userId, this.connection, this.channel);

        this.lastActiveUserSession = userSession;

        return userSession;
    }
    /**
     * Called when we determined the user stops talking. May be called after user stops talking event
     */
    async onStopRecognitionSession(session: UserVoiceSession) {
        console.log("onStopRecognitionSession for ", this.userId);

        this.userTimeoutHandle = undefined;
        await session.releaseSpeakingResources();
        this.lastActiveUserSession = undefined;
    }
    /**
     * Might be called in the middle of a recognition session, or after one was handled
     * @param stream
     * @param connection
     * @param channel
     */
    onNewStream(connection: VoiceConnection, channel?: TextBasedChannel | GuildTextBasedChannel) {
        console.log("onNewStream for ", this.userId, "timeout handle: ", !!this.userTimeoutHandle);
        this.connection = connection;
        this.channel = channel;

        // let session = this.userSession;
        let session: UserVoiceSession = this.lastActiveUserSession;

        if (this.userTimeoutHandle !== undefined) {
            // previous user session
            console.log(" -> clearing timeout handle");
            clearTimeout(this.userTimeoutHandle);
            this.userTimeoutHandle = undefined;
        }
        if (
            session === undefined ||
            session?.pcmStream === undefined ||
            session?.pcmStream.destroyed === true
        ) {
            console.log(" -> onStartRecognitionSession", session?.pcmStream.destroyed);
            session = this.onStartRecognitionSession();
        } else {
            console.log("note: no timeout to clear, and old stream is not destroyed.");
        }

        // const wfReadable = new Readable().wrap(session.wavAudioStream);
        // wfReadable.on("data", session.voskDataListener);

        // const ffmpegResult = ffmpeg(session.pcmStream)
        //     .audioChannels(1)
        //     .audioFrequency(16000)
        //     .audioCodec("pcm_s16le")
        //     .audioBitrate(16)
        //     .format("wav")
        //     .on("error", err => {
        //         console.log("ffmpeg--oggStreamAn error occurred: " + err.message + ", err" + err);
        //     })
        //     .on("start", () => {
        //         console.log("start on oggStream ffmpeg");
        //     })
        //     .on("end", session.voskCompletionListener)
        //     .pipe(session.wavAudioStream, { end: true })
        //     .on("data", session.voskDataListener);
        // session.ffmpegStream1 = ffmpegResult;
        // console.log("ffmpeg result", ffmpegResult);
    }
    async onUserStoppedTalking() {
        this.connection.removeAllListeners(this.userId);
        const session = this.lastActiveUserSession;

        session.endSpeakingTimestamp = new Date().getTime();

        // not sure if necessary, but resume the stream to keep the bits flowing if possible
        // session.stream.resume();
        // session.oggStream.resume();

        // schedule a cleanup
        // this.userTimeoutHandle = setTimeout(() => {
        this.onStopRecognitionSession(session ?? this.lastActiveUserSession);
        // }, 2000);
        console.log("onUserStoppedTalking for ", this.userId);
    }

    toString() {
        return `UserState: ${this.userId}`;
    }
}
