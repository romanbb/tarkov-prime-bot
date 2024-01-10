import { AudioReceiveStream, EndBehaviorType, VoiceConnection } from "@discordjs/voice";
import { PassThrough, Readable, Stream, pipeline } from "stream";
import * as prism from "prism-media";

import wav from "wav";
import ffmpeg from "fluent-ffmpeg";
import vosk, { SpeakerRecognizerParam } from "vosk";
import { doesContainTriggerKeywords, getVoskRecognize } from "./vosk";
import { transcribeStreamAzure } from "../voice/azure";
import { handleQueryItemsInternal, processTranscript } from "../bot";
import { GuildTextBasedChannel, TextBasedChannel } from "discord.js";
import { buffer } from "stream/consumers";
export class UserState {
    internalActiveStreamId: string = new Date().getTime().toString();

    stream: AudioReceiveStream | undefined;
    readyToDelete: boolean = false;
    userId: string;
    speechRecognizingResulted: boolean = false; // Add userDoneSpeaking property

    private userTimeoutHandle: NodeJS.Timeout | undefined;

    private transcriptionStarted: boolean = false;
    private connection: VoiceConnection;
    private channel?: TextBasedChannel | GuildTextBasedChannel;

    /**
     * The OGG stream of the audio data
     */
    private oggStream: prism.opus.OggLogicalBitstream;

    private oggStreamPassthrough: PassThrough;

    /**
     * The WAV audio stream that
     */
    private wavAudioStream: wav.Reader;
    // private wavAudioStreamTranscribe: wav.Reader;
    private voskRecognizser: vosk.Recognizer<SpeakerRecognizerParam>;

