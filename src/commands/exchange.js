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
    description: 'mama went to the bank',
    options: [{
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

export default async (interaction) => {
    logger.info(`${interaction.user} exchanged!`);

    const data = loadEconomyData();
    const user = interaction.user;
    const userId = user.id;
    const guild = interaction.guild;
    const guildId = guild.id;
    const amount = interaction.options.getInteger('amount')

    const allowedChannelId = '1400958456416043181';
    if (interaction.channel.id !== allowedChannelId) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Not Allowed')
            .setColor('Red')
            .setDescription('This command can only be used in the exchange channel.')
            .setTimestamp();

        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (amount > data[guildId].users[userId].crack) {
        const noCrackEmbed = new EmbedBuilder()
            .setTitle('Transaction Failed')
            .setColor('#FF5555')
            .setDescription(`You don't have enough crack to send ${amount}.`)
            .setTimestamp();

        return interaction.reply({ embeds: [noCrackEmbed] });
    }

    if (amount > data[guildId].users[userId].fentanyl) {
        const noFentanylEmbed = new EmbedBuilder()
            .setTitle('Transaction Failed')
            .setColor('#FF5555')
            .setDescription(`You don't have enough fentanyl to send ${amount}.`)
            .setTimestamp();

        return interaction.reply({ embeds: [noFentanylEmbed] });
    }

   // Ensure economy data is initialized
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId].users) data[guildId].users = {};
    if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = {
            crack: 0,
            fentanyl: 0,
            lastCollect: null,
            inventory: []
        };
    }
    
    if (interaction.options.getString('currency').includes('crack')) {
        const userCrack = data[guildId].users[userId].crack.toLocaleString();

        const crackEmbed = new EmbedBuilder()
            .setTitle('Exchange Successful')
            .setColor('#00AAFF')
            .setDescription(`${interaction.user} exchanged **${amount}** Crack.\nYour new balance is **${userCrack}** Crack.`)
            .setTimestamp();

        interaction.reply({ embeds: [crackEmbed] });
    }
    else if (interaction.options.getString('currency').includes('fentanyl')) {
        const userFentanyl = data[guildId].users[userId].fentanyl.toLocaleString();

        const fentanylEmbed = new EmbedBuilder()
            .setTitle('Exchange Successful')
            .setColor('#00AAFF')
            .setDescription(`${interaction.user} exchanged **${amount}** Fentanyl.\nYour new balance is **${userFentanyl}** Fentanyl.`)
            .setTimestamp();

        interaction.reply({ embeds: [fentanylEmbed] });
    }
};