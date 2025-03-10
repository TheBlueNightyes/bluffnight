import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { createCommandConfig, logger } from 'robo.js'

const choice = [
	{name: 'rock', beats: 'scissors'},
	{name: 'paper', beats: 'rock'},
	{name: 'scissors', beats: 'paper'}
];

export const config = createCommandConfig({
	description: 'crashout worthy game',
	options: [{
		name: 'opponent',
		description: 'mans an opp',
		type: 'user',
		required: true
	}]
})

export default async (interaction) => {
	logger.info(`${interaction.user} is playing rps!`)
	await interaction.deferReply()
	const button1 = new ButtonBuilder().setCustomId('accept').setStyle(ButtonStyle.Primary).setLabel('accept')
	const button2 = new ButtonBuilder().setCustomId('object').setStyle(ButtonStyle.Primary).setLabel('object')
	const button3 = new ButtonBuilder().setCustomId('rock').setStyle(ButtonStyle.Primary).setLabel('rock')
	const button4 = new ButtonBuilder().setCustomId('paper').setStyle(ButtonStyle.Primary).setLabel('paper')
	const button5 = new ButtonBuilder().setCustomId('scissors').setStyle(ButtonStyle.Primary).setLabel('scissors')
	const row1 = new ActionRowBuilder().addComponents(button1, button2)
	const row2 = new ActionRowBuilder().addComponents(button3, button4, button5)
    const opponent = interaction.options.getUser('opponent');

	if (interaction.user.id === opponent.id) {
		await interaction.editReply({
			content: 'are you really this lonely?'
		});
	return;
	}

	else if (opponent.bot) {
		await interaction.editReply({
			content: 'not happening lil bro'
		});
	return;
	}

	const message = await interaction.editReply({
		content: `${interaction.user} challenges ${opponent}!`,
		components: [row1]
	});

	const marriageResult = message.createMessageComponentCollector({
		filter: (i) => i.customId === 'rock' || i.customId === 'paper' || i.customId === 'scissors',
	})

	marriageResult.on('collect', async (i) => {
		if (i.customId === "rock") {
			await i.update({
				content: `${interaction.user} proposes to ${opponent}! \n ✅ ${opponent} rocked!`,
				components: []
			})
		}

		if (i.customId === "paper") {
			await i.update({
				content: `${interaction.user} proposes to ${opponent}! \n ❌ ${opponent} papered!`,
				components: []
			})
		}

		if (i.customId === "scissors") {
			await i.update({
				content: `${interaction.user} proposes to ${opponent}! \n ❌ ${opponent} scissored!`,
				components: []
			})
		}
	})
}
