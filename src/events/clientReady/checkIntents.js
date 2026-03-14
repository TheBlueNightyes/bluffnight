import checkIntents from '../../utils/checkIntents.js'

export default async function(client) {
    await checkIntents(client)

    console.log(`Bot is online as ${client.user.tag} — clientReady fired`)
}