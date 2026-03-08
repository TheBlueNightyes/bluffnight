import fs from 'fs';
import path from 'path';
import { createCommandConfig, logger } from 'robo.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');

function loadEconomyData() {
	if (!fs.existsSync(ECONOMY_FILE)) {
		return {};
	}

	const raw = fs.readFileSync(ECONOMY_FILE, 'utf-8').trim();
	if (!raw) return {};

	try {
		return JSON.parse(raw);
	} catch (err) {
		logger.error('Failed to parse economy.json:', err);
		return {};
	}
}

function saveEconomyData(data) {
	try {
		fs.writeFileSync(ECONOMY_FILE, JSON.stringify(data, null, 2), 'utf-8');
		logger.info('Economy data saved.');
	} catch (err) {
		logger.error('Failed to save economy data:', err);
	}
}

export const config = createCommandConfig({
    description: 'Start a betting challenge between two factors',
    options: [
        {
            name: 'factor1',
            description: 'First factor to bet on',
            type: 'string',
            required: true,
        },
        {
            name: 'factor2',
            description: 'Second factor to bet on',
            type: 'string',
            required: true,
        }
    ]
});

export default async (interaction) => {
    const factor1 = interaction.options.getString('factor1');
    const factor2 = interaction.options.getString('factor2');
    const data = loadEconomyData();
    const guildId = interaction.guild.id
    const userId = interaction.user.id;

	const durationSeconds = 5 * 60; // 5 minutes
	const endTimestamp = Math.round(Date.now() / 1000) + durationSeconds;

    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId].users) data[guildId].users = {};
    if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = { 
            crack: 0, 
            fentanyl: 0, 
            lastCollect: 0, 
            inventory: [], 
            redeemed: [] 
        };
    }

    logger.info(`${interaction.user.tag} started a bet: ${factor1} vs ${factor2}`);

    await interaction.deferReply({ ephemeral: false });

    // Store bets and initial payout
    const bets = new Map(); // userId => choice
    const counts = { [factor1]: 0, [factor2]: 0 };
    const payouts = { [factor1]: 100, [factor2]: 100 };

	const embed = new EmbedBuilder()
		.setTitle('🎲 Betting Challenge')
		.setDescription(
			`${factor1} vs ${factor2}\n` +
			`Click a button below to bet!\n\n` +
			`⏳ Betting ends <t:${endTimestamp}:R>`
		)
		.addFields(
			{ name: factor1, value: `Votes: 0 | Payout: 100%`, inline: true },
			{ name: factor2, value: `Votes: 0 | Payout: 100%`, inline: true }
		)
		.setColor('#00ccff');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`bet_${factor1}`)
            .setLabel(factor1)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`bet_${factor2}`)
            .setLabel(factor2)
            .setStyle(ButtonStyle.Danger)
    );

    const msg = await interaction.editReply({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
		time: durationSeconds * 1000
    });

	collector.on('collect', async i => {
		if (i.user.bot) return;

		const betCost = 100; // cost per bet
		const economy = loadEconomyData();
		const guildId = interaction.guild.id;
		const userId = i.user.id;

		if (!economy[guildId]) economy[guildId] = { users: {} };
		if (!economy[guildId].users[userId]) {
			economy[guildId].users[userId] = {
				crack: 0,
				fentanyl: 0,
				lastCollect: 0,
				inventory: [],
				redeemed: []
			};
		}

		const user = economy[guildId].users[userId];

		if (user.crack < betCost) {
			return i.reply({
				content: `❌ You need ${betCost} crack to bet.`,
				ephemeral: true
			});
		}

		const choice = i.customId.replace('bet_', '');

		// If switching sides, refund previous bet
		const prevChoice = bets.get(userId);
		if (prevChoice) {
			counts[prevChoice]--;
			user.crack += betCost;
		}

		// Deduct crack
		user.crack -= betCost;

		bets.set(userId, choice);
		counts[choice]++;

		// Update payouts
		const total = counts[factor1] + counts[factor2] || 1;

		payouts[factor1] = Math.floor((counts[factor2] / total) * 200 + 100);
		payouts[factor2] = Math.floor((counts[factor1] / total) * 200 + 100);

		saveEconomyData(economy);

		const updatedEmbed = EmbedBuilder.from(embed)
			.setFields(
				{
					name: factor1,
					value: `Votes: ${counts[factor1]} | Payout: ${payouts[factor1]}%`,
					inline: true
				},
				{
					name: factor2,
					value: `Votes: ${counts[factor2]} | Payout: ${payouts[factor2]}%`,
					inline: true
				}
			);

		await i.update({ embeds: [updatedEmbed], components: [row] });
	});

	collector.on('end', async () => {
		const economy = loadEconomyData();
		const guildId = interaction.guild.id;

		const { askGemini } = await import('../utils/gemini.js');

		const result = await askGemini(`
		Factor 1: ${factor1}
		Factor 2: ${factor2}
		Decide the winner and explain dramatically.
		`);

		const winnerFactor = result.includes(factor1) ? factor1 : factor2;

		let winnersText = '';

		for (const [userId, choice] of bets.entries()) {
			if (!economy[guildId].users[userId]) continue;

			const user = economy[guildId].users[userId];

			if (choice === winnerFactor) {
				const winnings = Math.floor(100 * (payouts[winnerFactor] / 100));
				user.crack += winnings;

				winnersText += `<@${userId}> won ${winnings} crack!\n`;
			}
		}

		saveEconomyData(economy);

		const finalEmbed = EmbedBuilder.from(embed)
			.setTitle('🏆 Betting Result')
			.setDescription(
				`Winner: **${winnerFactor}**\n\n${winnersText || 'No one won.'}\n\n${result}`
			)
			.setColor('Gold');

		await msg.edit({ embeds: [finalEmbed], components: [] });
	});
};