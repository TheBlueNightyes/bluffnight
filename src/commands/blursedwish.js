import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'DONT BE ME'
})

const wish = [
    "ON EVERYTHING",
    "ON fares",
    "ON lazy",
    "ON I cant smell you",
    "ON tuxxego",
    "ON nephy",
    "ON maccaroni",
    "ON your family",
    "ON your friends",
    "ON bluffnight",
    "ON dank"
    ];

const wishedOn = [
    "gta6 will come out",
    "tuxxego bot isn't gay",
    "fares likes men",
    "I can smell you, can't smell you",
    "breadcat isnt racist",
    "mrbeast is innocent",
    "kanye is ye!",
    "FREE PUFF",
    "LAZY DESTROYED CARCER CITY",
    "firebirds mod is the best",
    "wb update will be after gta6"
]

export default (interaction) => {
	logger.info(`${interaction.user} generated a blursed wish`)
    const wishResult = wish[Math.floor(Math.random() * wish.length)];
    const wishedOnResult = wishedOn[Math.floor(Math.random() * wishedOn.length)];
	interaction.reply(`${wishedOnResult} ${wishResult}`);
};
