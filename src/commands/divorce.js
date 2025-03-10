import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { createCommandConfig } from 'robo.js'

export const config = createCommandConfig({
	description: 'NOT a happily ever after'
})

export default (interaction) => {
	const modal = new ModalBuilder().setTitle('Say something!').setCustomId('say')

	const input = new TextInputBuilder()
		.setCustomId('message')
		.setPlaceholder('Type something...')
		.setLabel('Message')
		.setStyle(TextInputStyle.Paragraph)

	const question = new ActionRowBuilder().addComponents(input)

	modal.addComponents(question)

	interaction.showModal(modal)

    logger.info(`${interaction.user} made bluffnight say something`)
    const text = interaction.options.getString('message');
    interaction.reply(`${text}`);
}

