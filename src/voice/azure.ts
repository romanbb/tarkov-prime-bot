import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import configEnv from "../config.env";
import type Stream from "stream";
import ffmpeg from "fluent-ffmpeg";
import wav from "wav";
import { Readable } from "stream";
sdk.Recognizer.enableTelemetry(false);

var config = sdk.SpeechConfig.fromSubscription(
    configEnv.azure.service_key,
    configEnv.azure.service_region,
);
config.endpointId = configEnv.azure.voice_endpoint_id;

const DEBUG_AZURE = false;
const prefix = "azure transcribe: ";

export async function transcribeStreamAzure(
    filename: string | undefined,
    stream: Stream.Readable,
): Promise<string | undefined> {
    if (DEBUG_AZURE) console.log(prefix, "transcribeStreamAzure called");
    return new Promise((resolve, reject) => {
        try {
            let pushStream = sdk.AudioInputStream.createPushStream();
            if (DEBUG_AZURE) console.log(prefix, "   created push stream");
            const wfReader = new wav.Reader();
            const wfReadable = new Readable().wrap(wfReader);

            wfReadable.on("data", async data => {
                // we need to remove the empty bytes:
                // data = data.subarray(0, data.indexOf(0x00));
                pushStream.write(data);
            });

            ffmpeg(stream)
                .audioChannels(1)
                .audioFrequency(16000)
                .audioCodec("pcm_s16le")
                .format("wav")
                .on("error", err => {
                    if (DEBUG_AZURE)
                        console.log(prefix, "An error occurred: " + err.message + ", err" + err);
                    reject(err);
                })
                // .on("stderr", function (stderrLine) {
                //     console.log("Stderr output: " + stderrLine);
                // })
                .on("end", async () => {
                    if (DEBUG_AZURE) console.log(prefix, "   ffmpeg end cmd");
                    pushStream.close();
                })

                .pipe(wfReader, { end: true });

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
