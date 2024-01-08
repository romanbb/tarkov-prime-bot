import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import configEnv from "../config.env";
import type Stream from "stream";
import vosk from "vosk";
import ffmpeg from "fluent-ffmpeg";
import wav from "wav";
import { Readable } from "stream";
sdk.Recognizer.enableTelemetry(false);

var config = sdk.SpeechConfig.fromSubscription(
    configEnv.azure.service_key,
    configEnv.azure.service_region,
);
config.endpointId = configEnv.azure.voice_endpoint_id;

export async function transcribeStreamAzure(
    filename: string | undefined,
    stream: Stream.Readable,
): Promise<string | undefined> {
    console.log("transcribeStreamAzure called");
    return new Promise((resolve, reject) => {
        try {
            let pushStream = sdk.AudioInputStream.createPushStream();
            console.log("   created push stream");
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
                    console.log("An error occurred: " + err.message + ", err" + err);
                    reject(err);
                })
                // .on("stderr", function (stderrLine) {
                //     console.log("Stderr output: " + stderrLine);
                // })
                .on("end", async () => {
                    console.log("   ffmpeg end cmd");
                    pushStream.close();
                })

                .pipe(wfReader, { end: true });

            console.log("started ffmpeg req");
            let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
            var reco = new sdk.SpeechRecognizer(config, audioConfig);
            console.log("   created recognizer");

            reco.recognizeOnceAsync(
                result => {
                    console.log(`RECOGNIZED: Text=${result.text}`);
                    reco.close();
                    resolve(result.text);
                },
                (error: any) => {
                    console.error(error);
                    reco.close();
                    reject(error);
                },
            );

            console.log("   recognizer recognizeOnceAsync");
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}
