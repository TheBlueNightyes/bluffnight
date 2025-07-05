import { ActionRowBuilder, EmbedBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { createCommandConfig, client } from 'robo.js'

export const config = createCommandConfig({
	description: 'make fancy stuff'
})

export default async (interaction) => {
	const modal = new ModalBuilder()
		.setCustomId('embedCreator')
		.setTitle('Embed Creator')

	const title = new TextInputBuilder()
		.setCustomId('title')
		.setPlaceholder('The embeds title..')
		.setLabel('Title')
		.setStyle(TextInputStyle.Short)
		.setRequired(false)
	
	const description = new TextInputBuilder()
		.setCustomId('description')
		.setPlaceholder('The embeds description..')
		.setLabel('Description')
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(false)
	
	const color = new TextInputBuilder()
		.setCustomId('color')
		.setPlaceholder('5865F2 for blurple')
		.setLabel('Color')
		.setStyle(TextInputStyle.Short)
		.setRequired(false)

	const image = new TextInputBuilder()
		.setCustomId('image')
		.setPlaceholder('The embeds thumbnail..')
		.setLabel('Image')
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(false)

	const embedTitle = new ActionRowBuilder()
		.addComponents(title)
	
	const embedDescription = new ActionRowBuilder()
		.addComponents(description)

	const embedColor = new ActionRowBuilder()
		.addComponents(color)

	const embedImage = new ActionRowBuilder()
		.addComponents(image)

	modal.addComponents(embedTitle, embedDescription, embedColor, embedImage)

	interaction.showModal(modal)

	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isModalSubmit()) return;
		await interaction.deferReply()
		if (interaction.customId == 'embedCreator') {
			const title = interaction.fields.getTextInputValue('title');
			const description = interaction.fields.getTextInputValue('description');
			const color = interaction.fields.getTextInputValue('color');
			const image = interaction.fields.getTextInputValue('image');

			const embed = new EmbedBuilder()
				.setTitle(`${title}`)
				.setDescription(`${description}`)
				.setColor(`${color}`)
				.setImage(`${image}`)

			await interaction.channel.send({ embeds: [embed] })
			await interaction.deleteReply()
		}
	})

}