import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { AudioReceiveStream, EndBehaviorType, VoiceReceiver } from '@discordjs/voice';
import type { User } from 'discord.js';
import * as prism from 'prism-media';
import type Stream from 'node:stream';

function getDisplayName(userId: string, user?: User) {
	return user ? `${user.username}_${user.discriminator}` : userId;
}

export function saveVoice(receiver: VoiceReceiver, userId: string, user?: User) {
	const opusStream = receiver.subscribe(userId, {
		end: {
			behavior: EndBehaviorType.AfterSilence,
			duration: 1000,
		},
	});

	const oggStream = new prism.opus.OggLogicalBitstream({
		opusHead: new prism.opus.OpusHead({
			channelCount: 2,
			sampleRate: 48000,
		}),
        highWaterMark: 1 * 1024,
		// pageSizeControl: {
		// 	maxPackets: 10,
		// },
	});

	const filename = `./recordings/${Date.now()}-${getDisplayName(userId, user)}.ogg`;

	const out = createWriteStream(filename);

	console.log(`👂 Started recording ${filename}`);

	pipeline(opusStream, oggStream, out, (err) => {
		if (err) {
			console.warn(`❌ Error recording file ${filename} - ${err.message}`);
		} else {
			console.log(`✅ Recorded ${filename}`);
		}
	});
}

export function subscribeOpusStream(receiver: VoiceReceiver, userId: string): AudioReceiveStream {
    // const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // console.log("instance nonce:", nonce, " creating stream");
    
	const opusStream: AudioReceiveStream = receiver.subscribe(userId, {
        highWaterMark: 1024,
        // objectMode: true,
		end: {
			behavior: EndBehaviorType.AfterSilence,
			duration: 200,
		},
	});
    // console.log("subscriptions: ", receiver.subscriptions.values());
    return opusStream;
}
