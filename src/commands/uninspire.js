import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'life is meaningless',
})

const quote = [
    "your worthless",
    "every second you try to do something, elon musk just made millions. give up.",
    "give up",
    "trying is the first step toward failure",
    "if you didnt sit on your fatass and generate commands all day, maybe you wouldnt have the same worth as a fish rank",
    "do what makes you depressed; don't do what makes you anxious.",
    "the reward for good work is more work",
    "not everything is a lesson. sometimes you just fail",
    "hope is the first step towards disappointment",
    "not everything happens for a reason. sometimes life just sucks"
];

export default (interaction) => {
	logger.info(`${interaction.user} generated an uninspiring quote`)
    const uninspiringQuote = quote[Math.floor(Math.random() * quote.length)];

	interaction.reply(`"${uninspiringQuote}"`);
};