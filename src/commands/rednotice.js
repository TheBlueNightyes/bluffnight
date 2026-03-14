import { createCommandConfig, logger } from 'robo.js'
import { AttachmentBuilder } from 'discord.js'
import { createCanvas, loadImage } from 'canvas'

export const config = createCommandConfig({
    description: 'his li\'l island',
    options: [
        {
            name: 'user',
            description: 'LOGGED',
            type: 'user',
            required: true
        }
    ]
})

function fitText(ctx, text, maxWidth, startSize, font = 'Sans') {
    let fontSize = startSize

    do {
        ctx.font = `bold ${fontSize}px ${font}`
        fontSize--
    } while (ctx.measureText(text).width > maxWidth && fontSize > 20)

    return ctx.font
}

export default async (interaction) => {
    // name/displayname/join date/server join date/role

    logger.info(`Epstein command used by ${interaction.user.tag}`);
    await interaction.deferReply()

    const user = interaction.options.getUser('user')

    const member = await interaction.guild.members.fetch(user.id)
    const highestRole = member.roles.highest.name

    const canvas = createCanvas(1000, 600)
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#2c3e50') // dark blue
    gradient.addColorStop(1, '#34495e') // lighter blue
    ctx.fillStyle = '#7b0000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = gradient

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, canvas.width, 80)

    // Avatar
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }))
    ctx.drawImage(avatar, 60, 120, 300, 300)

    // User Name
    ctx.fillStyle = 'white'
    ctx.font = fitText(ctx, user.username.toUpperCase(), 500, 70)
    ctx.fillText(user.username.toUpperCase(), 450, 200)

    // Role
    ctx.fillStyle = '#cccccc'
    ctx.font = fitText(ctx, highestRole, 500, 40)
    ctx.fillText(highestRole, 450, 260)

    // Additional info
    ctx.font = '28px Sans'
    ctx.fillStyle = '#dddddd'
    ctx.fillText('CONFIRMED MENTIONS N', 450, 440)
    ctx.fillText('THE FLIGHT LOGS &', 450, 475)
    ctx.fillText('UNSEALED COURT DOCUMENTS.', 450, 510)

    // Finalize and send
    const buffer = canvas.toBuffer()
    const attachment = new AttachmentBuilder(buffer, { name: 'aipac.png' })

    await interaction.editReply({
        files: [attachment]
    })
}