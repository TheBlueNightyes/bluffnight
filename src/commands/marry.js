import fs from 'fs';
import path from 'path';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const PEOPLE_FILE = path.resolve('src/storage/people.json');

function loadPeopleData() {
    if (!fs.existsSync(PEOPLE_FILE)) return {};
    const raw = fs.readFileSync(PEOPLE_FILE, 'utf-8').trim();
    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch (err) {
        logger.error('Failed to parse people.json:', err);
        return {};
    }
}

function savePeopleData(data) {
    try {
        fs.writeFileSync(PEOPLE_FILE, JSON.stringify(data, null, 2), 'utf-8');
        logger.info('People data saved.');
    } catch (err) {
        logger.error('Failed to save people data:', err);
    }
}

export const config = createCommandConfig({
    description: 'happily ever after',
    options: [{
        name: 'partner',
        description: 'your one and only ❤️',
        type: 'user',
        required: true,
    }],
});

export default async (interaction) => {
    const proposer = interaction.user;
    const partner = interaction.options.getUser('partner');

    if (partner.bot) {
        return interaction.reply({
            content: `🤖 You can't marry bots.`,
            ephemeral: true
        });
    }

    if (proposer.id === partner.id) {
        return interaction.reply({
            content: `🪞 You can't marry yourself!`,
            ephemeral: true
        });
    }

    const data = loadPeopleData();
    const guildId = interaction.guild.id;

    // Ensure structure for proposer + partner
    if (!data[guildId]) data[guildId] = { users: {} };
    if (!data[guildId].users[proposer.id]) {
        data[guildId].users[proposer.id] = {
            partner: null,
            list: null,
            ideology: null
        };
    }
    if (!data[guildId].users[partner.id]) {
        data[guildId].users[partner.id] = {
            partner: null,
            list: null,
            ideology: null
        };
    }

    // Check if already married
    if (data[guildId].users[proposer.id].partner !== null) {
        return interaction.reply({
            content: `💍 You're already married!`,
            ephemeral: true
        });
    }
    if (data[guildId].users[partner.id].partner !== null) {
        return interaction.reply({
            content: `💔 ${partner.username} is already married.`,
            ephemeral: true
        });
    }

    // Show buttons to partner
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('accept_marriage')
            .setLabel('💍 Yes')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('decline_marriage')
            .setLabel('❌ No')
            .setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
        .setTitle('💌 Marriage Proposal')
        .setDescription(`${proposer} has proposed to ${partner}!\nDo you accept this proposal?`)
        .setColor('Blue')
        .setTimestamp();

    const message = await interaction.reply({
        content: `${partner}`,
        embeds: [embed],
        components: [row],
        fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
        time: 15000,
        filter: (i) => i.user.id === partner.id,
    });

    collector.on('collect', async (i) => {
        if (i.customId === 'accept_marriage') {
            const now = Date.now();

            data[guildId].users[proposer.id].partner = { id: partner.id, timestamp: now };
            data[guildId].users[partner.id].partner = { id: proposer.id, timestamp: now };
            savePeopleData(data);

            await i.update({
                content: `💖 ${proposer} and ${partner} are now married!`,
                embeds: [],
                components: []
            });
        } else if (i.customId === 'decline_marriage') {
            await i.update({
                content: `😔 ${partner} has declined the proposal from ${proposer}.`,
                embeds: [],
                components: []
            });
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            interaction.editReply({
                content: `⌛ Proposal timed out. No response from ${partner}.`,
                embeds: [],
                components: []
            });
        }
    });
};