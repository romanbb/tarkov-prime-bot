import {
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import {
    Client,
    CommandInteraction,
    GuildMember,
    Snowflake,
    TextChannel,
    VoiceBasedChannel,
    EmbedBuilder,
    TextBasedChannel,
    GuildTextBasedChannel,
} from "discord.js";
import Config from "../config.json";

import {
    queryItems as queryItemsTarkovMarket,
    embedForItems as embedForItemsTarkovMarket,
} from "../flea/tarkov-market";
import {
    queryItem as queryItemsTarkovDev,
    embedForItems as embedForItemsTarkovDev,
} from "../flea/tarkov-dev";
import { UserState } from "../user-state";
import { opus } from "prism-media";
import { textToSpeach } from "../audio";

const recording = new Set<Snowflake>();

const activeStreams = new Map<Snowflake, UserState>();
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

        console.log("interactions :: registering start and end listeners");
        receiver.speaking.on("start", setupStartEvent(connection, _textChannel));
        // let it end naturally, listening to end results in race conditions previously
        // receiver.speaking.on("end", endEvent);
    } catch (error) {
        console.error(error);
    }
}

const setupStartEvent = (
    connection: VoiceConnection,
    channel: TextBasedChannel | GuildTextBasedChannel,
) => {
    return userId => {
        // if (!recording.has(userId)) {
        // recording.add(userId);

        console.log(`+${userId} 💬 started talking`);

        const userState = activeStreams.get(userId) ?? new UserState(userId);
        activeStreams.set(userId, userState);

        userState.onNewStream(connection, channel);
        // }
    };
};

const endEvent = userId => {
    // recording.delete(userId);
    // const endingStreams = activeStreams.get(userId);
    // activeStreams.delete(userId);
    // console.log(`-${userId} 💬 done speaking for stream ${endingStreams}`);
    // endingStreams.onUserStoppedTalking();
};

async function join(
    interaction: CommandInteraction,
    recordable: Set<Snowflake>,
    _client: Client,
    connection?: VoiceConnection,
) {
    console.log("join called");
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

        receiver.speaking.on("start", setupStartEvent(connection, interaction.channel));
        receiver.speaking.on("end", endEvent);
        console.log("registered for speaking events");
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
        // recordable.add(userId);

        // /**
        //  * if user is already keyed up start immediately
        //  */
        // const receiver = connection.receiver;
        // if (connection.receiver.speaking.users.has(userId)) {
        //     console.log("user is already speaking, starting immediately from startListening");
        //     handleAudioStreamDetection(
        //         connection,
        //         receiver,
        //         userId,
        //         connection ?? null,
        //         interaction?.channel ?? undefined,
        //     );
        // }

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
