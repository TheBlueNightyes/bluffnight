import fs from 'fs';
import path from 'path';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');
const FACTION_A_ROLE = '1490161105064951959';
const FACTION_B_ROLE = '1487669335555182692';

function loadJSON(file) {
    if (!fs.existsSync(file)) return {};
    try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (err) {
        logger.error(`Failed to parse ${file}:`, err);
        return {};
    }
}

function saveJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function getUserData(econData, guildId, userId) {
    if (!econData[guildId]) econData[guildId] = { users: {} };
    if (!econData[guildId].users[userId]) {
        econData[guildId].users[userId] = {
            crack: 0,
            fentanyl: 0,
            lastCollect: 0,
            inventory: { weapons: [], items: [] }
        };
    }
    return econData[guildId].users[userId];
}

export const config = createCommandConfig({
    description: 'View all members on your faction'
});

export default async (interaction) => {
    const memberRoles = interaction.member.roles.cache;
    const isA = memberRoles.has(FACTION_A_ROLE);
    const isB = memberRoles.has(FACTION_B_ROLE);

    if (!isA && !isB) {
        return interaction.reply({ content: `You must be in <@&${FACTION_A_ROLE}> or <@&${FACTION_B_ROLE}> to use this command!`, ephemeral: true });
    }

    const econData = loadJSON(ECONOMY_FILE);
    const guildData = econData[interaction.guild.id] || { users: {} };
    const factionRole = isA ? FACTION_A_ROLE : FACTION_B_ROLE;

    // Get all members in this faction
    const allMembers = await interaction.guild.members.fetch();
    const factionMembers = allMembers
        .filter(m => m.roles.cache.has(factionRole))
        .map(m => m.user.username);

    const embed = new EmbedBuilder()
        .setTitle(`${isA ? 'bluffnight coalition' : 'Rosie slave'} Members`)
        .setDescription(factionMembers.join('\n') || "No members found")
        .setColor(isA ? 0x1abc9c : 0xe74c3c);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('bonuses')
            .setLabel('Bonuses')
            .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });

    // Optional: handle button interaction
    const collector = interaction.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 15000 });
    collector.on('collect', async (i) => {
        if (i.customId !== 'bonuses') return;

        const econData = loadJSON(ECONOMY_FILE);
        const factionRole = isA ? FACTION_A_ROLE : FACTION_B_ROLE;

        // Fetch all members in the faction
        const allMembers = await i.guild.members.fetch();
        const factionMembers = allMembers.filter(m => m.roles.cache.has(factionRole));

        // Sum total crack in faction
        let totalCrack = 0;
        factionMembers.forEach(m => {
            const userId = m.user.id;
            const userData = getUserData(econData, i.guild.id, userId);
            totalCrack += userData.crack;
        });

        const upgradeCost = Math.ceil(totalCrack * 0.03); // 3% of total

        const buyerData = getUserData(econData, i.guild.id, i.user.id);

        if (buyerData.crack < upgradeCost) {
            return i.reply({ content: `You need ${upgradeCost} crack to buy a faction upgrade! You only have ${buyerData.crack}.`, ephemeral: true });
        }

        // Deduct cost from buyer
        buyerData.crack -= upgradeCost;

        // Apply upgrade (for simplicity, store it in guildData)
        if (!econData[i.guild.id].factionUpgrades) econData[i.guild.id].factionUpgrades = {};
        const factionKey = isA ? 'A' : 'B';
        if (!econData[i.guild.id].factionUpgrades[factionKey]) {
            econData[i.guild.id].factionUpgrades[factionKey] = { attack: 0, defense: 0 };
        }

        // Example: alternate between attack and defense upgrades
        const upgradeType = Math.random() < 0.5 ? 'attack' : 'defense';
        econData[i.guild.id].factionUpgrades[factionKey][upgradeType] += 1;

        saveJSON(ECONOMY_FILE, econData);

        i.reply({
            content: `✅ Upgrade purchased!\nType: **${upgradeType}**\nCost: **${upgradeCost} crack**`,
            ephemeral: true
        });
    });
};