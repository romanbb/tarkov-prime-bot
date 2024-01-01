import vosk from "vosk";
import wav from "wav";
import { Readable } from "stream";
import ffmpeg from "fluent-ffmpeg";
import type Stream from "stream";
import Config from "../config.json";
const MODEL_PATH = "vosk-model-en-us-0.42-gigaspeech" //"vosk-model-en-us-0.22";
const MODEL_PATH_SMALL = "vosk-model-small-en-us-0.15" //"vosk-model-en-us-0.22";
const model = new vosk.Model(MODEL_PATH);
const sampleRate = 16000;
vosk.setLogLevel(0);

export async function doesStreamTriggerActivation(audioStream: Stream.Readable): Promise<boolean> {
    return new Promise((resolve, reject) => {

        const rec = new vosk.Recognizer({ model: model, sampleRate: sampleRate });
        rec.setMaxAlternatives(10);
        rec.setWords(true);
        rec.setPartialWords(true)

        const wfReader = new wav.Reader();
        // const temp = new wav.Writer();
        const wfReadable = new Readable().wrap(wfReader);

        wfReader.on('format', async ({ audioFormat, sampleRate, channels }) => {
            // console.log("format event", audioFormat, sampleRate, channels)
            if (audioFormat != 1 || channels != 1) {
                console.error("Audio file must be WAV format mono PCM.");
                process.exit(1);
            }
            const rec = new vosk.Recognizer({ model: model, sampleRate: sampleRate });
            // rec.setMaxAlternatives(5);
            rec.setWords(true);
            rec.setPartialWords(true);
            for await (const data of wfReadable) {
                const end_of_speech = rec.acceptWaveform(data);
                if (end_of_speech) {
                    // console.log(JSON.stringify(rec.result(), null, 4));
                } else {
                    // console.log("partial: ", JSON.stringify(rec.partialResult(), null, 4));
                }
            }
            // console.log("finished reading data")
            const containsKeywords = await doesContainTriggerKeywords(rec.finalResult());
            rec.free();
            // console.log("finished checking for trigger words", containsKeywords);
            resolve(containsKeywords);
        });
        ffmpeg(audioStream)
            .audioChannels(1)
            .audioFrequency(16000)
            .audioBitrate(16)
            .audioCodec("pcm_s16le")
            .format("wav")
            .pipe(wfReader, { end: true })
            .on("error", (err) => {
                console.log("An error occurred: " + err.message + ", err" + err);
                rec.free();
                reject(err);
            })
      
    });
}

/**
 * Checks if the given results contain trigger keywords.
 * @param results The recognition results to check.
 * @returns A promise that resolves to a boolean indicating whether the results contain trigger keywords.
 */
async function doesContainTriggerKeywords(results: vosk.RecognitionResults | (vosk.SpeakerResults & vosk.RecognitionResults)): Promise<boolean> {
    // console.log("doesContainTriggerKeywords", results);
    try {
        return new Promise((resolve, _reject) => {
            const triggerRegex = Config.key_phrases.flatMap(phrase => `${phrase}`).join("|");
            // const triggerWords = ["check", "price"];
            const transcript = results.text ?? "";

            // simplistic check which checks for presence of all trigger words
            // looks like: 
            // { alternatives: [ { confidence: 63.051117, result: [Array], text: 'check price' } ] }
            const containsTrigger = transcript.toLowerCase().match(triggerRegex) !== null;
            console.log("finished checking for trigger words", containsTrigger, results);

            resolve(containsTrigger);
        });
    } catch (error) {
        console.log("errored checking for trigger words", error)
        return Promise.reject(error);
    }
}


