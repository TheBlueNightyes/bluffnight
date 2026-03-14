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

function drawCentered(ctx, text, y) {
    const width = ctx.measureText(text).width
    ctx.fillText(text, (ctx.canvas.width - width) / 2, y)
}

export default async (interaction) => {
    logger.info(`Red notice command used by ${interaction.user.tag}`);
    await interaction.deferReply()

    const user = interaction.options.getUser('user')
    const member = await interaction.guild.members.fetch(user.id)
    const highestRole = member.roles.highest.name

    const canvas = createCanvas(1000, 600)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Header (closer to real notice color)
    ctx.fillStyle = '#12406A'
    ctx.fillRect(0, 0, canvas.width, 160)

    // Username (centered)
    ctx.fillStyle = 'white'
    ctx.font = fitText(ctx, user.username.toUpperCase(), 900, 80)
    drawCentered(ctx, user.username.toUpperCase(), 90)

    // Server name (centered)
    ctx.font = '30px Sans'
    drawCentered(ctx, `Searched by ${interaction.guild.name}`, 130)

    // Red vertical line like notice
    ctx.fillStyle = '#cc0000'
    ctx.fillRect(50, 170, 4, 320)

    // Avatar
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }))
    ctx.drawImage(avatar, 70, 180, 280, 280)

    const redNotice = await loadImage('./src/assets/RedNotice.png')
    ctx.drawImage(redNotice, 310, 180, 80, 110)

    // Identifying header
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 42px Sans'
    ctx.fillText('Identifying elements', 450, 250)

    // Labels
    ctx.font = '26px Sans'
    ctx.fillText('Username', 450, 300)
    ctx.fillText('Display name', 450, 335)
    ctx.fillText('Creation date', 450, 370)
    ctx.fillText('Join date', 450, 405)
    ctx.fillText('Role', 450, 440)

    // Values
    ctx.font = 'bold 26px Sans'
    ctx.fillText(user.username, 650, 300)
    ctx.fillText(member.displayName, 650, 335)
    ctx.fillText(new Date(user.createdTimestamp).toLocaleDateString(), 650, 370)
    ctx.fillText(new Date(member.joinedTimestamp).toLocaleDateString(), 650, 405)
    ctx.fillText(highestRole, 650, 440)

    const buffer = canvas.toBuffer()
    const attachment = new AttachmentBuilder(buffer, { name: 'redNotice.png' })

    await interaction.editReply({
        files: [attachment]
    })
}
