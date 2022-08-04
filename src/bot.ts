
import { getVoiceConnection, VoiceConnection } from '@discordjs/voice';
import { GatewayIntentBits } from 'discord-api-types/v10';
import Discord, { Events, GuildTextBasedChannel, Interaction, TextBasedChannel, TextChannel } from 'discord.js';
import type Stream from 'stream';
import { textToSpeach } from './audio';
import { transcribeStream } from './aws';
import Environment from './config.env';
import Config from './config.json';
import { deploy } from './discord/deploy';
import { interactionHandlers, joinAndListen } from './discord/interactions';
import { queryItems as queryItemsTarkovMarket, embedForItems as embedForItemsTarkovMarket, TarkovMarketItemResult, getTtsString as getTtsStringTarkovMarket } from './flea/tarkov-market';
import * as TarkovDev from './flea/tarkov-dev.types'
import { queryItem as queryItemsTarkovDev, embedForItems as embedForItemsTarkovDev, getTtsString as getTtsStringTarkovDev } from './flea/tarkov-dev';

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ],
});

client.on(Events.ClientReady, () => {
    /**
     * Try to auto join a dev voice channel and begin listening to the developer
     */
    if (Environment.debug) {
        if (Environment.discord.auto_deploy_guild_id && Environment.discord.dev_user_to_auto_listen) {
            client.guilds.fetch(Environment.discord.auto_deploy_guild_id)
                .then(deploy)
                .then(async () => {
                    const voiceChannel = client.guilds.cache.get(Environment.discord.auto_deploy_guild_id!)?.
                        members.cache.get(Environment.discord.dev_user_to_auto_listen!)?.
                        voice.channel;
                    const textChannel = await client.channels.fetch(Environment.discord.dev_force_input_channel!) as TextChannel;
                    if (voiceChannel) {
                        joinAndListen(recordable, Environment.discord.dev_user_to_auto_listen!, voiceChannel ?? undefined, textChannel);
                    }

                    // queryItemsTarkovDev("SJ6")
                    //     .then(items => onItemsFoundForTarkovDev(textChannel, items, null))
                    //     .catch(console.warn)

                    //queryItems("ulach")
                    //    .then(items => onItemsFoundForTarkovMarket(textChannel, items, null))
                    //    .then();
                })
                .catch(console.warn);

        } else if (Environment.discord.auto_deploy_guild_id) {
            // still only one consumer :D
            client.guilds.fetch(Environment.discord.auto_deploy_guild_id)
                .then(deploy)
                .catch(console.warn);
        }

        console.log('Ready!');
    }
});
client.on(Events.MessageCreate, async (message) => {
    if (!message.guild) return;
    if (!client.application?.owner) await client.application?.fetch();

    if (message.content.toLowerCase() === '!deploy' && message.author.id === client.application?.owner?.id) {
        await deploy(message.guild);
        await message.reply('Deployed!');
    }
});

/**
 * The IDs of the users that can be recorded by the bot.
 */
const recordable = new Set<string>();

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;

    const handler = interactionHandlers.get(interaction.commandName);

    try {
        if (handler) {
            await handler(interaction, recordable, client, getVoiceConnection(interaction.guildId));
        } else {
            await interaction.reply('Unknown command');
        }
    } catch (error) {
        console.warn(error);
    }
});

client.on(Events.Error, console.warn);

/**
 * @param string transcript to look for phrases to pull keywords out of
 * @returns the keyword to lookup if one was found
 */
async function processTranscript(string: string | undefined): Promise<string | undefined> {
    var result = undefined;
    if (string) {
        console.log("💬 Processing transcript: ", string);
        const regexCollection = Config.key_phrases.flatMap(phrase => `${phrase}`)

        regexCollection.forEach((regex) => {
            const match = string.toLowerCase().match(regex);

            if (match && match.length > 0) {
                // console.log("found item", match[1]);
                result = match[1];
            }
        });
    }
    return result;
}

/**
 * Primary entry point into bot logic
 * @param audioStream the audio stream we will process
 * @param voiceConnection the voice connection to speak the result back
 * @param textChannelOutput the text channel to output result back
 */
export async function handleAudioStream(
    audioStream: Stream.Readable,
    voiceConnection: VoiceConnection | null,
    textChannelOutput: TextBasedChannel | GuildTextBasedChannel | null) {

    transcribeStream(undefined, audioStream)
        .then(processTranscript)
        .then(query => handleQueryItemsInternal(query, voiceConnection, textChannelOutput))
        .catch(error => {
            console.error("❌ Error in transcribe process", error);
        })
}

async function handleQueryItemsInternal(
    query: string | undefined,
    voiceConnection: VoiceConnection | null,
    textChannelOutput: TextBasedChannel | GuildTextBasedChannel | null) {
    if (Config.flea_source === "tarkov_dev") {
        return queryItemsTarkovDev(query)
            .then(items => onItemsFoundForTarkovDev(textChannelOutput, items, voiceConnection))
    } else if (Config.flea_source === "tarkov_market") {
        return queryItemsTarkovMarket(query)
            .then(items => onItemsFoundForTarkovMarket(textChannelOutput, items, voiceConnection))
    } else {
        throw new Error("⚠️ config.json misconfigured!! -- please set 'flea_source' to a proper value")
    }
}

export async function onItemsFoundForTarkovDev(
    textChannel: TextBasedChannel | GuildTextBasedChannel | null,
    items: TarkovDev.Item[] | null,
    voiceConnection: VoiceConnection | null) {
    if (textChannel && items) {
        const embed = embedForItemsTarkovDev(items);
        if (embed) {
            textChannel.send({ embeds: [embed] })
        }
    }
    if (voiceConnection && items?.[0]) {
        const speech = getTtsStringTarkovDev(items[0])
        if (speech) {
            textToSpeach(speech, voiceConnection)
        }
    }
}

export async function onItemsFoundForTarkovMarket(
    textChannel: TextBasedChannel | GuildTextBasedChannel | null,
    items: TarkovMarketItemResult[] | null,
    voiceConnection: VoiceConnection | null) {

    if (textChannel && items) {
        const embed = embedForItemsTarkovMarket(items);
        if (embed) {
            textChannel.send({ embeds: [embed] });
        }
    }
    if (voiceConnection && items && items[0]) {
        const mainItem = items[0];

        const text = getTtsStringTarkovMarket(mainItem)
        if (text) {
            textToSpeach(text, voiceConnection);
        }
    }
}

void client.login(Environment.discord.token);

const cleanup = (options: { exit?: boolean }) => {
    // client.guilds.cache.forEach((guild) => {
    //     getVoiceConnection(guild.id)?.destroy();
    // });
    if (options.exit) {
        console.log("💀 Exiting by request from system");
        process.exit();
    }
}

// cleanup bot on exit, disconnect from channel, etc
process.addListener('exit', () => cleanup({ exit: true }));
process.addListener('SIGINT', () => cleanup({ exit: true }));
process.addListener('SIGABRT', () => cleanup({ exit: true }));
