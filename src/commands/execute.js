import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'too many ops? well heres the solution',
	options: [{
		name: 'user',
		description: 'what did bro do?!:sob:',
		type: 'user',
		required: true
	}]
})

export default async (interaction) => {
	logger.info(`${interaction.user} is tryna execute someone`)
	await interaction.deferReply()
	const button1 = new ButtonBuilder().setCustomId('execute').setStyle(ButtonStyle.Primary).setLabel('execute')
	const button2 = new ButtonBuilder().setCustomId('spare').setStyle(ButtonStyle.Primary).setLabel('spare')
	const row = new ActionRowBuilder().addComponents(button1, button2)
    const user = interaction.options.getUser('user');

	if (user.bot) {
		await interaction.editReply({
			content: 'not happening lil bro'
		});
	return;
	}

	if (interaction.user.id === user.id) {
		await interaction.editReply({
			content: 'are you really this lonely?'
		});
	return;
	}

	const message = await interaction.editReply({
		content: `${interaction.user} wants to publically execute ${user}`,
		components: [row]
	})

	const executionResult = message.createMessageComponentCollector({
		filter: (i) => i.customId === 'execute' || i.customId === 'spare',
	})

	executionResult.on('collect', async (i) => {
	
		if (i.customId === "execute") {
			await i.update({
				content: `${interaction.user} wants to publically execute ${user} \n ✅ ${user} neutralized!`,
				components: []
			})
		}

		if (i.customId === "spare") {
			await i.update({
				content: `${interaction.user} wants to publically execute ${user} \n ❌ ${user} escaped`,
				components: []
			})
		}
	})
}