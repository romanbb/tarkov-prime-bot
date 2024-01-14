import { createAudioPlayer, createAudioResource, VoiceConnection } from "@discordjs/voice";
// import { synthesizeSpeech } from "./voice/aws";
import { Readable } from "stream";
import { azureTts } from "./azure";

const player = createAudioPlayer();

export async function textToSpeach(text: string, voiceConnection: VoiceConnection) {
    // const stream = await synthesizeSpeech(text);
    const stream = await azureTts(text);

    voiceConnection.subscribe(player);
    if (!!stream && stream instanceof Readable) {
        const audioResource = createAudioResource(stream);
        player.play(audioResource);
        player.once("idle", () => {
            stream.destroy();
        });
    } else {
        throw Error("Not implemented for this type of stream: " + typeof stream);
    }
}
