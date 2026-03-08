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
    description: 'u could be in the big leauges someday',
    options: [
        {
            name: 'type',
            description: 'Action to take',
            type: 'string',
            choices: [
                { name: 'crack', value: 'crack' },
                { name: 'fentanyl', value: 'fentanyl' },
            ],
            required: true
        }
    ]
});

export default async (interaction) => {
    await interaction.deferReply();

    const user = interaction.user;
    const type = interaction.options.getString('type'); // 'crack' or 'fentanyl'
    logger.info(`${user.tag} checked the ${type} leaderboard`);

    const economyData = loadEconomyData();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const users = economyData[guildId]?.users || {};

    if (!economyData[guildId]) economyData[guildId] = {};
    if (!economyData[guildId].users) economyData[guildId].users = {};
    if (!economyData[guildId].users[userId]) {
        economyData[guildId].users[userId] = { 
            crack: 0, 
            fentanyl: 0, 
            lastCollect: 0, 
            inventory: [], 
            redeemed: [] 
        };
    }

    // Sort users based on chosen type
    const sorted = Object.entries(users)
        .sort((a, b) => (b[1][type] || 0) - (a[1][type] || 0));

    let currentPage = 0;
    const totalPages = Math.ceil(sorted.length / ENTRIES_PER_PAGE);

    const generateEmbed = async (page) => {
        const start = page * ENTRIES_PER_PAGE;
        const end = start + ENTRIES_PER_PAGE;
        const slice = sorted.slice(start, end);

        const totalAmount = sorted.reduce((sum, [, userData]) => sum + (userData[type] || 0), 0) || 1;

        const lines = await Promise.all(slice.map(async ([id, userData], index) => {
            const member = await interaction.guild.members.fetch(id).catch(() => null);
            const name = member?.user?.username || `Unknown User (${id})`;
            const amount = userData[type] || 0;
            const percentage = ((amount / totalAmount) * 100).toFixed(2);

            // Highlight the user who ran the command
            const isCurrentUser = id === interaction.user.id;
            const displayName = isCurrentUser ? `**${name}**` : name;

            return `\`${start + index + 1}.\` ${displayName} — ${amount.toLocaleString()} ${type.charAt(0).toUpperCase() + type.slice(1)} (${percentage}%)`;
        }));

        const embed = new EmbedBuilder()
            .setTitle(`💰 ${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard (Total: ${totalAmount.toLocaleString()})`)
            .setDescription(lines.join('\n') || 'No users found.')
            .setColor(type === 'crack' ? '#00AAFF' : '#FF5555')
            .setTimestamp();

        if (totalPages > 1) {
            embed.setFooter({ text: `Page ${page + 1} of ${totalPages}` });
        }

        return embed;
    };

    const row = new ActionRowBuilder();
    if (totalPages > 1) {
        row.addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Primary)
        );
    }

    const embed = await generateEmbed(currentPage);

    const message = await interaction.editReply({
        embeds: [embed],
        components: totalPages > 1 ? [row] : []
    });

    if (totalPages > 1) {
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
    }
}