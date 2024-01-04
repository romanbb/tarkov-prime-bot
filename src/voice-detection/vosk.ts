import vosk from "vosk";
import wav from "wav";
import { Readable } from "stream";
import ffmpeg from "fluent-ffmpeg";
import type Stream from "stream";
import Config from "../config.json";
const MODEL_PATH = "vosk-model-en-us-0.22"
const MODEL_PATH_BIG = "vosk-model-en-us-0.42-gigaspeech" //"vosk-model-en-us-0.22";
const MODEL_PATH_SMALL = "vosk-model-small-en-us-0.15" //"vosk-model-en-us-0.22";
const model = new vosk.Model(MODEL_PATH);
const sampleRate = 48000;
vosk.setLogLevel(0);


export async function doesStreamTriggerActivation(audioStream: Stream.Readable): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const rec = new vosk.Recognizer({ model: model, sampleRate: sampleRate });
        rec.setPartialWords(true);
        rec.setWords(true);
        rec.setMaxAlternatives(3);

        const wfReader = new wav.Reader();
        const wfReadable = new Readable({ highWaterMark: 1024 }).wrap(wfReader);

        wfReadable.on("data", async (data: Buffer) => {
            // we need to remove the empty bytes:
            // data = data.subarray(0, data.indexOf(0x00));

            const end_of_speech = rec.acceptWaveform(data);

            if (end_of_speech) {
                // console.log("end of speech for ", rec.result());
                // console.log("DONE: ", JSON.stringify(rec.result(), null, 4));

                if (await doesContainTriggerKeywords(rec.result())) {
                    resolve(true);
                }
            } else {
                // console.log("wfReadable partial: ", rec.partialResult());//JSON.stringify(rec.partialResult(), null, 4));

                if (await doesContainTriggerKeywords(rec.partialResult())) {
                    resolve(true);
                }
            }
        });

        // wfReadable.on("end", () => {
        //     console.log("wfReadable end event")
        // });
        // wfReader.on("format", (format) => {
        //     console.log("format", format)
        // })
        ffmpeg(audioStream)
            .audioChannels(1)
            .audioFrequency(sampleRate)
            .audioCodec("pcm_s16le")
            .format("wav")
            .on("error", (err) => {
                console.log("An error occurred: " + err.message + ", err" + err);
                rec.free();
                reject(err);
            })
            // .on('stderr', function (stderrLine) {
            //     console.log('Stderr output: ' + stderrLine);
            // })
            .on("end", async () => {

                const finalResult = rec.finalResult();
                console.log("✅ ffmpeg end event: finished reading data: finalResult", finalResult)
                let containsKeywords = await doesContainTriggerKeywords(finalResult);

                rec.free();
                // console.log("finished checking for trigger words", containsKeywords, 'finalResult', finalResult);
                resolve(containsKeywords);
            })

            .pipe(wfReader, { end: true })

    });
}

/**
 * Checks if the given results contain trigger keywords.
 * @param results The recognition results to check.
 * @returns A promise that resolves to a boolean indicating whether the results contain trigger keywords.
 */
async function doesContainTriggerKeywords(results: vosk.RecognitionResults | vosk.PartialResults): Promise<boolean> {
    // console.log("doesContainTriggerKeywords", results);
    try {
        return new Promise((resolve, _reject) => {
            const triggerRegex = Config.key_phrases.flatMap(phrase => `${phrase}`).join("|");
            // const triggerWords = ["check", "price"];
            if ('text' in results) {
                const transcript = results.text ?? "";

                // simplistic check which checks for presence of all trigger words
                // looks like: 
                // { alternatives: [ { confidence: 63.051117, result: [Array], text: 'check price' } ] }
                const containsTrigger = transcript.toLowerCase().match(triggerRegex) !== null;
                console.log("finished checking for trigger words", containsTrigger, results);

                if (containsTrigger) {
                    resolve(true);
                }
            }

            // comes in with regular check
            if ('alternatives' in results) {
                console.log("results has alternatives");

                ('alternatives' in results as unknown as []).forEach((alternative) => {
                    const text = 'text' in alternative as unknown as string;
                    const words = text.split(" ");
                    const triggerWords = words.filter((word: string) => {
                        return word.match(triggerRegex) !== null;
                    });

                    if (triggerWords.length > 0) {
                        console.log("trigger words found in alternative", triggerWords);
                        resolve(true);
                    }
                });
            }

            // comes in with partial check
            if ('partial' in results) {
                // console.log("results has partial", results);

                // ('partial' in results as unknown as []).forEach((alternative) => {
                const text = (results as unknown as vosk.PartialResults).partial.trim();
                if (text.length > 0) {
                console.log("partial text was:", text)
                if (text.length > 0) {

                    const words = text.split(" ");
                    const triggerWords = words.filter((word: string) => {
                        return word.trim().match(triggerRegex) !== null;
                    });

                    if (triggerWords.length > 0) {
                        console.log("trigger words found in partial", triggerWords);
                        resolve(true);
                    }
                }
                // });
            }

            resolve(false);
        });
    } catch (error) {
        console.log("errored checking for trigger words", error)
        return Promise.reject(error);
    }
}


