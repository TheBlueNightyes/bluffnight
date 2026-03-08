import { createCommandConfig, logger } from 'robo.js';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const STATS_FILE = path.resolve('./src/storage/stats.json');

let stats = { sessionNumber: 1, lastStart: new Date().toISOString() };
if (fs.existsSync(STATS_FILE)) {
	try {
		const raw = fs.readFileSync(STATS_FILE, 'utf8');
		stats = JSON.parse(raw);
		stats.sessionNumber += 1; // Increment for new session
		stats.lastStart = new Date().toISOString();
	} catch (err) {
		logger.error('Failed to read bot stats file:', err);
	}
} else {
	stats.lastStart = new Date().toISOString();
}

fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

export const config = createCommandConfig({
	description: 'Show bot session info'
});

export default (interaction) => {
	logger.info(`Uptime command used by ${interaction.user.tag}`);

	const uptimeMillis = process.uptime() * 1000;
	const hours = String(Math.floor(uptimeMillis / 3600000)).padStart(2, '0');
	const minutes = String(Math.floor((uptimeMillis % 3600000) / 60000)).padStart(2, '0');
	const seconds = String(Math.floor((uptimeMillis % 60000) / 1000)).padStart(2, '0');
	const uptimeFormatted = `${hours}:${minutes}:${seconds}`;

	const embed = new EmbedBuilder()
		.setTitle(`bluffnight session ${stats.sessionNumber} info`)
		.setColor('#00FFFF')
		.addFields(
			{ name: 'Bot Latency', value: `${interaction.client.ws.ping}ms`, inline: true },
			{ name: 'Uptime', value: uptimeFormatted, inline: true },
			{ name: 'Last Start', value: new Date(stats.lastStart).toLocaleString(), inline: false }
		)
		.setTimestamp();

	interaction.reply({ embeds: [embed] });
};