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
		pageSizeControl: {
			maxPackets: 10,
		},
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

export function createListeningStream(receiver: VoiceReceiver, userId: string): Stream.Readable {
	const opusStream: AudioReceiveStream = receiver.subscribe(userId, {
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
		pageSizeControl: {
			maxPackets: 10,
		},
	});

	pipeline(opusStream, oggStream, (err) => {
		if (err) {
			console.warn(`❌ Error recording stream ${err.message}`);
		}
		//  else {
		// 	console.log(`✅ Recording stream`);
		// }
	});

    return oggStream;


}