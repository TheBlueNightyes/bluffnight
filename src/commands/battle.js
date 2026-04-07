import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';
import { createCommandConfig, logger } from 'robo.js';

const ECONOMY_FILE = path.resolve('src/storage/economy.json');
const CHANNEL_STATS_FILE = path.resolve('src/storage/channelStats.json');

const FACTION_A_ROLE = '1490161105064951959';
const FACTION_B_ROLE = '1487669335555182692';

const BATTLE_COOLDOWN = 60 * 5; // 5 minutes
const PROGRESS_INCREMENT = 20; // winner gains 20%
const MAX_PROGRESS = 100;
const MAX_LOG_LINES = 25;

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

    const userData = econData[guildId].users[userId];

    if (Array.isArray(userData.inventory)) {
        userData.inventory = { weapons: [], items: userData.inventory };
    }
    if (!userData.inventory.weapons) userData.inventory.weapons = [];
    if (!userData.inventory.items) userData.inventory.items = [];

    if (typeof userData.crack !== 'number') userData.crack = 0;
    if (typeof userData.fentanyl !== 'number') userData.fentanyl = 0;
    if (typeof userData.lastCollect !== 'number') userData.lastCollect = 0;

    return userData;
}

export const config = createCommandConfig({ description: 'loaded' });

