import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'useful for women',
    options: [{
        name: 'user',
        description: 'getting a tv show',
        type: 'user',
        required: true
    }]
})

export default (interaction) => {
    logger.info(`Weight estimated by ${interaction.user}`)
    const user = interaction.options.getUser('user');
    
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    
    let weight = getRandomIntInclusive(70, 600) 

    interaction.reply(`${user} is approximately ${weight} lbs!`);
};