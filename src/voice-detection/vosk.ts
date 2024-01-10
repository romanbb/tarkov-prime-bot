import vosk, { SpeakerRecognizerParam } from "vosk";
import wav from "wav";
import { Readable } from "stream";
import ffmpeg from "fluent-ffmpeg";
import type Stream from "stream";
import Config from "../config.json";

const DEBUG_VOSK = true;
const MODEL_PATH = "support/vosk/vosk-model-en-us-0.22";
const MODEL_PATH_BIG = "support/vosk/vosk-model-en-us-0.42-gigaspeech"; //"vosk-model-en-us-0.22";
const MODEL_PATH_SMALL = "support/vosk/vosk-model-small-en-us-0.15"; //"vosk-model-en-us-0.22";
const model = new vosk.Model(MODEL_PATH);
const sampleRate = 16000;
vosk.setLogLevel(0);

export function getVoskRecognize(): vosk.Recognizer<SpeakerRecognizerParam> {
    const rec = new vosk.Recognizer({
        model: model,
        sampleRate: sampleRate,
    });
    rec.setPartialWords(true);
    rec.setWords(true);
    rec.setMaxAlternatives(3);
    return rec;
}

export async function doesStreamTriggerActivation(audioStream: Stream.Readable): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const rec = getVoskRecognize();

        const wfReader = new wav.Reader();
        const wfReadable = new Readable().wrap(wfReader);

        // prevents double rec.free() calls which would cause segfaults
        let finished = false;

        const cleanupAndResolve = (result: boolean) => {
            if (finished) {
                console.log("!! finished was already true, returning early");
            } else {
                finished = true;
                wfReadable.removeListener("data", dataListener);
                try {
                    rec.free();
                } catch (error) {
                    console.log("error freeing rec", error);
                }
                resolve(result);
            }
        };

        const dataListener = async (data: Buffer) => {
            const end_of_speech = rec.acceptWaveform(data);

            if (end_of_speech) {
                // if (DEBUG_VOSK) console.log("end of speech for ", rec.result());
                if (DEBUG_VOSK) console.log("DONE: ", JSON.stringify(rec.result(), null, 4));

                if (await doesContainTriggerKeywords(rec.result())) {
                    if (DEBUG_VOSK)
                        console.log(">>> early return via end_of_speech result, cleaning up");
                    cleanupAndResolve(true);
                    return;
                }
            } else {
                if (DEBUG_VOSK) console.log("wfReadable partial: ", rec.partialResult()); //JSON.stringify(rec.partialResult(), null, 4));

                if (await doesContainTriggerKeywords(rec.partialResult())) {
                    if (DEBUG_VOSK) console.log(">>> early return via partial result, cleaning up");
                    cleanupAndResolve(true);
                    return;
                }
            }
        };
        wfReadable.on("data", dataListener);

        const ffmpegCmd = ffmpeg(audioStream)
            .audioChannels(1)
            .audioFrequency(sampleRate)
            .audioCodec("pcm_s16le")
            .audioBitrate(16)
            .format("wav")
            .on("error", err => {
                console.log("An error occurred: " + err.message + ", err" + err);
                cleanupAndResolve(false);
            })
            // .on('stderr', function (stderrLine) {
            //     if (DEBUG_VOSK) console.log('Stderr output: ' + stderrLine);
            // })
            .on("end", async () => {
                const finalResult = rec.finalResult();
                if (DEBUG_VOSK)
                    console.log(
                        "✅ ffmpeg end event: finished reading data: finalResult",
                        // finalResult,
                    );

                let containsKeywords = await doesContainTriggerKeywords(finalResult);
                cleanupAndResolve(containsKeywords);
            })
            .pipe(wfReader, { end: true });
    });
}

/**
 * Checks if the given results contain trigger keywords.
 * @param results The recognition results to check.
 * @returns A promise that resolves to a boolean indicating whether the results contain trigger keywords.
 */
export async function doesContainTriggerKeywords(
    results: vosk.RecognitionResults | vosk.PartialResults,
): Promise<boolean> {
    // if (DEBUG_VOSK) console.log("doesContainTriggerKeywords", results);
    try {
        return new Promise((resolve, _reject) => {
            const triggerRegex = new RegExp(Config.hotword_regex);
            // const triggerWords = ["check", "price"];

            function localContainsTrigger(transcript: string): boolean {
                if (transcript.trim().length == 0) {
                    return false;
                }
                const result = triggerRegex.test(transcript.trim().toLowerCase());
                if (DEBUG_VOSK)
                    console.log(
                        "finished checking for trigger words from transcript:",
                        transcript,
                        "match:",
                        result,
                    );
                return result;
            }

            if ("text" in results) {
                const text = results.text ?? "";
                resolve(localContainsTrigger(text));
                return;

                // simplistic check which checks for presence of all trigger words
                // looks like:
                // { alternatives: [ { confidence: 63.051117, result: [Array], text: 'check price' } ] }
            }

            // comes in with regular check
            if ("alternatives" in results) {
                // if (DEBUG_VOSK) console.log("results has alternatives");

                (results.alternatives as vosk.PartialResults[]).forEach(
                    (alternative: Record<string, any>) => {
                        if (localContainsTrigger(alternative.text.trim().toLowerCase())) {
                            // eager resolve here
                            resolve(true);
                        }
                    },
                );
            }

            // comes in with partial check
            if ("partial" in results) {
                // if (DEBUG_VOSK) console.log("results has partial", results);

                const text = (results as unknown as vosk.PartialResults).partial.trim();
                resolve(localContainsTrigger(text));
            }

            resolve(false);
        });
    } catch (error) {
        if (DEBUG_VOSK) console.log("errored checking for trigger words", error);
        return Promise.reject(error);
    }
}
