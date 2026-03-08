import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'rip bro',
	options: [{
		name: 'wish',
		description: 'on a shooting..?',
		type: 'string',
		required: true
	}]
})

const wishedOn = [
    "EVERYTHING",
    "fares",
    "lazy",
    "I can smell you",
    "tuxxego",
    "nephy",
    "maccaroni",
    "your family",
    "your friends",
    "firebird",
    "christmas",
    "the worldbox update",
    "content warning",
    "me",
    "gta6",
    "repo",
    "peanut"
];

export default (interaction) => {
	logger.info(`${interaction.user} wished`)
    const wishResult = wishedOn[Math.floor(Math.random() * wishedOn.length)];
    const wish = interaction.options.getString('wish');
	interaction.reply(`${wish} ON ${wishResult}`);
};