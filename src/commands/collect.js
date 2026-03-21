import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ROLEREWARDS_FILE = path.resolve('src/storage/roles.json');
const ECONOMY_FILE = path.resolve('src/storage/economy.json');
const COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

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
    description: 'collect your rewards!'
});

export default async (interaction) => {
    logger.info(`${interaction.user} collected!`);

    const data = loadEconomyData();
    const user = interaction.user;
    const userId = user.id;
    const guild = interaction.guild;
    const guildId = guild.id;
    const member = await guild.members.fetch(userId);
    const userRoles = member.roles.cache;
    
    const allowedGuildId = '1283954438868041728';
    if (interaction.guild.id !== allowedGuildId) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Not Allowed')
            .setColor('Red')
            .setDescription('This command can only be used in the main server.')
            .setTimestamp();

        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

   // Ensure economy data is initialized
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

    const now = Date.now();
    const userData = data[guildId].users[userId];

    if (userData.lastCollect && now - userData.lastCollect < COOLDOWN_MS) {
        const remaining = COOLDOWN_MS - (now - data[guildId].users[userId].lastCollect);
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        const cooldownEmbed = new EmbedBuilder()
            .setTitle('⏳ Cooldown Active')
            .setColor('Red')
            .setDescription(`You need to wait **${hours}h ${minutes}m ${seconds}s** before collecting again.`)
            .setTimestamp();

        return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
    }

    // Apply rewards
    let totalCrack = 0;
    let totalFentanyl = 0;
    let rewardBreakdown = [];

    const roleRewards = JSON.parse(fs.readFileSync(ROLEREWARDS_FILE, 'utf-8'));

    for (const [roleId, rewards] of Object.entries(roleRewards)) {
        if (userRoles.has(roleId)) {
            const role = guild.roles.cache.get(roleId);
            const roleName = role ? role.name : `Unknown Role (${roleId})`;

            let crack = rewards.crack || 0;
            let fentanyl = rewards.fentanyl || 0;

            totalCrack += crack;
            totalFentanyl += fentanyl;

            userData.crack += crack;
            userData.fentanyl += fentanyl;

            const parts = [];
            if (crack > 0) parts.push(`+${crack.toLocaleString()} Crack`);
            if (fentanyl > 0) parts.push(`+${fentanyl.toLocaleString()} Fentanyl`);

            if (parts.length > 0) {
                rewardBreakdown.push(`**${roleName}** ➜ ${parts.join(' | ')}`);
            }
        }
    }

    if (rewardBreakdown.length === 0) {
        return interaction.reply({
            content: '❌ Failed to collect',
            ephemeral: true
        });
    }

    const totalRewardsText = [
        totalCrack > 0 ? `+${totalCrack.toLocaleString()} Crack` : null,
        totalFentanyl > 0 ? `+${totalFentanyl.toLocaleString()} Fentanyl` : null
    ].filter(Boolean).join('\n') || 'Nothing collected';

    const balanceText = [
        userData.crack > 0 ? `${userData.crack.toLocaleString()} Crack` : null,
        userData.fentanyl > 0 ? `${userData.fentanyl.toLocaleString()} Fentanyl` : null
    ].filter(Boolean).join('\n') || 'No balance';

    const embed = new EmbedBuilder()
        .setTitle('✅ Collection Successful')
        .setColor('#00AAFF')
        .setDescription([
            `${user} collected:\n`,
            `**Total Rewards**`,
            totalRewardsText + '\n',
            `**From Roles:**`,
            rewardBreakdown.join('\n'),
            `\n**New Balance:**`,
            balanceText
        ].join('\n'))
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
    userData.lastCollect = now;
    saveEconomyData(data);
};