export default async (interaction) => {
	interaction.reply(`mines r closed`)
	
    // await interaction.deferReply();

    // const weaponStats = {
    //     Fists: { damage: 10 },
    //     Sword: { damage: 25 },
    //     Shotgun: { damage: 50 },
    //     Sniper: { damage: 75 },
    //     LMG: { damage: 100 },
    //     Flamethrower: { damage: 120 },
    //     Railgun: { damage: 150 },
    //     Tank: { damage: 200 }
    // };

    // const guildId = interaction.guild.id;
    // const channelId = interaction.channel.id;
    // const econData = loadJSON(ECONOMY_FILE);
    // const channelStats = loadJSON(CHANNEL_STATS_FILE);
    // const now = Date.now();

    // if (!channelStats[channelId]) channelStats[channelId] = { progress: 0, faction: null, lastBattle: 0 };
    // const chData = channelStats[channelId];

    // // cooldown check
	// const isControlled = chData.progress === MAX_PROGRESS || chData.progress === 0;
	// const cooldownTime = isControlled ? CONTROLLED_COOLDOWN * 1000 : BATTLE_COOLDOWN * 1000;

	// if (now - chData.lastBattle < cooldownTime) {
	// 	const remaining = Math.ceil((cooldownTime - (now - chData.lastBattle)) / 1000);
	// 	return interaction.editReply(`⚔️ Battle cooldown active. Try again in ${remaining} seconds.`);
	// }

    // // Fetch last 100 messages
    // const messages = await interaction.channel.messages.fetch({ limit: 100 });
    // const users = new Map();

    // for (const msg of messages.values()) {
    //     const member = await interaction.guild.members.fetch(msg.author.id).catch(() => null);
    //     if (!member) continue;
    //     if (member.roles.cache.has(FACTION_A_ROLE) || member.roles.cache.has(FACTION_B_ROLE)) {
    //         users.set(msg.author.id, member);
    //     }
    // }

    // if (users.size === 0) return interaction.editReply('No active faction members in last 100 messages.');

    // // Build participants with strongest weapon (default Fists)
	// const participants = [];
	// for (const [userId, member] of users.entries()) {
	// 	const userData = getUserData(econData, guildId, userId);
	// 	const weapons = userData.inventory.weapons.filter(w => w !== 'Nuke');
	// 	let strongest = 'Fists';
	// 	let maxDamage = weaponStats[strongest].damage;

	// 	for (const w of weapons) {
	// 		const dmg = weaponStats[w]?.damage || 0;
	// 		if (dmg > maxDamage) {
	// 			maxDamage = dmg;
	// 			strongest = w;
	// 		}
	// 	}

	// 	const faction = member.roles.cache.has(FACTION_A_ROLE) ? 'A' : 'B';

	// 	// ADD HP HERE
	// 	participants.push({ 
	// 		member, 
	// 		weapon: strongest, 
	// 		damage: maxDamage, 
	// 		faction,
	// 		hp: 100 // default HP
	// 	});
	// }

    // const factionA = participants.filter(p => p.faction === 'A');
    // const factionB = participants.filter(p => p.faction === 'B');

    // if (factionA.length === 0 || factionB.length === 0) {
    //     const aUsers = factionA.map(p => p.member.user.username).join(', ') || 'None';
    //     const bUsers = factionB.map(p => p.member.user.username).join(', ') || 'None';
    //     return interaction.editReply(
    //         `Not enough active members in both factions to start a battle.\n\n` +
    //         `**Faction A:** ${aUsers}\n` +
    //         `**Faction B:** ${bUsers}`
    //     );
    // }

	// // Active fighters embed
	// let activeA = [...factionA];
	// let activeB = [...factionB];

	// let activeEmbed = new EmbedBuilder()
	// 	.setTitle('⚔️ Active Fighters')
	// 	.setColor('#FFFF00')
	// 	.addFields(
	// 		{ name: 'Faction A', value: activeA.map(p => p.member.user.username).join('\n') || 'None', inline: true },
	// 		{ name: 'Faction B', value: activeB.map(p => p.member.user.username).join('\n') || 'None', inline: true }
	// 	);
	// const activeMsg = await interaction.followUp({ embeds: [activeEmbed] });

	// // Battle log embed (separate!)
	// let battleEmbed = new EmbedBuilder()
	// 	.setTitle('⚔️ Battle Log')
	// 	.setColor('#FFAA00')
	// 	.setDescription('Starting battle...')
	// 	.setTimestamp();
	// const battleMsg = await interaction.followUp({ embeds: [battleEmbed] }); // <- note: followUp so it's separate

	// // Battle log rolling array
	// let battleLog = [];

	// // Loop until one side dies
	// while (activeA.length > 0 && activeB.length > 0) {
	// 	for (const attacker of [...activeA, ...activeB]) {
	// 		// Skip dead attackers
	// 		if (attacker.hp <= 0) continue;

	// 		const targets = attacker.faction === 'A' ? activeB : activeA;
	// 		if (targets.length === 0) break;

	// 		const target = targets[Math.floor(Math.random() * targets.length)];
	// 		const dmg = Math.floor(attacker.damage * (0.8 + Math.random() * 0.4));

	// 		// Apply damage first
	// 		target.hp -= dmg;

	// 		// Push to rolling log with updated HP
	// 		battleLog.push(
	// 			`${attacker.member.user.username} attacks ${target.member.user.username} with ${attacker.weapon} for ${dmg} damage! ` +
	// 			`(${Math.max(target.hp, 0)} HP left)`
	// 		);
	// 		if (battleLog.length > MAX_LOG_LINES) battleLog.shift();

	// 		// Update battle embed (rolling log)
	// 		battleEmbed.setDescription(battleLog.join('\n'));
	// 		await battleMsg.edit({ embeds: [battleEmbed] });

	// 		// Remove dead target if hp <= 0
	// 		if (target.hp <= 0) {
	// 			const removeFrom = target.faction === 'A' ? activeA : activeB;
	// 			const index = removeFrom.findIndex(p => p.member.id === target.member.id);
	// 			if (index !== -1) removeFrom.splice(index, 1);
	// 		}

	// 		// Update active fighters embed
	// 		activeEmbed.setFields(
	// 			{ name: `bluffnight coalition`, value: activeA.map(p => p.member.user.username).join('\n') || 'None', inline: true },
	// 			{ name: `Rosie slave`, value: activeB.map(p => p.member.user.username).join('\n') || 'None', inline: true }
	// 		);
	// 		await activeMsg.edit({ embeds: [activeEmbed] });

	// 		await new Promise(res => setTimeout(res, 1000));
	// 	}
	// }

	// // Determine winner
	// let winnerFaction = activeA.length > 0 ? 'A' : 'B';
	// let winnerRoleId = activeA.length > 0 ? FACTION_A_ROLE : FACTION_B_ROLE;

	// // Update progress
	// if (winnerFaction === 'A') {
	// 	chData.progress = Math.min(chData.progress + PROGRESS_INCREMENT, MAX_PROGRESS);
	// } else {
	// 	chData.progress = Math.max(chData.progress - PROGRESS_INCREMENT, 0);
	// }

	// // Check for full control
	// const CONTROLLED_COOLDOWN = 60 * 60 * 3; // 3 hours in seconds
	// if (chData.progress === MAX_PROGRESS) {
	// 	chData.faction = 'A';
	// 	chData.lastBattle = now; // start cooldown
	// 	await interaction.channel.setName(`faction-${interaction.channel.name}`).catch(() => {});
	// } else if (chData.progress === 0) {
	// 	chData.faction = 'B';
	// 	chData.lastBattle = now; // start cooldown
	// 	await interaction.channel.setName(`faction-${interaction.channel.name}`).catch(() => {});
	// } else {
	// 	// Regular battle timestamp
	// 	chData.lastBattle = now;
	// }

	// chData.lastBattle = Date.now();
	// saveJSON(CHANNEL_STATS_FILE, channelStats);
	// saveJSON(ECONOMY_FILE, econData);

	// // Append final result to **battle log** so it stays
	// battleLog.push(`**⚔️ Battle Ended! Winner: <@&${winnerRoleId}> | Channel Progress: ${chData.progress}%**`);
	// battleEmbed.setDescription(battleLog.join('\n'));
	// battleEmbed.setColor(winnerFaction === 'A' ? '#00AAFF' : '#FF0000');
	// battleEmbed.setTitle('⚔️ Battle Log (Ended)');
	// await battleMsg.edit({ embeds: [battleEmbed] });
};