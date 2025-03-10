import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'F to pay respects.',
    options: [{
        name: 'respect',
        description: 'I miss the glory days.',
        type: 'string',
        choices: [
            { name: 'macaroni town', value: 'macaroni town' },
            { name: 'carcer city', value: 'carcer city' }
        ],
        required: true
    }]
})

let macaroniRespected = 0
let carcerRespected = 0

export default (interaction) => {
    logger.info(`${interaction.user} paid respects`)
    const respecting = interaction.options.getString('respect');
    
    if (interaction.options.getString('respect').includes("macaroni town")) {
        macaroniRespected++
        interaction.reply(`${interaction.user} paid respects to ${respecting}\n> total: ${macaroniRespected}`)
    }
    else if(interaction.options.getString('respect').includes("carcer city")) {
        carcerRespected++
        interaction.reply(`${interaction.user} paid respects to ${respecting}\n> total: ${carcerRespected}`)
    }
        
}