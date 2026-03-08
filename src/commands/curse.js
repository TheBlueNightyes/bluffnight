import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const CURSES_FILE = path.resolve('src/storage/curses.json');

function loadCurses() {
  if (!fs.existsSync(CURSES_FILE)) return {};
  const raw = fs.readFileSync(CURSES_FILE, 'utf-8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    logger.error('Failed to parse curses.json:', err);
    return {};
  }
}

function saveCurses(data) {
  try {
    fs.writeFileSync(CURSES_FILE, JSON.stringify(data, null, 2), 'utf-8');
    logger.info('Curses data saved.');
  } catch (err) {
    logger.error('Failed to save curses data:', err);
  }
}

const AVAILABLE_CURSES = ['uwuify'];

export const config = createCommandConfig({
  description: 'nuke the whole generation',
  options: [
    {
      name: 'user',
      description: 'bad omen',
      type: 'user',
      required: true,
    },
    {
      name: 'curse',
      description: 'wrap it up',
      type: 'string',
      required: true,
      choices: AVAILABLE_CURSES.map(c => ({ name: c, value: c })),
    },
  ],
});

export default async (interaction) => {
  const targetUser = interaction.options.getUser('user');
  const curse = interaction.options.getString('curse');
  const guildId = interaction.guild.id;

  const cursesData = loadCurses();

  if (!cursesData[guildId]) cursesData[guildId] = {};
  if (!cursesData[guildId][targetUser.id]) cursesData[guildId][targetUser.id] = [];

  // Don't add the same curse twice
  if (cursesData[guildId][targetUser.id].includes(curse)) {
    return interaction.reply({
      content: `${targetUser.username} is already cursed with ${curse}!`,
      ephemeral: true,
    });
  }

  cursesData[guildId][targetUser.id].push(curse);
  saveCurses(cursesData);

  const embed = new EmbedBuilder()
    .setTitle('🪄 Curse Applied')
    .setColor('#AA00FF')
    .setDescription(`${targetUser} has been cursed with **${curse}**!`)
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
};
