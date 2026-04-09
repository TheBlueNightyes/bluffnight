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

function getColor(num) {
    if (num === 0) return 'green';

    const redNumbers = [
        1,3,5,7,9,12,14,16,18,19,
        21,23,25,27,30,32,34,36
    ];

    return redNumbers.includes(num) ? 'red' : 'black';
}

export const config = createCommandConfig({
    description: 'spin the wheel...',
    options: [
        {
            name: 'currency',
            description: 'what are you risking?',
            type: 'string',
            choices: [
                { name: 'crack', value: 'crack' },
                { name: 'fentanyl', value: 'fentanyl' }
            ],
            required: true
        },
        {
            name: 'amount',
            description: 'bet amount',
            type: 'integer',
            required: true
        },
        {
            name: 'bet',
            description: 'what are you betting on?',
            type: 'string',
            choices: [
                { name: 'red', value: 'red' },
                { name: 'black', value: 'black' },
                { name: 'green', value: 'green' }
            ],
            required: true
        }
    ]
});

export default async (interaction) => {
    logger.info(`roulette command used by ${interaction.user.tag}`);

    const data = loadEconomyData();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

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

    const currency = interaction.options.getString('currency');
    const amount = interaction.options.getInteger('amount');
    const bet = interaction.options.getString('bet');

    if (!Number.isInteger(amount) || amount <= 0) {
        return interaction.reply({
            content: 'Enter a valid bet amount.',
            ephemeral: true
        });
    }

    if ((data[guildId].users[userId][currency] ?? 0) < amount) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Insufficient Funds')
                    .setColor('#FF5555')
                    .setDescription(`You don't have enough ${currency} to bet ${amount}.`)
                    .setTimestamp()
            ],
            ephemeral: true
        });
    }

    data[guildId].users[userId][currency] -= amount;

    const number = Math.floor(Math.random() * 37);
    const color = getColor(number);

    let winnings = 0;

    if (bet === color) {
        if (color === 'green') {
            winnings = amount * 14; // jackpot
        } else {
            winnings = amount * 2;
        }
    }

    data[guildId].users[userId][currency] += winnings;

    saveEconomyData(data);

    const net = winnings - amount;

    let resultText = '';
    if (net > 0) {
        resultText = `🎉 You won **${winnings.toLocaleString()} ${currency}**! (Net +${net.toLocaleString()})`;
    } else {
        resultText = `💀 You lost **${amount.toLocaleString()} ${currency}**.`;
    }

    const colorEmoji = color === 'red' ? '🟥' : color === 'black' ? '⬛' : '🟩';

    const balance = data[guildId].users[userId][currency].toLocaleString();

    const embed = new EmbedBuilder()
        .setTitle('🎡 Roulette Spin')
        .setColor('#00AAFF')
        .addFields(
            { name: 'Result', value: `${colorEmoji} **${color.toUpperCase()}** (${number})`, inline: false },
            { name: 'Your Bet', value: bet, inline: true },
            { name: 'Outcome', value: resultText, inline: false },
            { name: 'New Balance', value: `${balance} ${currency}`, inline: false }
        )
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
};