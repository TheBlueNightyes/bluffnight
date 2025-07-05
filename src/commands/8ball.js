import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'ask the universe a question',
	options: [{
		name: 'question',
		description: 'ask the universe a question',
		type: 'string',
		required: true
	}]
})

export default (interaction) => {
	logger.info(`8ball used by ${interaction.user}`)
	const question = interaction.options.getString('question');
	const responses = [
		"🎱 It is certian.",
		"🎱 It is decidedly so.",
		"🎱 Without a doubt.",
		"🎱 Yes definitely.",
		"🎱 You may rely on it.",
		"🎱 As I see it, yes.",
		"🎱 Most likely.",
		"🎱 Outlook good.",
		"🎱 Yes.",
		"🎱 Signs point to yes.",
		"🎱 Reply hazy, try again.",
		"🎱 Ask again later.",
		"🎱 Better not tell you now.",
		"🎱 Cannot predict now.",
		"🎱 Concentrate and ask again.",
		"🎱 Don't count on it.",
		"🎱 My reply is no.",
		"🎱 My sources say no.",
		"🎱 Outlook not so good.",
		"🎱 Very doubtful.",
		"🎱 I don't know."
	];
	  
	const ballResponse = responses[Math.floor(Math.random() * responses.length)];
	interaction.reply(`> ${question}\n${ballResponse}`);
};