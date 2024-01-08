import {
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
    VoiceReceiver,
} from "@discordjs/voice";
import {
    Client,
    CommandInteraction,
    GuildMember,
    Snowflake,
    TextBasedChannel,
    TextChannel,
    VoiceBasedChannel,
    VoiceChannel,
    EmbedBuilder,
    GuildTextBasedChannel,
    ActivityFlags,
} from "discord.js";
import { handleAudioStream } from "../bot";
import { subscribeOpusStream } from "./createListeningStream";
import Config from "../config.json";

import * as prism from "prism-media";
import {
    queryItems as queryItemsTarkovMarket,
    embedForItems as embedForItemsTarkovMarket,
    getTtsString as getTtsStringTarkovMarket,
} from "../flea/tarkov-market";
import {
    queryItem as queryItemsTarkovDev,
    embedForItems as embedForItemsTarkovDev,
    getTtsString as getTtsStringTarkovDev,
} from "../flea/tarkov-dev";
import { doesStreamTriggerActivation } from "../voice-detection/vosk";
import { PassThrough, pipeline, Stream } from "stream";
import { ActiveStream } from "../voice-detection/active-stream";
import { ITranscriptionCallback } from "../voice-detection/transcription-models";

const recording = new Set<Snowflake>();

/**
 * Debug helper
 * @param recordable
 * @param userId
 * @param voiceChannel
 * @param textChannel
 */
export async function joinAndListen(
    recordable: Set<Snowflake>,
    userId: Snowflake,
    voiceChannel?: VoiceBasedChannel,
    _textChannel?: TextChannel,
) {
    if (!voiceChannel) {
        throw Error("need a voice channel to join and listen");
    }
    let connection: VoiceConnection | undefined = getVoiceConnection(voiceChannel.guildId);
    if (!connection) {
        connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            selfDeaf: false,
            selfMute: false,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
    }
    // recordable.add(userId);

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
        const receiver = connection.receiver;

        const activeStreams = new Map<Snowflake, Array<ActiveStream>>();
        receiver.speaking.on("start", userId => {
            // if (!recording.has(userId)) {
            // recording.add(userId);

            console.log(`+${userId} 💬 listening from joinAndListen`);
            const stream = handleAudioStreamDetection(
                connection,
                receiver,
                userId,
                connection,
                _textChannel ?? undefined,
            );
            const currentStreams = activeStreams.get(userId) ?? new Array<ActiveStream>();
            activeStreams.set(userId, currentStreams.concat(stream));
            // }
        });

        receiver.speaking.on("end", userId => {
            // recording.delete(userId);
            const endingStreams = activeStreams.get(userId);
            activeStreams.delete(userId);
            console.log(`-${userId} 💬 done speaking for stream ${endingStreams}`);

            for (const stream of endingStreams ?? []) {
                stream.readyToDelete = true;
                if (stream.speechRecognizingResulted) {
                    stream.closeStream();
                    console.log(`❌  stream=${stream} was ready to delete, destroying..`);
                } else {
                    setTimeout(() => {
                        if (!stream.stream.closed) {
                            console.log(`❌❌❌ stream=${stream} was not closed, destroying..`);
                        }
                        stream.closeStream();
                    }, 4000);
                }
            }
            // if (endingStream) {
            //     endingStream.readyToDelete = true;
            // }
            // connection?.receiver.subscriptions.get(userId)?.destroy();
            // connection?.receiver.subscriptions.delete(userId);
            // console.log(`-${userId} 💬 done from joinAndListen`);
        });
    } catch (error) {
        console.error(error);
    }
}

