import { createAudioPlayer, createAudioResource, VoiceConnection } from "@discordjs/voice";
import { synthesizeSpeech } from "./aws";
import { Readable } from "stream";

const player = createAudioPlayer();

export async function textToSpeach(text: string, voiceConnection: VoiceConnection) {
    const stream = await synthesizeSpeech(text);
    voiceConnection.subscribe(player);
    if (!!stream && stream instanceof Readable) {
        player.play(createAudioResource(stream));
    } else {
        throw Error("Not implemented for this type of stream: " + typeof stream)
    }
}