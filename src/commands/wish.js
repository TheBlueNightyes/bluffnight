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
    "ON EVERYTHING",
    "ON fares",
    "ON lazy",
    "ON I can smell you",
    "ON tuxxego",
    "ON nephy",
    "ON maccaroni",
    "ON your family",
    "ON your friends",
    "ON firebird",
    "ON christmas",
    "ON the worldbox update",
    "ON content warning",
    "ON me",
    "ON gta6",
    "ON repo",
    "ON peanut"
    ];

export default (interaction) => {
	logger.info(`${interaction.user} wished`)
    const wishResult = wishedOn[Math.floor(Math.random() * wishedOn.length)];
    const wish = interaction.options.getString('wish');
	interaction.reply(`${wish} ${wishResult}`);
};
