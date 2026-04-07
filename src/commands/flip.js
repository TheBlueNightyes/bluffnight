import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');

function loadEconomyData() {
    if (!fs.existsSync(ECONOMY_FILE)) return {};
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
    description: 'play with the devil',
    options: [
        {
            name: 'amount',
            description: 'oof my pockets!!',
            type: 'integer',
            required: false,
        },
        {
            name: 'side',
            description: 'Pick heads or tails',
            type: 'string',
            choices: [
                { name: 'heads', value: 'heads' },
                { name: 'tails', value: 'tails' }
            ],
            required: false,
        }
    ]
});

const coinSides = ["heads", "tails"];

export default async (interaction) => {
    logger.info(`Coin flipped by ${interaction.user.tag}`);

    const data = loadEconomyData();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const amount = interaction.options.getInteger('amount') || 0;
    const sideGuess = interaction.options.getString('side');

    // Initialize user data if missing
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId].users) data[guildId].users = {};
    if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = { crack: 0, fentanyl: 0, lastCollect: 0, inventory: [] };
    }

    const userData = data[guildId].users[userId];

    const result = coinSides[Math.floor(Math.random() * coinSides.length)];

    // JUST FLIP (no guess)
    if (!sideGuess) {
        return interaction.reply(`🪙 You flipped a coin: **${result}**`);
    }

    // GUESS WITHOUT BET
    if (!amount || amount <= 0) {
        const win = result === sideGuess;
        return interaction.reply(
            `🪙 You guessed **${sideGuess}** and the coin landed on **${result}**.\n\n` +
            `${win ? "✅ You guessed correctly!" : "❌ Wrong guess!"}`
        );
    }

    // BETTING LOGIC
    if (userData.crack < amount) {
        return interaction.reply(`❌ You don't have enough crack to bet **${amount}**.`);
    }

    const win = result === sideGuess;

    if (win) {
        userData.crack += amount;
    } else {
        userData.crack -= amount;
    }

    saveEconomyData(data);

    const embed = new EmbedBuilder()
        .setTitle('🪙 Coin Flip Result')
        .setColor(win ? '#00FF00' : '#FF0000')
        .setDescription(
            `You guessed **${sideGuess}** and the coin landed on **${result}**.\n\n` +
            `${win ? "✅ You won" : "❌ You lost"} **${amount} crack**.\n` +
            `Your new balance: **${userData.crack} crack**`
        )
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
};