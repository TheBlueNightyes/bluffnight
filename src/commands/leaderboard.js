import fs from 'fs';
import path from 'path';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');
const ENTRIES_PER_PAGE = 10;

function loadEconomyData() {
    if (!fs.existsSync(ECONOMY_FILE)) return {};
    const raw = fs.readFileSync(ECONOMY_FILE, 'utf-8').trim();
    if (!raw) return {};
    return JSON.parse(raw);
}

export const config = createCommandConfig({
    description: 'u could be in the big leauges someday'
});

export default async (interaction) => {
    const user = interaction.user;
    logger.info(`${user.tag} checked the leaderboard`);

    const economyData = loadEconomyData();
    const guildId = interaction.guild.id;

    const users = economyData[guildId]?.users || {};

    const sorted = Object.entries(users)
        .sort((a, b) => (b[1].crack || 0) - (a[1].crack || 0));

    let currentPage = 0;
    const totalPages = Math.ceil(sorted.length / ENTRIES_PER_PAGE);

    const generateEmbed = async (page) => {
        const start = page * ENTRIES_PER_PAGE;
        const end = start + ENTRIES_PER_PAGE;
        const slice = sorted.slice(start, end);

        const totalCrack = sorted.reduce((sum, [, userData]) => sum + (userData.crack || 0), 0) || 1; // Avoid divide-by-zero

        const lines = await Promise.all(slice.map(async ([id, userData], index) => {
            const member = await interaction.guild.members.fetch(id).catch(() => null);
            const name = member?.user?.username || `Unknown User (${id})`;
            const crack = userData.crack || 0;
            const percentage = ((crack / totalCrack) * 100).toFixed(2);
            return `\`${start + index + 1}.\` **${name}** — ${crack.toLocaleString()} Crack (${percentage}%)`;
        }));

        return new EmbedBuilder()
            .setTitle(`💰 Crack Leaderboard (Total: ${totalCrack.toLocaleString()})`)
            .setDescription(lines.join('\n') || 'No users found.')
            .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
            .setColor('#00AAFF')
            .setTimestamp();
    };  

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Primary)
    );

    const embed = await generateEmbed(currentPage);
    let message;
    if (interaction.replied || interaction.deferred) {
        message = await interaction.followUp({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });
    } else {
        message = await interaction.reply({
         embeds: [embed],
            components: [row],
            fetchReply: true
        });
    }

    const collector = message.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 60000
    });

    collector.on('collect', async i => {
        i.deferUpdate();
        if (i.customId === 'prev' && currentPage > 0) currentPage--;
        if (i.customId === 'next' && currentPage < totalPages - 1) currentPage++;

        const updatedEmbed = await generateEmbed(currentPage);
        await message.edit({ embeds: [updatedEmbed] });
    });

    collector.on('end', async () => {
        if (message.editable) {
            await message.edit({ components: [] }).catch(() => {});
        }
    });
};