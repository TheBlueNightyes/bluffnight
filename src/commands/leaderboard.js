import fs from 'fs';
import path from 'path';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
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
            description: 'THE options',
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

    if (!interaction.guild) {
        return interaction.reply({ content: 'Server only command.', ephemeral: true });
    }

    const user = interaction.user;
    const type = interaction.options.getString('type');
    logger.info(`${user.tag} checked the ${type} leaderboard`);

    const economyData = loadEconomyData();
    const guildId = interaction.guild.id;
    const userId = user.id;
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

    const sorted = Object.entries(users)
        .sort((a, b) => (b[1][type] || 0) - (a[1][type] || 0));

    let currentPage = 0;
    const totalPages = Math.max(1, Math.ceil(sorted.length / ENTRIES_PER_PAGE));

    const getPageEmbed = async (page) => {
        const start = page * ENTRIES_PER_PAGE;
        const slice = sorted.slice(start, start + ENTRIES_PER_PAGE);

        const totalAmount = sorted.reduce((sum, [, u]) => sum + (u[type] || 0), 0) || 1;

        const lines = await Promise.all(slice.map(async ([id, userData], index) => {
            const member = await interaction.guild.members.fetch(id).catch(() => null);
            const name = member?.user?.username || `Unknown User (${id})`;
            const amount = userData[type] || 0;
            const percentage = ((amount / totalAmount) * 100).toFixed(2);

            const isCurrentUser = id === userId;
            const displayName = isCurrentUser ? `**${name}**` : name;

            return `\`${start + index + 1}.\` ${displayName} — ${amount.toLocaleString()} ${type} (${percentage}%)`;
        }));

        return new EmbedBuilder()
            .setTitle(`💰 ${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`)
            .setDescription(lines.join('\n') || 'No users found.')
            .setColor(type === 'crack' ? '#00AAFF' : '#FF5555')
            .setFooter({ text: `Page ${page + 1}/${totalPages}` })
            .setTimestamp();
    };

    const getButtons = () =>
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('first')
                .setLabel('⏮')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),

            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),

            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages - 1),

            new ButtonBuilder()
                .setCustomId('last')
                .setLabel('⏭')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages - 1)
        );

    const msg = await interaction.editReply({
        embeds: [await getPageEmbed(currentPage)],
        components: [getButtons()]
    });

    const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
        filter: i => i.user.id === userId
    });

    collector.on('collect', async i => {
        if (i.customId === 'first') currentPage = 0;
        if (i.customId === 'prev') currentPage--;
        if (i.customId === 'next') currentPage++;
        if (i.customId === 'last') currentPage = totalPages - 1;

        currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));

        await i.update({
            embeds: [await getPageEmbed(currentPage)],
            components: [getButtons()]
        });
    });

    collector.on('end', async () => {
        const disabledRow = getButtons();
        disabledRow.components.forEach(b => b.setDisabled(true));
        await msg.edit({ components: [disabledRow] }).catch(() => {});
    });
};