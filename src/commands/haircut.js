import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
    description: 'ts shii fresh'
})

export default (interaction) => {
    logger.info(`haircut ordered by ${interaction.user}`)
    const haircut = [
        "you got.. yapper's buzzcut!\nhttps://cdn.discordapp.com/attachments/1316610681969053757/1349104171688788000/buzzcut.png?ex=67d1e2ab&is=67d0912b&hm=cf3061079391ef0638b5b559dd36ba27e1ff4bc26add5f807baf59d1b6a8098b&",
        "you got.. a low taper fade!\nhttps://cdn.discordapp.com/attachments/1316610681969053757/1349104173156925480/taperFade.png?ex=67d1e2ac&is=67d0912c&hm=7dba4ca63a0086590e9cca3a8db6e5abcc25f3885f2f784738d37b8de332a8e7&",
        "you got.. the EDP cut!\nhttps://cdn.discordapp.com/attachments/1316610681969053757/1349104172238110760/edp.png?ex=67d1e2ab&is=67d0912b&hm=99da00b758d81f183879efa5d5cf598ea3c3850f27d14352881de88686161af7&",
        "you got.. epsteins special!\nhttps://cdn.discordapp.com/attachments/1316610681969053757/1349104172535910570/epstein.png?ex=67d1e2ab&is=67d0912b&hm=4342223ff46cccdf10b97fbac61ea41ee00b332e498ddaa54a73fa78ddb3f926&",
        "you got.. a mohawk!\nhttps://cdn.discordapp.com/attachments/1316610681969053757/1349104172808671293/mohawk_mark.png?ex=67d1e2ab&is=67d0912b&hm=04f5a01378631b51dce624035ccc16264b92f393af633c0c4c9ccd9e4732cce3&"
    ];
    const haircutChosen = haircut[Math.floor(Math.random() * haircut.length)];

    interaction.reply(`${haircutChosen}`)
}