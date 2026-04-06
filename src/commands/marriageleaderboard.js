import fs from 'fs';
import path from 'path';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const PEOPLE_FILE = path.resolve('src/storage/people.json');
const ENTRIES_PER_PAGE = 10;

function loadPeopleData() {
    if (!fs.existsSync(PEOPLE_FILE)) return {};
    const raw = fs.readFileSync(PEOPLE_FILE, 'utf-8').trim();
    if (!raw) return {};
    return JSON.parse(raw);
}

export const config = createCommandConfig({
    description: 'so many love stories!!'
});

export default async (interaction) => {
    await interaction.deferReply();

    const data = loadPeopleData();
    const guildId = interaction.guild.id;
    const users = data[guildId]?.users || {};

    logger.info(`${interaction.user.tag} checked the marriage leaderboard`);

    const processed = new Set();
    const marriages = [];

    for (const [userId, userData] of Object.entries(users)) {
        if (!userData.partner || !userData.partner.id) continue;
        const partnerId = userData.partner.id;
        const pairKey = [userId, partnerId].sort().join('-');
        if (processed.has(pairKey)) continue;

        const partnerData = users[partnerId];
        if (!partnerData || !partnerData.partner) continue;

        const points = userData.partner.points || 0;

        marriages.push({
            users: [userId, partnerId],
            points
        });

        processed.add(pairKey);
    }

    marriages.sort((a, b) => b.points - a.points);

    let currentPage = 0;
    const totalPages = Math.ceil(marriages.length / ENTRIES_PER_PAGE);

    const getEmbed = async (page) => {
        const start = page * ENTRIES_PER_PAGE;
        const slice = marriages.slice(start, start + ENTRIES_PER_PAGE);

        const lines = await Promise.all(slice.map(async (marriage, index) => {
            const [id1, id2] = marriage.users;
            const member1 = await interaction.guild.members.fetch(id1).catch(() => null);
            const member2 = await interaction.guild.members.fetch(id2).catch(() => null);
            const name1 = member1?.user?.username || `Unknown (${id1})`;
            const name2 = member2?.user?.username || `Unknown (${id2})`;

            const displayName1 = id1 === interaction.user.id ? `**${name1}**` : name1;
            const displayName2 = id2 === interaction.user.id ? `**${name2}**` : name2;

            return `\`${start + index + 1}.\` 💕 ${displayName1} & ${displayName2} — ${marriage.points.toLocaleString()} pts`;
        }));

        const embed = new EmbedBuilder()
            .setTitle('💍 Marriage Leaderboard')
            .setDescription(lines.join('\n') || 'No marriages found.')
            .setColor('#FF69B4')
            .setTimestamp();

        if (totalPages > 1) embed.setFooter({ text: `Page ${page + 1} of ${totalPages}` });

        return embed;
    };

    const getButtons = () =>
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('⬅️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('➡️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages - 1)
        );

    const msg = await interaction.editReply({
        embeds: [await getEmbed(currentPage)],
        components: totalPages > 1 ? [getButtons()] : []
    });

    if (totalPages > 1) {
        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();

            if (i.customId === 'prev' && currentPage > 0) currentPage--;
            if (i.customId === 'next' && currentPage < totalPages - 1) currentPage++;

            await msg.edit({ embeds: [await getEmbed(currentPage)], components: [getButtons()] });
        });

        collector.on('end', async () => {
            const disabledRow = getButtons();
            disabledRow.components.forEach(b => b.setDisabled(true));
            await msg.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};