import { createCommandConfig, logger } from 'robo.js'

const ALLOWED_USERS = [
	'670646662808469536',
	'1105641943721054300'
]

export const config = createCommandConfig({
	description: 'It\'s ggs',
	options: [
		{
			name: 'user',
			description: 'gng is COOKED.',
			type: 'user',
			required: true
		}
	]
})

export default async (interaction) => {
	// Permission check
	if (!ALLOWED_USERS.includes(interaction.user.id)) {
		return interaction.reply({
			content: '🚫 You are not allowed to use this command.',
			ephemeral: true
		})
	}

	// Defer reply to safely edit later
	await interaction.deferReply({ ephemeral: true })

	const target = interaction.options.getUser('user')
	const member = await interaction.guild.members.fetch(target.id)

	logger.info(`Banish used by ${interaction.user.tag} on ${target.tag}`)

	const banishedRole = interaction.guild.roles.cache.find(
		r => r.name.toLowerCase() === 'banished'
	)

	if (!banishedRole) {
		return interaction.editReply({ content: '⚠️ Banished role not found.' })
	}

	if (member.roles.cache.has(banishedRole.id)) {
		return interaction.editReply({ content: `${target} is already banished.` })
	}

	// Bot role hierarchy check
	const botMember = interaction.guild.members.me
	if (banishedRole.position >= botMember.roles.highest.position) {
		return interaction.editReply({
			content: '⚠️ I cannot assign that role because it is higher than my role.'
		})
	}

	// Target hierarchy check
	if (member.roles.highest.position >= botMember.roles.highest.position) {
		return interaction.editReply({
			content: '⚠️ I cannot banish this user because their role is higher than mine.'
		})
	}

	// === Safe banish process ===
	try {
		// Add Banished role safely
		try {
			await member.roles.add(banishedRole)
		} catch (err) {
			logger.warn(`Could not add Banished role to ${target.tag}: ${err?.message || err}`)
			return interaction.editReply('⚠️ I could not add the Banished role.')
		}

		// Disconnect from voice safely
		if (member.voice.channel) {
			try {
				await member.voice.setChannel(null)
			} catch (err) {
				logger.warn(`Could not disconnect ${target.tag} from voice: ${err?.message || err}`)
			}
		}

		// Final confirmation
		await interaction.editReply(`⛏️ ${target} has been **banished to the mines.**`)

	} catch (err) {
		logger.error('Failed to banish user:', err?.message || err)
		await interaction.editReply('⚠️ Something went wrong while trying to banish that user.')
	}
}