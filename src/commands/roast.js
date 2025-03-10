import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'grab some popcorn',
    options: [
        {
			name: 'user',
            description: 'is mans cooked?',
            type: 'user',
            required: true,
        },
        {
            name: 'roast',
            description: 'THIS WILL BE PEAK',
            type: 'string',
            required: true,
        }
    ]
})

export default async (interaction) => {
	logger.info(`${interaction.user} roasted`)
    const user = interaction.options.getUser('user');
    const roast = interaction.options.getString('roast');

	if (user.bot) {
		await interaction.editReply({
			content: 'not happening lil bro',
		});
	return;
	}

	else if (interaction.user.id === user.id) {
		await interaction.editReply({
			content: 'are you really this lonely?',
		});
	return;
	}

	interaction.reply(`${user} ${roast}`);
};