    /**
     * The vosk data listener
     * @param data Buffer
     */
    private voskDataListener = async (data: Buffer) => {
        console.log("voskDataListener wrote data");
        // this.wavTranscriptionStream.write(data);

        // if (!!this.userTimeoutHandle) {
        //     console.log(" -> clearing timeout handle");
        //     clearTimeout(this.userTimeoutHandle);
        //     this.userTimeoutHandle = undefined;
        // }

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
    private voskCompletionListener = async () => {
        const finalResult = this.voskRecognizser.finalResult();
        // console.log(
        //     "ffmpeg--oggStream end event: finished reading data, finalResult: ",
        //     finalResult,
        // );

        let containsKeywords = await doesContainTriggerKeywords(finalResult);
        if (containsKeywords) {
            this.startTranscription();
        }
    };

    private wavTranscriptionStream: PassThrough;

    public constructor(userId: string) {
        this.userId = userId;
    }
    /**
     * Called when the user starts talking, may be called after user starts talking event
     */
    onStartRecognitionSession() {
        console.log("onStartRecognitionSession for ", this.userId);

        this.voskRecognizser = getVoskRecognize();

        this.stream = this.connection.receiver.subscribe(this.userId, {
            // highWaterMark: 24,
            // objectMode: true,

            end: {
                // behavior: EndBehaviorType.Manual,
                behavior: EndBehaviorType.AfterSilence,
                duration: 1000,
            },
        });
        this.oggStream = new prism.opus.OggLogicalBitstream({
            opusHead: new prism.opus.OpusHead({
                channelCount: 2,
                sampleRate: 48000,
            }),
            pageSizeControl: {
                maxPackets: 10,
            },
        });
        this.wavAudioStream = new wav.Reader();

        this.oggStreamPassthrough = new PassThrough();
        // this.wavAudioStreamTranscribe = new wav.Reader().wrap(this.wavAudioStream);
        // this.wavTranscriptionStream = new PassThrough(); //.wrap(this.wavAudioStream);
        pipeline(this.stream, this.oggStream, this.oggStreamPassthrough, err => {
            if (err) {
                console.error("pipeline error", err);
            }
        });

        // this.stream.on("data", () => {
        //     console.log("got an opus packet");
        // });
        // this.oggStream.on("data", () => {
        //     console.log("got an ogg packet");
        // });

        this.transcriptionStarted = false;
        this.readyToDelete = false;
    }
    /**
     * Called when we determined the user stops talking. May be called after user stops talking event
     */
    async onStopRecognitionSession() {
        console.log("onStopRecognitionSession for ", this.userId);

        this.userTimeoutHandle = undefined;

        this.readyToDelete = true;

        this.stream.unpipe();
        this.oggStream.unpipe();
        // this.wavAudioStream.unpipe();
        // this.wavTranscriptionStream.unpipe();

        // this.oggStreamTranscription.unpipe();

        // this.oggStream.
        this.wavAudioStream.end();
        this.oggStream.end();
        // this.wavTranscriptionStream.end();

        this.oggStream.destroy();
        this.stream.destroy();

        await this.voskCompletionListener();
        this.voskRecognizser.free();
    }
    /**
     * Might be called in the middle of a recognition session, or after one was handled
     * @param stream
     * @param connection
     * @param channel
     */
    onNewStream(connection: VoiceConnection, channel?: TextBasedChannel | GuildTextBasedChannel) {
        // if (this.stream != undefined) {
        //     this.stream.unpipe();
        //     this.oggStream.unpipe();
        //     this.wavTranscriptionStream.unpipe();

        //     // not destroying them but unhooking...
        // }

        console.log("onNewStream for ", this.userId, "timeout handle: ", !!this.userTimeoutHandle);
        this.connection = connection;
        this.channel = channel;

        if (!!this.userTimeoutHandle) {
            console.log(" -> clearing timeout handle");
            clearTimeout(this.userTimeoutHandle);
            this.userTimeoutHandle = undefined;
        } else if (this.oggStream == undefined || this.oggStream.destroyed) {
            console.log(" -> onStartRecognitionSession", this.oggStream?.destroyed);
            this.onStartRecognitionSession();
            // this.stream.pipe(this.oggStream);
        } else {
            console.log("note: no timeout to clear, and old stream is not destroyed.");
        }

        // pipeline(this.stream, this.oggStream, err => (err ? console.error(err) : null));

        // console.log(
        //     "stream: ",
        //     stream,
        //     "this.oggStream: ",
        //     this.oggStream,
        //     "this.oggStreamTranscription: ",
        //     this.wavTranscriptionStream,
        // );

        // const wfReader = new wav.Reader();
        const wfReadable = new Readable().wrap(this.wavAudioStream);
        wfReadable.on("data", this.voskDataListener);
        // pipeline(wfReadable, this.wavTranscriptionStream, err => (err ? console.error(err) : null));

        ffmpeg(this.oggStream)
            .audioChannels(1)
            .audioFrequency(16000)
            .audioCodec("pcm_s16le")
            .audioBitrate(16)
            .format("wav")
            .on("error", err => {
                console.log("ffmpeg--oggStreamAn error occurred: " + err.message + ", err" + err);
                // cleanupAndResolve(false);
            })
            .on("start", () => {
                console.log("start on oggStream ffmpeg");
            })
            .on("end", this.voskCompletionListener)
            .pipe(this.wavAudioStream, { end: false });

        // .on("data", this.voskDataListener)
        // .pipe(require("fs").createWriteStream("test.wav"), { end: true });
        // .pipe(this.wavTranscriptionStream, { end: false });
    }
    async onUserStoppedTalking() {
        this.connection.removeAllListeners(this.userId);
        this.userTimeoutHandle = setTimeout(() => {
            this.onStopRecognitionSession();
        }, 1000);
        console.log("onUserStoppedTalking for ", this.userId);
    }
    startTranscription() {
        if (this.transcriptionStarted) {
            console.log("transcription already started, avoiding starting again.");
            return;
        }
        this.transcriptionStarted = true;

        // go!
        transcribeStreamAzure(undefined, this.oggStreamPassthrough)
            .then(transcription => {
                this.speechRecognizingResulted = true;
                console.log("transcript callback, destroying wav transcript stream");
                this.oggStreamPassthrough.destroy();
                // this.wavTranscriptionStream.destroy();
                return transcription;
            })
            .then(processTranscript)
            .then(query => handleQueryItemsInternal(query, this.connection, this.channel))
            .catch(error => {
                console.error("❌ Error in transcribe process", error);
            });
        // this.oggStreamTranscription.uncork();
    }
    closeStream() {
        if (this.stream && !this.stream.destroyed && this.readyToDelete) {
            console.log("closing stream for ", this.userId, "id:", this.internalActiveStreamId);
            this.stream.destroy();
        }
    }
    toString() {
        return `ActiveStream: ${this.userId}, {readyToDelete: ${this.readyToDelete}, speechRecognizingResulted: ${this.speechRecognizingResulted}}`;
    }
}
