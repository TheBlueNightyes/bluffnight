import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'choo choo!',
    options: [{
		name: 'location',
		description: 'where to choo choo',
		type: 'string',
		required: true
	}]
})

export default async (interaction) => {
    logger.info(`train sent by ${interaction.user}`)
    const train = [
        "https://tenor.com/view/sbahn-sbahnberlin-berlin-s-bahn-trains-gif-957335901911749770",
        "https://tenor.com/view/train-steam-gif-23821904",
        "https://tenor.com/view/buster-keaton-train-gif-11617658900136226017",
        "https://tenor.com/view/anime-gif-11765701015677241224",
        "https://tenor.com/view/tren-gif-10041562020475868316",
        "https://tenor.com/view/anime-studio-apartment-good-lighting-angel-included-train-gif-17648892423004501005"
    ];
    const location = interaction.options.getString('location')
    const trainStuff = train[Math.floor(Math.random() * train.length)];
    var current = 0
    const num = 30
	let currentDate = Math.round(Date.now() / 1000) + 31

    interaction.reply(`train sent to ${location}!\n> arriving <t:${currentDate}:R> ${trainStuff}`)

    var done;
    if (done) return;
    setInterval(async () => {
        current++
        if (current >= num) {
            await interaction.editReply(`train arrived at ${location}!`, true)
            done = true
        }
    }, 1000)
}