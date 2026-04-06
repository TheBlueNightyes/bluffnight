import fs from 'fs';
import path from 'path';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from 'discord.js';
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
    if (!interaction.guild) {
        return interaction.reply({ content: 'Server only command.', ephemeral: true });
    }

    const proposer = interaction.user;
    const partner = interaction.options.getUser('partner');

    logger.info(`${proposer.tag} proposed to ${partner.tag}`);

    if (partner.bot) {
        return interaction.reply({ content: `🤖 You can't marry bots.`, ephemeral: true });
    }

    if (proposer.id === partner.id) {
        return interaction.reply({ content: `🪞 You can't marry yourself!`, ephemeral: true });
    }

    const data = loadPeopleData();
    const guildId = interaction.guild.id;

    if (!data[guildId]) data[guildId] = { users: {} };

    const ensureUser = (id) => {
        if (!data[guildId].users[id]) {
            data[guildId].users[id] = {
                partner: null,
                list: null,
                ideology: null
            };
        }
    };

    ensureUser(proposer.id);
    ensureUser(partner.id);

    if (data[guildId].users[proposer.id].partner !== null) {
        return interaction.reply({ content: `💍 You're already married!`, ephemeral: true });
    }

    if (data[guildId].users[partner.id].partner !== null) {
        return interaction.reply({ content: `💔 ${partner.username} is already married.`, ephemeral: true });
    }

    let decided = false;

    const getButtons = () =>
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('accept')
                .setLabel('💍 Accept')
                .setStyle(ButtonStyle.Success)
                .setDisabled(decided),

            new ButtonBuilder()
                .setCustomId('decline')
                .setLabel('❌ Decline')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(decided)
        );

    const embed = new EmbedBuilder()
        .setTitle('💌 Marriage Proposal')
        .setDescription(`${proposer} has proposed to ${partner}!\n\nDo you accept?`)
        .setColor('#00AAFF')
        .setAuthor({
            name: proposer.username,
            iconURL: proposer.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

    const msg = await interaction.reply({
        content: `${partner}`,
        embeds: [embed],
        components: [getButtons()],
        fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15000,
        filter: i => i.user.id === partner.id
    });

    collector.on('collect', async i => {
        decided = true;

        if (i.customId === 'accept') {
            const now = Date.now();

            data[guildId].users[proposer.id].partner = { id: partner.id, timestamp: now };
            data[guildId].users[partner.id].partner = { id: proposer.id, timestamp: now };
            savePeopleData(data);

            await i.update({
                content: `💖 ${proposer} and ${partner} are now married!`,
                embeds: [],
                components: [getButtons()]
            });

        } else if (i.customId === 'decline') {
            await i.update({
                content: `😔 ${partner} has declined the proposal from ${proposer}.`,
                embeds: [],
                components: [getButtons()]
            });
        }

        collector.stop();
    });

    collector.on('end', async collected => {
        if (!decided) {
            decided = true;

            await msg.edit({
                content: `⌛ Proposal timed out. No response from ${partner}.`,
                embeds: [],
                components: [getButtons()]
            }).catch(() => {});
        }
    });
};