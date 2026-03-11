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
    logger.info(`Epstein command used by ${interaction.user.tag}`);
    await interaction.deferReply()

    const user = interaction.options.getUser('user')
    
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

	const footers = [
		"They definitely went to that island.",
		"Knew Epstein professionally.",
		"Diddler."
	];

    let logs = getRandomIntInclusive(11000, 450000) 
	const userFooter = footers[Math.floor(Math.random() * footers.length)];

    const member = await interaction.guild.members.fetch(user.id)
    const highestRole = member.roles.highest.name

    const canvas = createCanvas(1000, 600)
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#2c3e50') // dark blue
    gradient.addColorStop(1, '#34495e') // lighter blue
    ctx.fillStyle = logs > 14000 ? '#7b0000' : '#003d24'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = gradient

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, canvas.width, 80)

    // Avatar
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }))
    ctx.drawImage(avatar, 60, 120, 300, 300)

    // Top right text
    ctx.textAlign = "right"
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Sans'
    ctx.fillText('🕵️ TRACK', 960, 70)
    ctx.font = 'bold 20px Sans'
    ctx.fillText('EPSTEIN', 960, 100)
    ctx.textAlign = "left"

    // User Name
    ctx.fillStyle = 'white'
    ctx.font = fitText(ctx, user.username.toUpperCase(), 500, 70)
    ctx.fillText(user.username.toUpperCase(), 450, 200)

    // Role
    ctx.fillStyle = '#cccccc'
    ctx.font = fitText(ctx, highestRole, 500, 40)
    ctx.fillText(highestRole, 450, 260)

    // Amount
    const amountText = `${logs.toLocaleString()}`

    ctx.fillStyle = 'white'
    ctx.font = fitText(ctx, amountText, 520, 90) // shrink if needed
    ctx.fillText(amountText, 450, 380)

    // Additional info
    ctx.font = '28px Sans'
    ctx.fillStyle = '#dddddd'
    ctx.fillText('CONFIRMED MENTIONS N', 450, 440)
    ctx.fillText('THE FLIGHT LOGS &', 450, 475)
    ctx.fillText('UNSEALED COURT DOCUMENTS.', 450, 510)

    // Footer above banner
    ctx.font = '28px Sans'
    ctx.fillStyle = '#ff0000'
    ctx.fillText(userFooter, 50, 450)

    // Highlighted banner for handle
    ctx.fillStyle = '#ff1a1a'
    ctx.fillRect(425, 540, 550, 50)

    ctx.fillStyle = 'white'
    ctx.font = 'bold 40px Sans'
    ctx.fillText('@EPSTEINTRACKER', 495, 575)

    // Larger, centered date under avatar
    const date = new Date().toLocaleDateString()
    ctx.textAlign = 'center'
    ctx.font = 'bold 30px Sans'
    ctx.fillStyle = '#cccccc'
    ctx.fillText(date, 500, 125) // Centered under the avatar

    // Make sure the banner lines up with description
    // (Already aligned since the banner and text are on the same horizontal axis)

    // Finalize and send
    const buffer = canvas.toBuffer()
    const attachment = new AttachmentBuilder(buffer, { name: 'aipac.png' })

    await interaction.editReply({
        files: [attachment]
    })
}