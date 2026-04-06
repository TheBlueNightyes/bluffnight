import fs from 'fs';
import path from 'path';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createCommandConfig } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');

function loadEconomyData() {
    if (!fs.existsSync(ECONOMY_FILE)) return {};
    const raw = fs.readFileSync(ECONOMY_FILE, 'utf-8').trim();
    if (!raw) return {};
    return JSON.parse(raw);
}

function saveEconomyData(data) {
    fs.writeFileSync(ECONOMY_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const weapons = [
    { name: "Sword", rarity: "common", cost: { steel: 5000 }, crack: 125000, fentanyl: 50 },
    { name: "Shotgun", rarity: "common", cost: { steel: 8000, chromium: 1000 }, crack: 200000, fentanyl: 100 },
    { name: "Sniper", rarity: "rare", cost: { steel: 8000, chromium: 2500 }, crack: 300000, fentanyl: 250 },
    { name: "LMG", rarity: "rare", cost: { steel: 11500, chromium: 4000, tungsten: 50 }, crack: 50000000, fentanyl: 400 },
    { name: "Flamethrower", rarity: "epic", cost: { steel: 18000, chromium: 4000, tungsten: 100 }, crack: 80000000, fentanyl: 750 },
    { name: "Railgun", rarity: "epic", cost: { tungsten: 9000, uranium: 5000 }, crack: 120000000, fentanyl: 1200 },
    { name: "Tank", rarity: "legendary", cost: { steel: 17000, chromium: 10000, tungsten: 6700, uranium: 8900 }, crack: 30000000, fentanyl: 2500 },
    { name: "Nuke", rarity: "legendary", cost: { plutonium: 55000, uranium: 900000 }, crack: 500000000, fentanyl: 5000 }
];

export const config = createCommandConfig({
    description: 'arm yourself'
});

export default async (interaction) => {
    await interaction.deferReply();

    const data = loadEconomyData();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId].users) data[guildId].users = {};
    if (!data[guildId].users[userId]) {
        data[guildId].users[userId] = {
            crack: 0,
            fentanyl: 0,
            materials: {},
            inventory: []
        };
    }

    const userData = data[guildId].users[userId];
    let currentPage = 0;

    const getColor = r => r === 'common' ? '#00FF00' :
                           r === 'rare' ? '#0099FF' :
                           r === 'epic' ? '#9933FF' :
                           '#FF0000';

    const formatCost = (cost) => {
        return Object.entries(cost).map(([mat, val]) => {
            const owned = userData.materials[mat] || 0;
            const has = owned >= val;
            return `${has ? '✔' : '✖'} ${mat}: ${owned}/${val}`;
        }).join('\n');
    };

    const generateEmbed = () => {
        const weapon = weapons[currentPage];
        const owned = userData.inventory.includes(weapon.name);

        return new EmbedBuilder()
            .setTitle(`🔫 ${weapon.name} ${owned ? '✅ OWNED' : ''}`)
            .setDescription(
                `**Rarity:** ${weapon.rarity}\n\n` +
                `**Materials:**\n${formatCost(weapon.cost)}\n\n` +
                `**Skip Cost:**\n• Crack: ${weapon.crack.toLocaleString()}\n• Fent: ${weapon.fentanyl.toLocaleString()}`
            )
            .setColor(getColor(weapon.rarity))
            .setFooter({ text: `Weapon ${currentPage + 1} of ${weapons.length}` })
            .setTimestamp();
    };

    const buttons = () => new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('buy_mat').setLabel('Materials').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('buy_crack').setLabel('Crack').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('buy_fent').setLabel('Fent').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Primary)
    );

    const msg = await interaction.editReply({
        embeds: [generateEmbed()],
        components: [buttons()]
    });

    const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === userId,
        time: 60000
    });

    collector.on('collect', async i => {
        await i.deferUpdate();
        const weapon = weapons[currentPage];

        if (i.customId === 'prev' && currentPage > 0) currentPage--;
        if (i.customId === 'next' && currentPage < weapons.length - 1) currentPage++;

        if (i.customId.startsWith('buy')) {
            if (userData.inventory.includes(weapon.name)) {
                return interaction.followUp({ content: 'Already owned', ephemeral: true });
            }

            if (i.customId === 'buy_mat') {
                let can = true;
                for (const [mat, val] of Object.entries(weapon.cost)) {
                    if ((userData.materials[mat] || 0) < val) can = false;
                }

                if (!can) return interaction.followUp({ content: 'Missing materials', ephemeral: true });

                for (const [mat, val] of Object.entries(weapon.cost)) {
                    userData.materials[mat] -= val;
                }
            }

            if (i.customId === 'buy_crack') {
                if (userData.crack < weapon.crack)
                    return interaction.followUp({ content: 'Not enough crack', ephemeral: true });

                userData.crack -= weapon.crack;
            }

            if (i.customId === 'buy_fent') {
                if (userData.fentanyl < weapon.fentanyl)
                    return interaction.followUp({ content: 'Not enough fent', ephemeral: true });

                userData.fentanyl -= weapon.fentanyl;
            }

            userData.inventory.push(weapon.name);
            saveEconomyData(data);

            return interaction.followUp({
                content: `Purchased ${weapon.name}`,
                ephemeral: true
            });
        }

        await msg.edit({
            embeds: [generateEmbed()],
            components: [buttons()]
        });
    });

    collector.on('end', async () => {
        if (msg.editable) await msg.edit({ components: [] }).catch(() => {});
    });
};