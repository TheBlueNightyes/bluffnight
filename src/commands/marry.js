import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'happily ever after :-)',
	options: [{
		name: 'partner',
		description: 'who u want to spend ur life with?',
		type: 'user',
		required: true
	}]
})

export default async (interaction) => {
	logger.info(`${interaction.user} is proposing!`)
	await interaction.deferReply()
	const button1 = new ButtonBuilder().setCustomId('accept').setStyle(ButtonStyle.Primary).setLabel('accept')
	const button2 = new ButtonBuilder().setCustomId('object').setStyle(ButtonStyle.Primary).setLabel('object')
	const row = new ActionRowBuilder().addComponents(button1, button2)
    const partner = interaction.options.getUser('partner');
	const message = await interaction.editReply({
		content: `${interaction.user} proposes to ${partner}!`,
		components: [row]
	})

	const marriageResult = message.createMessageComponentCollector({
		filter: (i) => i.customId === 'accept' || i.customId === 'object',
	})

	marriageResult.on('collect', async (i) => {

		if (i.customId === "accept") {
			await i.update({
				content: `${interaction.user} proposes to ${partner}! \n ✅ ${partner} accepted!`,
				components: []
			})
		}

		if (i.customId === "object") {
			await i.update({
				content: `${interaction.user} proposes to ${partner}! \n ❌ ${partner} objected!`,
				components: []
			})
		}
	})
}
