import { createAudioPlayer, createAudioResource, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import { synthesizeSpeech } from "../aws";
import config from '../config.json'

const player = createAudioPlayer();

export async function textToSpeach(text: string, voiceConnection: VoiceConnection) {
    const stream = await synthesizeSpeech(text);
    player.on('subscribe', () => {
        console.log("subscribed to player");
        player.play(createAudioResource(stream));
    });
    voiceConnection.subscribe(player);
}