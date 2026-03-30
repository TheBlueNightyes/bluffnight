import { PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { createCommandConfig } from 'robo.js';

export const config = createCommandConfig({
    description: 'investigate the jit',
    options: [{
        name: 'user',
        description: 'jit to investigate',
        type: 'user',
        required: false
    }]
});

export default async (interaction) => {
    const target = interaction.options.getMember('user') || interaction.member;

    const permsToCheck = [
        { name: 'Change Nickname', flag: PermissionFlagsBits.ChangeNickname },
        { name: 'Manage Messages', flag: PermissionFlagsBits.ManageMessages },
        { name: 'Kick Members', flag: PermissionFlagsBits.KickMembers },
        { name: 'Ban Members', flag: PermissionFlagsBits.BanMembers },
        { name: 'Administrator', flag: PermissionFlagsBits.Administrator }
    ];

    const isAdmin = target.permissions.has(PermissionFlagsBits.Administrator);

    const results = permsToCheck.map(p => {
        const hasPerm = target.permissions.has(p.flag);

        // Admin override
        if (isAdmin) {
            return `✅ ${p.name} (Administrator)`;
        }

        if (!hasPerm) {
            return `❌ ${p.name}`;
        }

        // Find roles that grant this permission
        const rolesWithPerm = target.roles.cache
            .filter(role => role.permissions.has(p.flag))
            .map(role => role.name);

        const roleText = rolesWithPerm.length > 0
            ? ` (from: ${rolesWithPerm.join(', ')})`
            : '';

        return `✅ ${p.name}${roleText}`;
    });

    const embed = new EmbedBuilder()
        .setTitle(`🔍 Permissions for ${target.user.tag}`)
        .setDescription(results.join('\n'))
        .setFooter({ text: `Total Roles: ${target.roles.cache.size}` })
        .setColor(0x5865F2);

    await interaction.reply({ embeds: [embed] });
};