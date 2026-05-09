import fs from 'fs'
import path from 'path'
import { ActionRowBuilder, EmbedBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { createCommandConfig, client } from 'robo.js'

const PEOPLE_FILE = path.resolve('src/storage/people.json')
const ECONOMY_FILE = path.resolve('src/storage/economy.json')

function loadJSON(file) {
	if (!fs.existsSync(file)) return {}
	const raw = fs.readFileSync(file, 'utf-8').trim()
	if (!raw) return {}
	try {
		return JSON.parse(raw)
	} catch (err) {
		logger.error(`Failed to parse ${file}:`, err)
		return {}
	}
}

function saveJSON(file, data) {
	try {
		fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
	} catch (err) {
		logger.error(`Failed to save ${file}:`, err)
	}
}

export const config = createCommandConfig({
	description: 'lets divorce'
})

export default async (interaction) => {
	const userId = interaction.user.id
	const guildId = interaction.guild.id

	const people = loadJSON(PEOPLE_FILE)

	const user = people?.[guildId]?.users?.[userId]

	if (!user?.partner) {
		return interaction.reply({
			content: 'lonely ahh',
			ephemeral: true
		})
	}

	const modal = new ModalBuilder()
		.setCustomId('divorceQuiz')
		.setTitle('Relationship Assessment')

	const makeQ = (id, label) =>
		new TextInputBuilder()
			.setCustomId(id)
			.setLabel(label)
			.setStyle(TextInputStyle.Short)
			.setRequired(true)

	modal.addComponents(
		new ActionRowBuilder().addComponents(
			makeQ('q1', 'Do you say goodnight first? (yes/no)')
		),
		new ActionRowBuilder().addComponents(
			makeQ('q2', 'Do you send more memes? (yes/no)')
		),
		new ActionRowBuilder().addComponents(
			makeQ('q3', 'Do you apologize first? (yes/no)')
		),
		new ActionRowBuilder().addComponents(
			makeQ('q4', 'Do you initiate most plans? (yes/no)')
		)
	)

	await interaction.showModal(modal)

	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isModalSubmit()) return
		if (interaction.customId !== 'divorceQuiz') return

		await interaction.deferReply()

		const guildId = interaction.guild.id
		const userId = interaction.user.id

		const people = loadJSON(PEOPLE_FILE)
		const economy = loadJSON(ECONOMY_FILE)

		const user = people?.[guildId]?.users?.[userId]
		const partnerId = user?.partner?.id

		if (!partnerId) {
			return interaction.editReply({
				content: '💔 Marriage data missing.',
				embeds: []
			})
		}

		const answers = ['q1', 'q2', 'q3', 'q4'].map(id =>
			interaction.fields.getTextInputValue(id).toLowerCase()
		)

		let score = 0
		for (const a of answers) {
			if (a.includes('yes') || a.includes('y')) score++
		}

		const isGirl = score >= 3

		// economy structure
		if (!economy[guildId]) economy[guildId] = { users: {} }
		if (!economy[guildId].users[userId]) economy[guildId].users[userId] = { crack: 0 }
		if (!economy[guildId].users[partnerId]) economy[guildId].users[partnerId] = { crack: 0 }

		const userEco = economy[guildId].users[userId]
		const partnerEco = economy[guildId].users[partnerId]

		const embed = new EmbedBuilder()

		if (isGirl) {
			people[guildId].users[userId].partner = null
			people[guildId].users[partnerId].partner = null

			embed
				.setColor('#ff69b4')
				.setTitle('💅 Court Verdict')
				.setDescription(`
                    ## Result: Girlfriend

                    No financial penalties applied.
                    Marriage annulled peacefully.
				`)
		}

		else {
			const loss = Math.floor(userEco.crack * 0.5)

			userEco.crack -= loss
			partnerEco.crack += loss

			people[guildId].users[userId].partner = null
			people[guildId].users[partnerId].partner = null

			embed
				.setColor('#5865F2')
				.setTitle('💸 Court Verdict')
				.setDescription(`
                    ## Result: Boyfriend

                    Provider classification confirmed.
                    50% of assets transferred to partner.
                    Marriage forcibly dissolved.
				`)
		}

		saveJSON(PEOPLE_FILE, people)
		saveJSON(ECONOMY_FILE, economy)

		await interaction.editReply({ embeds: [embed] })
	})
}