import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
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

    const factionRole = isA ? FACTION_A_ROLE : FACTION_B_ROLE;

    const allMembers = await interaction.guild.members.fetch();
    const factionMembers = allMembers
        .filter(m => m.roles.cache.has(factionRole))
        .map(m => m.user.username);

    const embed = new EmbedBuilder()
        .setTitle(`${isA ? 'bluffnight coalition' : 'Rosie slave'} Members`)
        .setDescription(factionMembers.join('\n') || "No members found")
        .setColor(isA ? 0x1abc9c : 0xe74c3c);

    await interaction.reply({ embeds: [embed] });
};