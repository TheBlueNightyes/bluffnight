import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'GAMBLINGGG!!',
    options: [{
        name: 'item',
        description: 'of what?',
        type: 'string',
        required: true
    }]
})

export default (interaction) => {
    logger.info(`${interaction.user} took a chance`)
    const item = interaction.options.getString('item');
    
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    
    let chance = getRandomIntInclusive(1, 100) 

    interaction.reply(`${item} has a ${chance}% chance to happen!`);
};
