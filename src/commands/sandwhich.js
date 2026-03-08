import fs from 'fs';
import path from 'path';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const MISC_FILE = path.resolve('src/storage/misc.json');

function loadMiscData() {
	if (!fs.existsSync(MISC_FILE)) return {};
	const raw = fs.readFileSync(MISC_FILE, 'utf-8').trim();
	if (!raw) return {};
	try {
		return JSON.parse(raw);
	} catch (err) {
		logger.error('Failed to parse misc.json:', err);
		return {};
	}
}

function saveMiscData(data) {
	try {
		fs.writeFileSync(MISC_FILE, JSON.stringify(data, null, 2), 'utf-8');
		logger.info('Misc data saved.');
	} catch (err) {
		logger.error('Failed to save misc data:', err);
	}
}

export const config = createCommandConfig({
	description: 'Will the sandwich gods listen?',
});

const miscData = loadMiscData();
let totalSandwhiches = miscData.totalSandwhiches || 0;

export default async (interaction) => {
	logger.info(`Sandwich gods summoned by ${interaction.user.tag}`);
	await interaction.deferReply();
	totalSandwhiches++;

	const responses = [
		"🥪 yeah sorry you're basically a fish role so, no sandwich for you!",
		"🥪 man we do not fw you so, no sandwich for you!",
		"🥪 go ask the pizza gods peasant cuz no sandwich for you!",
		"🥪 we ran out of bread.. so, no sandwich for you!",
		"🥪 tuxxego told me to not give you sandwiches so.. no sandwich for you!",
		"🥪 bluenight said you were chill. still, no sandwich for you!",
		"🥪 you've been blessed, here's a sandwich.",
		"🥪 lemme ask tuxxego bot if we got any in the back. sorry we out so, no sandwich for you!",
		"🥪 I'll give you a chance. What comes first?",
	];

	const result = responses[Math.floor(Math.random() * responses.length)];

	if (result.includes("What comes first")) {
		const button1 = new ButtonBuilder().setCustomId('lettuce').setStyle(ButtonStyle.Primary).setLabel('lettuce');
		const button2 = new ButtonBuilder().setCustomId('tomato').setStyle(ButtonStyle.Primary).setLabel('tomato');
		const button3 = new ButtonBuilder().setCustomId('cheese').setStyle(ButtonStyle.Primary).setLabel('cheese');
		const row = new ActionRowBuilder().addComponents(button1, button2, button3);

		const message = await interaction.editReply({
			content: `🥪 I'll give you a chance. What comes first?\n> total: ${totalSandwhiches}`,
			components: [row],
		});

		const collector = message.createMessageComponentCollector({
			filter: i => ['lettuce', 'tomato', 'cheese'].includes(i.customId) && i.user.id === interaction.user.id,
			time: 15000,
			max: 1
		});

		collector.on('collect', async (i) => {
			if (i.customId === 'tomato') {
				await i.update({
					content: `🥪 Here's a sandwich, you earned it.\n> total: ${totalSandwhiches}`,
					components: [],
				});
			} else {
				await i.update({
					content: `🥪 WRONG\n> total: ${totalSandwhiches}`,
					components: [],
				});
			}
			saveMiscData({ totalSandwhiches });
		});

		collector.on('end', async collected => {
			if (collected.size === 0) {
				await interaction.editReply({
					content: `🥪 You took too long!\n> total: ${totalSandwhiches}`,
					components: [],
				});
			}
		});
	} else {
		await interaction.editReply({
			content: `${result}\n> total: ${totalSandwhiches}`,
		});
		saveMiscData({ totalSandwhiches });
	}
};