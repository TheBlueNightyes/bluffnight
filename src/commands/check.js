import { PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { createCommandConfig } from 'robo.js';

export default createCommandConfig({
    name: 'check',
    description: 'investigate the jit',
    options: [
        {
            name: 'user',
            description: 'jit to investigate',
            type: 'user',
            required: false
        }
    ],

    async execute({ interaction }) {
        const target = interaction.options.getMember('user') || interaction.member;

        const permsToCheck = [
            { name: 'Change Nickname', flag: PermissionFlagsBits.ChangeNickname },
            { name: 'Manage Messages', flag: PermissionFlagsBits.ManageMessages },
            { name: 'Kick Members', flag: PermissionFlagsBits.KickMembers },
            { name: 'Ban Members', flag: PermissionFlagsBits.BanMembers },
            { name: 'Administrator', flag: PermissionFlagsBits.Administrator }
        ];

        const results = permsToCheck.map(p => {
            const hasPerm = target.permissions.has(p.flag);
            return `${hasPerm ? '✅' : '❌'} ${p.name}`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`Permissions for ${target.user.tag}`)
            .setDescription(results.join('\n'))
            .setColor(0x5865F2);

        await interaction.reply({ embeds: [embed] });
    }
});