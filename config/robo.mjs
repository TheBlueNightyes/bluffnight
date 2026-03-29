// @ts-check

/**
 * @type {import('robo.js').Config}
 **/
export default {
    clientOptions: {
        intents: ['Guilds', 'GuildMessages', 'GuildMembers'] // ✅ added GuildMembers
    },
    plugins: [],
    type: 'robo'
}