import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'this aint cookie clicker'
})

export default async (interaction) => {
	logger.info(`Clicker started by ${interaction.user}`)
	await interaction.deferReply()
	const button = new ButtonBuilder().setCustomId('clicker').setStyle(ButtonStyle.Primary).setLabel('click')
	const row = new ActionRowBuilder().addComponents(button)

	let clickCount = 0
	const message = await interaction.editReply({
		content: '0 click(s)',
		components: [row]
	})
	const collector = message.createMessageComponentCollector({
		filter: (i) => i.customId === 'clicker'
	})

	collector.on('collect', async (i) => {
		clickCount++
		await i.update({
			content: `${clickCount} click(s)`
		})
	})
}
