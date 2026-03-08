import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

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
    description: 'sharing is caring',
    options: [{
        name: 'user',
        description: 'lucky bastard',
        type: 'user',
        required: true,
    },
    {
        name: 'currency',
        description: 'this decides whether yall gamble today',
        type: 'string',
        choices: [
            { name: 'crack', value: 'crack' },
            { name: 'fentanyl', value: 'fentanyl' }
        ],
        required: true
    },
    {
        name: 'amount',
        description: 'oof my pockets!!',
        type: 'integer',
        required: true,
    }]
});

export default (interaction) => {
    logger.info(`pay command used by ${interaction.user}`);

    const data = loadEconomyData();
    const guildId = interaction.guild.id;
    const senderId = interaction.user.id;
    const receiver = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount')
    const formattedAmount = amount.toLocaleString();

    if (!Number.isInteger(amount) || amount <= 0) {
        return interaction.reply({
            content: 'Please enter a valid positive number for the amount.',
            ephemeral: true
        });
    }

    // Ensure sender exists
    if (!data[guildId].users[senderId]) {
        data[guildId].users[senderId] = { 
            crack: 0, 
            fentanyl: 0, 
            lastCollect: 0, 
            inventory: [], 
            redeemed: [] 
        };
    }

    // Ensure receiver exists
    if (!data[guildId].users[receiver.id]) {
        data[guildId].users[receiver.id] = { 
            crack: 0, 
            fentanyl: 0, 
            lastCollect: 0, 
            inventory: [], 
            redeemed: [] 
        };
    }

    const currency = interaction.options.getString('currency');

    if (currency === 'crack') {

        if (amount > data[guildId].users[senderId].crack) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Transaction Failed')
                        .setColor('#FF5555')
                        .setDescription(`You don't have enough crack to send ${formattedAmount}.`)
                ]
            });
        }

        data[guildId].users[senderId].crack -= amount;
        data[guildId].users[receiver.id].crack += amount;

        saveEconomyData(data);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Payment Successful')
                    .setColor('#00AAFF')
                    .setDescription(
                        `${interaction.user} paid ${receiver} **${formattedAmount}** Crack.\n` +
                        `Your new balance is **${data[guildId].users[senderId].crack.toLocaleString()}** Crack.`
                    )
            ]
        });
    }

    if (currency === 'fentanyl') {

        if (amount > data[guildId].users[senderId].fentanyl) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Transaction Failed')
                        .setColor('#FF5555')
                        .setDescription(`You don't have enough fentanyl to send ${formattedAmount}.`)
                ]
            });
        }

        data[guildId].users[senderId].fentanyl -= amount;
        data[guildId].users[receiver.id].fentanyl += amount;

        saveEconomyData(data);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Payment Successful')
                    .setColor('#00AAFF')
                    .setDescription(
                        `${interaction.user} paid ${receiver} **${formattedAmount}** Fentanyl.\n` +
                        `Your new balance is **${data[guildId].users[senderId].fentanyl.toLocaleString()}** Fentanyl.`
                    )
            ]
        });
    }
};