import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'mans is not shakesphere',
	options: [{
		name: 'quote',
		description: 'lets see your shakesphere!',
		type: 'string',
		required: true
	}]
})

export default (interaction) => {
	logger.info(`Quote created by ${interaction.user}`)
		const quote = interaction.options.getString('quote');
		interaction.reply(`"${quote}"\n- ${interaction.user}`);
};