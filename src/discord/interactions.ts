import { entersState, getVoiceConnection, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus, VoiceReceiver } from '@discordjs/voice';
import { Client, CommandInteraction, GuildMember, Snowflake, TextBasedChannel, TextChannel, VoiceBasedChannel, VoiceChannel, EmbedBuilder, GuildTextBasedChannel } from 'discord.js';
import { handleAudioStream } from '../bot';
import { subscribeOpusStream } from './createListeningStream';
import Config from '../config.json'

import * as prism from 'prism-media';
import { queryItems as queryItemsTarkovMarket, embedForItems as embedForItemsTarkovMarket, getTtsString as getTtsStringTarkovMarket } from '../flea/tarkov-market';
import { queryItem as queryItemsTarkovDev, embedForItems as embedForItemsTarkovDev, getTtsString as getTtsStringTarkovDev } from '../flea/tarkov-dev';
import { doesStreamTriggerActivation } from '../voice-detection/vosk';
import { PassThrough, pipeline, Stream } from 'stream';

const recording = new Set<Snowflake>();

/**
 * Debug helper
 * @param recordable 
 * @param userId 
 * @param voiceChannel 
 * @param textChannel 
 */
export async function joinAndListen(recordable: Set<Snowflake>, userId: Snowflake, voiceChannel?: VoiceBasedChannel, _textChannel?: TextChannel) {
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
    recordable.add(userId);

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
        const receiver = connection.receiver;

        receiver.speaking.on('start', async (userId) => {
            if (!recording.has(userId)) {
                recording.add(userId);
                
                // console.log(`+${userId} 💬 listening from joinAndListen`)
                handleAudioStreamDetection(receiver, userId, connection, _textChannel ?? undefined);
            }
        });

        receiver.speaking.on('end', (userId) => {
            recording.delete(userId);
            connection?.receiver.subscriptions.delete(userId);
            // console.log(`-${userId} 💬 done from joinAndListen`)
        })
    } catch (error) {
        console.warn(error);
    }
}

async function handleAudioStreamDetection(receiver: VoiceReceiver, userId: Snowflake, connection?: VoiceConnection, textChannel?: TextBasedChannel | GuildTextBasedChannel) {
    const opusStream = subscribeOpusStream(receiver, userId);

	const oggStream = new prism.opus.OggLogicalBitstream({
		opusHead: new prism.opus.OpusHead({
			channelCount: 2,
			sampleRate: 48000,
		}),
		// pageSizeControl: {
		// 	maxPackets: 10,
		// },
	});

    // opusStream.on("end", () => {
    //     receiver.subscriptions.get(userId)?.destroy();
    // });

	pipeline(opusStream, oggStream, (err) => {
		if (err) {
			console.warn(`❌ Error recording stream err: ${err.message}`);
		}
		//  else {
		// 	console.log(`✅ Recording stream`);
		// }
	});
    const audioStream = new PassThrough(); // Stream chunk less than 1 KB
    oggStream.pipe(audioStream)
    
    if (await doesStreamTriggerActivation(oggStream)) {
        console.log("triggered activation!!!")
        // copy detection stream into a new stream

        await handleAudioStream(audioStream, connection ?? null, textChannel ?? null);
    }
    opusStream.unpipe();
    oggStream.unpipe();
    audioStream.unpipe();
    if (!oggStream.destroyed) {
        oggStream.destroy();
    }
    if (!audioStream.destroyed) {
        audioStream.destroy();
    }
    if (!opusStream.destroyed) {
        opusStream.destroy();
    }
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
            await interaction.followUp({ content: 'Join a voice channel and then try that again!', ephemeral: true });
            return;
        }
    }

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
        const receiver = connection.receiver;

        receiver.speaking.on('start', (userId) => {
            if (recordable.has(userId) && !recording.has(userId)) {
                recording.add(userId);

                console.log("user is speaking, starting immediately from join")
                handleAudioStreamDetection(receiver, userId, connection, interaction.channel || undefined);
            }
        });

        receiver.speaking.on('end', (userId) => {
            recording.delete(userId);

        })
    } catch (error) {
        console.warn(error);
        await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!');
    }

    await interaction.editReply({ content: 'Ready' });
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
            console.log("user is already speaking, starting immediately from startListening")
            handleAudioStreamDetection(receiver, userId, connection ?? null, interaction?.channel ?? undefined);
        }

        await interaction.reply({ ephemeral: true, content: 'Listening!' });
    } else {
        await interaction.reply({ ephemeral: true, content: 'Join a voice channel and then try that again!' });
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
    await interaction.reply({ ephemeral: true, content: 'No longer listening to you!' });
}

async function getEmbedForItem(query: string): Promise<EmbedBuilder | null> {
    if (Config.flea_source === "tarkov_dev") {
        return queryItemsTarkovDev(query)
            .then(embedForItemsTarkovDev)
    } else if (Config.flea_source === "tarkov_market") {
        return queryItemsTarkovMarket(query)
            .then(embedForItemsTarkovMarket)
    }
    return null
}


async function check(
    interaction: CommandInteraction,
    _recordable: Set<Snowflake>,
    _client: Client,
    _connection?: VoiceConnection,
) {
    const query = interaction.options.get('query')!.value! as Snowflake;

    const embed = getEmbedForItem(query)
        .then(embed => {
            if (embed) {
                interaction.reply({ ephemeral: true, embeds: [embed] });
            } else {
                interaction.reply({ ephemeral: true, content: 'No results found.' });
            }
        })
}


async function leave(
    interaction: CommandInteraction,
    _recordable: Set<Snowflake>,
    _client: Client,
    connection?: VoiceConnection,
) {
    if (connection) {
        connection.destroy();
        await interaction.reply({ ephemeral: true, content: 'Left the channel!' });
    } else {
        await interaction.reply({ ephemeral: true, content: 'Not playing in this server!' });
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
interactionHandlers.set('join', join);
interactionHandlers.set('start', startListening);
interactionHandlers.set('check', check);
interactionHandlers.set('stop', stopListening);
interactionHandlers.set('leave', leave);
