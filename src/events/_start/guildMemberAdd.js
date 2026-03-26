import { createEvent } from 'robo.js';

const TARGET_GUILD_ID = '1386784456345518160';

const BANISHED_USERS = ['1227523050929393714'];
const BANISHED_ROLE_ID = '1477174612608684042';

export default createEvent({
    name: 'guildMemberAdd',

    async execute(member) {
        if (member.guild.id !== TARGET_GUILD_ID) return;

        if (BANISHED_USERS.includes(member.id)) {
            try {
                await member.roles.add(BANISHED_ROLE_ID);
                console.log(`Banished role given to ${member.user.tag}`);
            } catch (err) {
                console.error('Failed to assign role:', err);
            }
        }
    }
});