function handleAudioStreamDetection(
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
                console.log(
                    "triggered activation!!!",
                    "oggStream destroyed: ",
                    !!oggStream.destroyed,
                    "oggStreamTranscription destroyed: ",
                    oggStreamTranscription.destroyed,
                );
                // copy detection stream into a new stream

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

async function join(
    interaction: CommandInteraction,
    recordable: Set<Snowflake>,
    _client: Client,
    connection?: VoiceConnection,
) {
    await interaction.deferReply({ ephemeral: true });
    if (!connection) {
        if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            const channel = interaction.member.voice.channel;
            connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                selfDeaf: false,
                selfMute: false,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
        } else {
            await interaction.followUp({
                content: "Join a voice channel and then try that again!",
                ephemeral: true,
            });
            return;
        }
    }

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
        const receiver = connection.receiver;

        receiver.speaking.on("start", userId => {
            if (recordable.has(userId) && !recording.has(userId)) {
                recording.add(userId);

                console.log("user is speaking, starting immediately from join");
                handleAudioStreamDetection(
                    connection,
                    receiver,
                    userId,
                    connection,
                    interaction.channel || undefined,
                );
            }
        });

        receiver.speaking.on("end", userId => {
            recording.delete(userId);
            connection?.receiver.subscriptions.delete(userId);
        });
    } catch (error) {
        console.warn(error);
        await interaction.followUp(
            "Failed to join voice channel within 20 seconds, please try again later!",
        );
    }

    await interaction.editReply({ content: "Ready" });
}

async function startListening(
    interaction: CommandInteraction,
    recordable: Set<Snowflake>,
    _client: Client,
    connection?: VoiceConnection,
) {
    if (connection) {
        // const userId = interaction.options.get('speaker')!.value! as Snowflake;
        const userId = interaction.member?.user.id as Snowflake;
        recordable.add(userId);

        /**
         * if user is already keyed up start immediately
         */
        const receiver = connection.receiver;
        if (connection.receiver.speaking.users.has(userId)) {
            console.log("user is already speaking, starting immediately from startListening");
            handleAudioStreamDetection(
                connection,
                receiver,
                userId,
                connection ?? null,
                interaction?.channel ?? undefined,
            );
        }

        await interaction.reply({ ephemeral: true, content: "Listening!" });
    } else {
        await interaction.reply({
            ephemeral: true,
            content: "Join a voice channel and then try that again!",
        });
    }
}

async function stopListening(
    interaction: CommandInteraction,
    recordable: Set<Snowflake>,
    _client: Client,
    _connection?: VoiceConnection,
) {
    const userId = interaction.member?.user.id as Snowflake;
    recordable.delete(userId);

    // TODO only if last member?
    // connection?.receiver?.voiceConnection?.destroy();
    await interaction.reply({ ephemeral: true, content: "No longer listening to you!" });
}

async function getEmbedForItem(query: string): Promise<EmbedBuilder | null> {
    if (Config.flea_source === "tarkov_dev") {
        return queryItemsTarkovDev(query).then(embedForItemsTarkovDev);
    } else if (Config.flea_source === "tarkov_market") {
        return queryItemsTarkovMarket(query).then(embedForItemsTarkovMarket);
    }
    return null;
}

async function check(
    interaction: CommandInteraction,
    _recordable: Set<Snowflake>,
    _client: Client,
    _connection?: VoiceConnection,
) {
    const query = interaction.options.get("query")!.value! as Snowflake;

    const embed = getEmbedForItem(query).then(embed => {
        if (embed) {
            interaction.reply({ ephemeral: true, embeds: [embed] });
        } else {
            interaction.reply({ ephemeral: true, content: "No results found." });
        }
    });
}

async function leave(
    interaction: CommandInteraction,
    _recordable: Set<Snowflake>,
    _client: Client,
    connection?: VoiceConnection,
) {
    if (connection) {
        connection.destroy();
        await interaction.reply({ ephemeral: true, content: "Left the channel!" });
    } else {
        await interaction.reply({ ephemeral: true, content: "Not playing in this server!" });
    }
}

export const interactionHandlers = new Map<
    string,
    (
        interaction: CommandInteraction,
        recordable: Set<Snowflake>,
        client: Client,
        connection?: VoiceConnection,
    ) => Promise<void>
>();
interactionHandlers.set("join", join);
interactionHandlers.set("start", startListening);
interactionHandlers.set("check", check);
interactionHandlers.set("stop", stopListening);
interactionHandlers.set("leave", leave);
