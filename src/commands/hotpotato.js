import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'literal torture',
	options: [{
		name: 'person',
		description: 'ts wild',
		type: 'string',
		required: true
	}]
})

export default async (interaction) => {
	logger.info(`${interaction.user} started a game of hotpotato`)
	await interaction.deferReply()
    const person = interaction.options.getString('person');
	const message = await interaction.editReply({
		content: `🥔 ${interaction.user} passed the potato to ${person}`,
	})
}
