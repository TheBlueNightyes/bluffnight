import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'experience',
	options: [{
        name: 'interaction',
        description: 'naughty or nice? be sure to check twice!',
        type: 'string',
        choices: [
            { name: 'hug', value: 'hug' },
            { name: 'kiss', value: 'kiss' },
            { name: 'dance', value: 'dance' }
        ],
        required: true
    },
    {
        name: 'user',
		description: 'target',
		type: 'user',
		required: true
    }]
})

export default (interaction) => {
	logger.info(`interaction used by ${interaction.user}`)
	const user = interaction.options.getUser('user');

    if (interaction.options.getString('interaction').includes("hug")) {
        interaction.reply(`${interaction.user} hugged ${user}`)
    }
    else if(interaction.options.getString('interaction').includes("kiss")) {
        interaction.reply(`${interaction.user} kissed ${user}`)
    }
    else if(interaction.options.getString('interaction').includes("dance")) {
        interaction.reply(`${interaction.user} danced with ${user}!`)
    }
};