import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'absolute cinema',
	options: [{
		name: 'user',
		description: 't-shirt worthy',
		type: 'user',
		required: true
	}]
})

const roasted = [
    "cant code",
    "plays hoi4 on civilian",
    "cant play navalboc",
    "is noob",
    "HAS NOTHING",
    "NO ONE LOVES U, IF THEY SAY THEY DO, THEIR LYING.",
    "KYS KYS KYS KYS",
    "you sound like thick of it",
    "is a liberal",
    "u not pro",
	"brudda is short",
	"retard",
	"bigot, racist, xenophobic, zionist, sexist... everything dude",
	"rosie HATES u",
	"wait, hahahahahahahahahahah!"
];

export default async (interaction) => {
	logger.info(`${interaction.user} roasted`)
	const user = interaction.options.getUser('user')
	const randomRoast = roasted[Math.floor(Math.random() * roasted.length)]

	if (interaction.user.id === user.id) {
		return interaction.reply({
			content: 'are you really this lonely?',
			ephemeral: true,
		})
	}

	await interaction.reply(`${user} ${randomRoast}`)
}