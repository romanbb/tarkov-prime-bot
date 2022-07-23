import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { Client, CommandInteraction, GuildMember, Snowflake } from 'discord.js';
import { queryItems } from '../tarkov-market';
import { embedForItems } from '../text';
import { handleAudioStream } from '../bot';
import { createListeningStream } from './createListeningStream';

const recording = new Set<Snowflake>()

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
				const audioStream = createListeningStream(receiver, userId);
				handleAudioStream(audioStream, connection ?? null, interaction.channel);
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
			const audioStream = createListeningStream(receiver, userId);
			handleAudioStream(audioStream, connection, interaction.channel);
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
	connection?: VoiceConnection,
) {
	const userId = interaction.member?.user.id as Snowflake;
	recordable.delete(userId);
	connection?.receiver?.voiceConnection?.destroy();
	await interaction.reply({ ephemeral: true, content: 'No longer listening to you!' });
}


async function check(
	interaction: CommandInteraction,
	_recordable: Set<Snowflake>,
	_client: Client,
	_connection?: VoiceConnection,
) {
	const query = interaction.options.get('query')!.value! as Snowflake;
	queryItems(query)
		.then(items => {
			const embed = embedForItems(items)
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
