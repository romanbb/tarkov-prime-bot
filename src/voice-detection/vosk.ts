import vosk, { SpeakerRecognizerParam } from "vosk";
import Config from "../config.json";

const DEBUG_VOSK = true;
const MODEL_PATH = "support/vosk/vosk-model-en-us-0.22";
const MODEL_PATH_BIG = "support/vosk/vosk-model-en-us-0.42-gigaspeech"; //"vosk-model-en-us-0.22";
const MODEL_PATH_SMALL = "support/vosk/vosk-model-small-en-us-0.15"; //"vosk-model-en-us-0.22";
const MODEL_SMALL_DANZU = "support/vosk/vosk-model-en-us-daanzu-20200905-lgraph";
const model = new vosk.Model(MODEL_SMALL_DANZU);
const sampleRate = 16000;
vosk.setLogLevel(0);

const recognizerMap = new Map<string, vosk.Recognizer<SpeakerRecognizerParam>>();

export function getVoskRecognize(userId: string): vosk.Recognizer<SpeakerRecognizerParam> {
    if (recognizerMap.has(userId)) {
        return recognizerMap.get(userId);
    }
    const rec = new vosk.Recognizer({
        model: model,
        sampleRate: sampleRate,
    });
    rec.setPartialWords(true);
    rec.setWords(true);
    rec.setMaxAlternatives(3);
    recognizerMap.set(userId, rec);
    return rec;
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
