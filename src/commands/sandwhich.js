import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'will the sandwhich gods listen',
})

let total = 0

export default async (interaction) => {
	logger.info(`sandwhich gods summoned by ${interaction.user}`)
	await interaction.deferReply()
    total++
    const responses = [
		"🥪 yeah sorry your basically a fish role so, no sandwhich for you!",
		"🥪 man we do not fw you so, no sandwhich for you!",
		"🥪 go ask the pizza gods peasant cuz no sandwhich for you!",
		"🥪 we ran out of bread.. so, no sandwhich for you!",
		"🥪 tuxxego told me to not give you sandwhiches so.. no sandwhich for you!",
		"🥪 bluenight said you were chill. still, no sandwhich for you!",
		"🥪 you've been blessed, heres a sandwhich.",
        "🥪 lemme ask tuxxego bot if we got any in the back. sorry we out so, no sandwhich for you!",
        "🥪 ill give you a chance. what comes first?"
	];

	const button1 = new ButtonBuilder().setCustomId('lettuce').setStyle(ButtonStyle.Primary).setLabel('lettuce')
	const button2 = new ButtonBuilder().setCustomId('tomato').setStyle(ButtonStyle.Primary).setLabel('tomato')
	const button3 = new ButtonBuilder().setCustomId('cheese').setStyle(ButtonStyle.Primary).setLabel('cheese')
	const row = new ActionRowBuilder().addComponents(button1, button2, button3)

    const sandwhichResult = responses[Math.floor(Math.random() * responses.length)];

    if (sandwhichResult.includes("🥪 ill give you a chance. what comes first?")) {
        interaction.editReply({
			content: `🥪 ill give you a chance. what comes first?`,
			components: [row]
		})
    }

	const message = await interaction.editReply({
		content: `${sandwhichResult}\n> total: ${total}`,
	})

	const sandwhichChoice = message.createMessageComponentCollector({
		filter: (i) => i.customId === 'lettuce' || i.customId === 'tomato' || i.customId === 'cheese',
	})

	sandwhichChoice.on('collect', async (i) => {

		if (i.customId === "lettuce") {
			await i.update({
				content: `🥪 WRONG\n> total: ${total}`,
				components: []
			})
		}

		if (i.customId === "tomato") {
			await i.update({
				content: `🥪 heres a sandwhich, you earned it.\n> total: ${total}`,
				components: []
			})
		}

		if (i.customId === "cheese") {
			await i.update({
				content: `🥪 WRONG\n> total: ${total}`,
				components: []
			})
		}
	})
}