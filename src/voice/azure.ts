import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import configEnv from "../config.env";
import type Stream from "stream";
import fs from "fs";
import { PassThrough, Readable } from "stream";
sdk.Recognizer.enableTelemetry(false);

const DEBUG_AZURE = false;
const prefix = "azure transcribe: ";

export async function transcribeStreamAzure(
    filename: string | undefined,
    stream: Stream.Readable,
): Promise<string | undefined> {
    let config = sdk.SpeechConfig.fromSubscription(
        configEnv.azure.service_key,
        configEnv.azure.service_region,
    );
    config.endpointId = configEnv.azure.voice_endpoint_id;
    if (DEBUG_AZURE) console.log(prefix, "transcribeStreamAzure called");
    return new Promise((resolve, reject) => {
        try {
            let pushStream = sdk.AudioInputStream.createPushStream();
            if (DEBUG_AZURE)
                console.log(prefix, "   created push stream, input read stream: ", stream);
            // const wfReader = new wav.Reader();
            // const wfReadable = new Readable().wrap(wfReader);

            if (stream) {
            } else if (filename) {
                stream = fs.createReadStream(filename);
            } else {
                reject("no stream or filename");
                return;
            }

            stream.on("data", async data => {
                // we need to remove the empty bytes:
                // data = data.subarray(0, data.indexOf(0x00));
                pushStream.write(data);
            });
            stream.on("close", () => {
                pushStream.close();
            });
            // ffmpeg(stream)
            //     .audioChannels(1)
            //     .audioFrequency(16000)
            //     .audioCodec("pcm_s16le")
            //     .format("wav")
            //     .on("error", err => {
            //         if (DEBUG_AZURE)
            //             console.log(prefix, "An error occurred: " + err.message + ", err" + err);
            //         reject(err);
            //     })
            //     // .on("stderr", function (stderrLine) {
            //     //     console.log("Stderr output: " + stderrLine);
            //     // })
            //     .on("end", async () => {
            //         if (DEBUG_AZURE) console.log(prefix, "   ffmpeg end cmd");
            //         pushStream.close();
            //     })

            //     .pipe(wfReader, { end: true });

            if (DEBUG_AZURE) console.log(prefix, "started ffmpeg req");
            let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
            var reco = new sdk.SpeechRecognizer(config, audioConfig);
            if (DEBUG_AZURE) console.log(prefix, "   created recognizer");

            reco.recognizeOnceAsync(
                result => {
                    if (DEBUG_AZURE) console.log(prefix, `RECOGNIZED: Text=${result.text}`);
                    reco.close();
                    resolve(result.text);
                },
                (error: any) => {
                    console.error(error);
                    reco.close();
                    reject(error);
                },
            );

            if (DEBUG_AZURE) console.log(prefix, "   recognizer recognizeOnceAsync");
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}

export async function azureTts(text: string): Promise<Readable | undefined> {
    let config = sdk.SpeechConfig.fromSubscription(
        configEnv.azure.service_key,
        configEnv.azure.service_region,
    );
    return new Promise((resolve, reject) => {
        try {
            if (DEBUG_AZURE) console.log(prefix, "azureTts called");
            const bufferStream = new PassThrough();
            const stream = sdk.PushAudioOutputStream.create({
                write: a => bufferStream.write(Buffer.from(a)),
                close: () => {
                    if (DEBUG_AZURE) console.log("close on buffer tts stream");
                    bufferStream.end();
                },
            });
            const audioConfig = sdk.AudioConfig.fromStreamOutput(stream);
            config.speechSynthesisOutputFormat =
                sdk.SpeechSynthesisOutputFormat.Ogg24Khz16BitMonoOpus;
            config.speechSynthesisVoiceName = "en-US-AmberNeural";

            var synthesizer = new sdk.SpeechSynthesizer(config, audioConfig);

            synthesizer.speakTextAsync(
                text,
                result => {
                    if (DEBUG_AZURE)
                        console.log(prefix, `result: ${JSON.stringify(result, null, 2)}`);
                    synthesizer.close();
                    // const data = Buffer.from(result.audioData);
                    // resolve(Readable.from(data));
                    // resolve(fs.readFileSync("output.wav"));
                },
                error => {
                    console.error(error);
                    synthesizer.close();
                    reject(error);
                },
            );
            resolve(bufferStream);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}
