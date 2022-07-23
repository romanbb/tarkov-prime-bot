
import { getVoiceConnection, VoiceConnection } from '@discordjs/voice';
import { GatewayIntentBits } from 'discord-api-types/v10';
import Discord, { EmbedBuilder, Events, Interaction, TextBasedChannel } from 'discord.js';
import Config from './config.json';
import Environment from './config.env';
import type Stream from 'stream';
import { deploy } from './discord/deploy';
import { interactionHandlers } from './discord/interactions';
import { synthesizeSpeech, transcribeStream } from './aws';
import { queryItems, TarkovMarketItemResult } from './tarkov-market';
import { formatRubles, kFormatter } from './utils';
import { textToSpeach } from './commands/audio';

const client = new Discord.Client({
	intents: [
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ],
});

client.on(Events.ClientReady, () => {
    if (Environment.discord.dev_guild_id) {
        client.guilds.fetch(Environment.discord.dev_guild_id)
            .then(deploy)
    }
    console.log('Ready!')});
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
        console.log("💬 processing transcript: ", string);
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
export async function handleAudioStream(audioStream: Stream.Readable,  voiceConnection: VoiceConnection | null, textChannelOutput: TextBasedChannel | null) {
    transcribeStream(undefined, audioStream)
                    .then(processTranscript)
                    .then(queryItems)
                    .then(items => onItemsFound(textChannelOutput, items, voiceConnection))
                    .catch(error => {
                        console.error("Error in transcribe process", error);
                    })
}

export async function onItemsFound(textChannel: TextBasedChannel | null, items: TarkovMarketItemResult[] | null, voiceConnection: VoiceConnection | null) {
    if (textChannel && items && items[0]) {
        const mainItem = items[0];
        const embed = new EmbedBuilder()
            .setTitle(mainItem.shortName)
            .setURL(mainItem.wikiLink)
            .setDescription(mainItem.name)
            .setAuthor({ name: "Tarkov Prime Flea Lookup", url: mainItem.link })
            // .setImage(mainItem.imgBig)
            .setThumbnail(mainItem.icon)
            .addFields(
                { name: "Average 24h Flea Price", value: formatRubles(mainItem.avg24hPrice) },
                { name: "Average 7d Price Flea", value: formatRubles(mainItem.avg7daysPrice) },
                { name: "Sell to " + mainItem.traderName, value: formatRubles(mainItem.traderPrice) }
            );

        if (items[1]) {
            embed.addFields(
                { name: '\u200B', value: 'Other results' },
                { name: items[1].name, value: formatRubles(items[1].avg24hPrice), inline: true }
            );
        }
        if (items[2]) {
            embed.addFields(
                { name: items[2].name, value: formatRubles(items[2].avg24hPrice), inline: true }
            );
        }

        if (items.length > 2) {
            embed.setFooter({ text: `${items.length} results found. Try narrowing your query!` });
        }
        textChannel.send({ embeds: [embed] });
    }
    if (voiceConnection && items && items[0]) {
        const mainItem = items[0];

        let text;
        if (mainItem.bannedOnFlea) {
            text = `${mainItem.shortName} sells to ${mainItem.traderName} for ${kFormatter(mainItem.traderPrice)}`;
        } else {
            text = `${mainItem.shortName} going for ${kFormatter(mainItem.avg24hPrice)}`;
        }

        textToSpeach(text, voiceConnection);
    }
}




void client.login(Environment.discord.token);
