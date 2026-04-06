import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');

function loadEconomyData() {
    if (!fs.existsSync(ECONOMY_FILE)) return {};

    try {
        const raw = fs.readFileSync(ECONOMY_FILE, 'utf-8').trim();
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (err) {
        console.error('Economy JSON error:', err);
        return {};
    }
}
export const config = createCommandConfig({
    description: 'balance for now',
    options: [{
        name: 'user',
        description: 'is this the irs',
        type: 'user',
        required: false
    }]
});

export default async (interaction) => {
    logger.info(`balance checked by ${interaction.user.tag}`);

    if (!interaction.guild) {
        return interaction.reply({
            content: 'This command can only be used in a server.',
            ephemeral: true
        });
    }

    const data = loadEconomyData();
    const guildId = interaction.guild.id;
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;

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

    const formattedCrack = data[guildId].users[userId].crack.toLocaleString();
    const formattedFentanyl = data[guildId].users[userId].fentanyl.toLocaleString();

    const embed = new EmbedBuilder()
        .setTitle('Balance')
        .setColor('#00AAFF')
        .setDescription(
            `**${targetUser}**'s balance is:\n${formattedCrack} Crack\n${formattedFentanyl} Fentanyl`
        )
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
};