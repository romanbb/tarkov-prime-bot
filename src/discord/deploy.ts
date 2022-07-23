import { ApplicationCommandOptionType, Guild } from "discord.js";

export const deploy = async (guild: Guild) => {
	await guild.commands.set([
		{
			name: 'join',
			description: 'Joins the voice channel that you are in',
		},
		{
			name: 'start',
			description: 'Tells the bot to listen to you for flea prices checks.',
		},
        {
			name: 'stop',
			description: 'Tells the bot to stop listening to you for flea price checks.',
		},
        {
			name: 'check',
			description: 'Run a manual lookup with text.',
            options: [
				{
					name: 'query',
					type: ApplicationCommandOptionType.String,
					description: 'The item to query',
					required: true,
				},
			],
		},
		{
			name: 'leave',
			description: 'Leave the voice channel',
		},
	]);
};
