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

const SLOT_EMOJIS = ['🍒', '🍋', '🔔', '🍉', '⭐', '7️⃣'];

export const config = createCommandConfig({
    description: 'play with your life... maybe',
    options: [
        {
            name: 'currency',
            description: 'use all of it',
            type: 'string',
            choices: [
                { name: 'crack', value: 'crack' },
                { name: 'fentanyl', value: 'fentanyl' }
            ],
            required: true
        },
        {
            name: 'amount',
            description: 'PUT IT ALL DOWN',
            type: 'integer',
            required: true
        }
    ]
});

export default async (interaction) => {
    logger.info(`slots command used by ${interaction.user.tag}`);

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

    if (!Number.isInteger(amount) || amount <= 0) {
        return interaction.reply({ content: 'Please enter a valid positive bet amount.', ephemeral: true });
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

    // Deduct the bet now
    data[guildId].users[userId][currency] -= amount;

    // Spin the slots
    const spin = [];
    for (let i = 0; i < 3; i++) {
        spin.push(SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]);
    }

    // Calculate winnings
    let winnings = 0;
    if (spin[0] === spin[1] && spin[1] === spin[2]) {
        winnings = amount * 5; // triple match
    } else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) {
        winnings = amount * 2; // double match
    } else {
        winnings = 0; // no match, lose bet
    }

    // Add winnings
    data[guildId].users[userId][currency] += winnings;

    saveEconomyData(data);

    const netResult = winnings - amount;
    let resultText = '';
    if (netResult > 0) {
        resultText = `🎉 You won **${winnings.toLocaleString()} ${currency}**! (Net +${netResult.toLocaleString()})`;
    } else if (netResult < 0) {
        resultText = `😞 You lost **${amount.toLocaleString()} ${currency}**. Better luck next time!`;
    } else {
        resultText = `It's a break-even. You got your bet back!`;
    }

    const balance = data[guildId].users[userId][currency].toLocaleString();

    const embed = new EmbedBuilder()
        .setTitle('🎰 Slots Result')
        .setColor('#00AAFF')
        .addFields(
            { name: 'Spin', value: spin.join(' | '), inline: false },
            { name: 'Result', value: resultText, inline: false },
            { name: 'New Balance', value: `${balance} ${currency}`, inline: false }
        )
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
};