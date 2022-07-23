import { createAudioPlayer, createAudioResource, VoiceConnection } from "@discordjs/voice";
import { synthesizeSpeech } from "./aws";

const player = createAudioPlayer();

export async function textToSpeach(text: string, voiceConnection: VoiceConnection) {
    const stream = await synthesizeSpeech(text);
    voiceConnection.subscribe(player);
    player.play(createAudioResource(stream));
}