import { createCommandConfig, logger } from 'robo.js';

export const config = createCommandConfig({
	description: 'choo choo!',
	options: [
		{
			name: 'location',
			description: 'where to choo choo',
			type: 'string',
			required: true
		}
	]
});

const activeTrains = new Map(); // key: userId, value: true

export default async (interaction) => {
	const userId = interaction.user.id;

	if (activeTrains.has(userId)) {
		return interaction.reply({
			content: "🚧 You already have a train in progress! Please wait for it to arrive before sending another.",
			ephemeral: true
		});
	}

	activeTrains.set(userId, true);
	logger.info(`Train sent by ${interaction.user.tag}`);

	const trainGIFs = [
		"https://tenor.com/view/sbahn-sbahnberlin-berlin-s-bahn-trains-gif-957335901911749770",
		"https://tenor.com/view/train-steam-gif-23821904",
		"https://tenor.com/view/buster-keaton-train-gif-11617658900136226017",
		"https://tenor.com/view/anime-gif-11765701015677241224",
		"https://tenor.com/view/tren-gif-10041562020475868316",
		"https://tenor.com/view/anime-studio-apartment-good-lighting-angel-included-train-gif-17648892423004501005"
	];

	const location = interaction.options.getString('location');
	const chosenGIF = trainGIFs[Math.floor(Math.random() * trainGIFs.length)];
	const durationSeconds = 30;
	let current = 0;

	const arrivalTimestamp = Math.round(Date.now() / 1000) + durationSeconds;

	try {
		const msg1 = await interaction.reply({
			content: `🚂 Train sent to **${location}**!\n> Arriving <t:${arrivalTimestamp}:R>`,
			fetchReply: true
		});

		await interaction.channel.send(chosenGIF);

		const interval = setInterval(async () => {
			try {
				current++;
				if (current >= durationSeconds) {
					clearInterval(interval);
					await interaction.editReply(`✅ Train arrived at **${location}**!`);
					activeTrains.delete(userId);
				}
			} catch (err) {
				logger.error("Error updating train arrival message:", err);
				clearInterval(interval);
				activeTrains.delete(userId);
			}
		}, 1000);
	} catch (err) {
		logger.error("Error running train command:", err);
		activeTrains.delete(userId); // cleanup on failure
	}
};