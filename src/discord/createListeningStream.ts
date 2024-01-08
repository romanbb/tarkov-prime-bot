import { createWriteStream } from "fs";
import { PassThrough, pipeline } from "stream";
import {
    AudioReceiveStream,
    EndBehaviorType,
    VoiceConnection,
    VoiceReceiver,
} from "@discordjs/voice";
import type { GuildTextBasedChannel, Snowflake, TextBasedChannel, User } from "discord.js";
import * as prism from "prism-media";
import type Stream from "node:stream";
import { handleAudioStream } from "../bot";
import { ActiveStream } from "../voice-detection/active-stream";
import { ITranscriptionCallback } from "../voice-detection/transcription-models";
import { doesStreamTriggerActivation } from "../voice-detection/vosk";

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

    pipeline(opusStream, oggStream, out, err => {
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
            duration: 500,
        },
    });
    // console.log("subscriptions: ", receiver.subscriptions.values());
    return opusStream;
}

export function handleAudioStreamDetection(
    voiceConnection: VoiceConnection | undefined,
    receiver: VoiceReceiver,
    userId: Snowflake,
    connection?: VoiceConnection,
    textChannel?: TextBasedChannel | GuildTextBasedChannel,
): ActiveStream {
    const opusStream = subscribeOpusStream(receiver, userId);

    const activeStream = new ActiveStream(userId, opusStream);

    const oggStream = new prism.opus.OggLogicalBitstream({
        opusHead: new prism.opus.OpusHead({
            channelCount: 2,
            sampleRate: 48000,
        }),
    });

    const oggStreamTranscription = new PassThrough();
    pipeline(opusStream, oggStream, oggStreamTranscription, err => {
        if (err) {
            console.warn(`❌ Error recording stream err: ${err.message}`);
        }
        //  else {
        // 	console.log(`✅ Recording stream`);
        // }
    });
    const transcriptionCallback = <ITranscriptionCallback>{
        onTranscriptionCompleted: (text: string) => {
            console.log(
                "transcription callback",
                text,
                "activeStream readyToDelete: ",
                activeStream?.readyToDelete,
            );
            if (activeStream) {
                activeStream.speechRecognizingResulted = true;
                if (activeStream.readyToDelete) {
                    activeStream.closeStream();
                } else {
                    activeStream.readyToDelete = true;
                    console.log(
                        "activeStream was not ready to delete but transcription was completed",
                    );
                }
            }
        },
    };
    try {
        // console.log("checkingfor activation for user", userId);
        doesStreamTriggerActivation(oggStream).then(result => {
            if (result) {
                // use separate stream for transcription
                handleAudioStream(
                    oggStreamTranscription,
                    connection ?? null,
                    textChannel ?? null,
                    transcriptionCallback,
                );
            } else {
                console.log("determined stream will not trigger activation, closing");
                activeStream.closeStream();
            }
        });
    } catch (error) {
        console.error(error);
    }

    return activeStream;
}
