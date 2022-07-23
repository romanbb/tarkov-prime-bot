import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { Client, CommandInteraction, GuildMember, Snowflake } from 'discord.js';
import { handleAudioStream } from '../bot';
import { createListeningStream } from './createListeningStream';

async function join(
	interaction: CommandInteraction,
	recordable: Set<Snowflake>,
	_client: Client,
	connection?: VoiceConnection,
) {
	await interaction.deferReply();
	if (!connection) {
		if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
			const channel = interaction.member.voice.channel;
			connection = joinVoiceChannel({
				channelId: channel.id,
				guildId: channel.guild.id,
				selfDeaf: false,
				selfMute: true,
				adapterCreator: channel.guild.voiceAdapterCreator,
			});
		} else {
			await interaction.followUp({content: 'Join a voice channel and then try that again!', ephemeral: true});
			return;
		}
	}

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
		const receiver = connection.receiver;

		receiver.speaking.on('start', (userId) => {
			console.log("on speaking start", userId)
			if (recordable.has(userId)) {

				const audioStream = createListeningStream(receiver, userId);
				handleAudioStream(audioStream, connection ?? null, interaction.channel);
			}
		});
	} catch (error) {
		console.warn(error);
		await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!');
	}

	await interaction.followUp({ content: 'Ready!', ephemeral: true });
}

async function record(
	interaction: CommandInteraction,
	recordable: Set<Snowflake>,
	_client: Client,
	connection?: VoiceConnection,
) {
	if (connection) {
		const userId = interaction.options.get('speaker')!.value! as Snowflake;
		recordable.add(userId);

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

async function leave(
	interaction: CommandInteraction,
	recordable: Set<Snowflake>,
	_client: Client,
	connection?: VoiceConnection,
) {
	if (connection) {
		connection.destroy();
		recordable.clear();
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
interactionHandlers.set('record', record);
interactionHandlers.set('leave', leave);
