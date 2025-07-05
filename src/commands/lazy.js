 import { createCommandConfig, logger } from 'robo.js'

export const config = createCommandConfig({
	description: 'discover the truth'
})

export default (interaction) => {
	logger.info(`Lazy's actions discovered by ${interaction.user}`)
	const crime = [
	"https://media.discordapp.net/attachments/1316610681969053757/1323598465430716497/lazy1.jpg?ex=677518a1&is=6773c721&hm=57e95be85670b323dd1303a9337067fde5c91bd040bafb6af073db410356e6c6&=&format=webp",
	"https://media.discordapp.net/attachments/1316610681969053757/1323598465670057994/lazy2.png?ex=677518a1&is=6773c721&hm=649f8c2357fa2b7027cf72769600e708ee6163cded2a49657663196db90c4be8&=&format=webp&quality=lossless",
	"https://media.discordapp.net/attachments/1316608373424128001/1323657265601052713/challenger.png?ex=67754f64&is=6773fde4&hm=62eb76d4307a54af041c5ba48a68bef51b1f7d5761b170eb1b44a4333d7d6f5a&=&format=webp&quality=lossless&width=832&height=468",
	"https://media.discordapp.net/attachments/1316608373424128001/1323657306126155817/JFK.png?ex=67754f6e&is=6773fdee&hm=1c4b99c6cbcd9cfbd19f7356df2b9459e3d1a68442238ca25d3ee9237b0c96cb&=&format=webp&quality=lossless&width=832&height=468",
	"https://cdn.discordapp.com/attachments/1316610681969053757/1330274333519646760/B-59.png?ex=678d6204&is=678c1084&hm=5073bb79d8eed2cbaca11a295aee796ea76949ab4ee5a20944adea4e42e894c0&",
	"https://cdn.discordapp.com/attachments/1316610681969053757/1330274333997662399/BlackDeath.png?ex=678d6204&is=678c1084&hm=d29bd22385236fea369a77ebe53a46a0d2c1904f89cb931ab1ca893819140096&",
	"https://cdn.discordapp.com/attachments/1316610681969053757/1330274334434000916/Chernobyl.png?ex=678d6204&is=678c1084&hm=7c24b2bdb787c29048c899956d4d6d2c55f1e437deed84de7911388856b1a3e1&",
	"https://cdn.discordapp.com/attachments/1316610681969053757/1330274334886858752/Covid19.png?ex=678d6204&is=678c1084&hm=64fcdf3bdb9b2c582d27ded7342f1362b97a81e3e8fba1488f5d37afc575d06d&",
	"https://cdn.discordapp.com/attachments/1316610681969053757/1330274335377854536/IraqWar.png?ex=678d6204&is=678c1084&hm=27a0404d998ea58d645c0346112fb04bd96eec823daaf273f250f46406fd3179&",
	"https://cdn.discordapp.com/attachments/1316610681969053757/1330274335826641036/ManhattanProject.png?ex=678d6204&is=678c1084&hm=7e638727d2055076372af544423c29a41dd4764517e5ab87b46754cb8a47faa3&",
	"https://cdn.discordapp.com/attachments/1316610681969053757/1330274336204001410/PearlHarbor.png?ex=678d6205&is=678c1085&hm=0e736a5239781597d19523b4812ac6da3b5107b3167f9b04d330a87f19376449&",
	"https://cdn.discordapp.com/attachments/1316610681969053757/1345520156192800871/carcercity.png?ex=67c4d8cb&is=67c3874b&hm=41b15f77c56465b6da0ff1b8fbc2b7822c604cf79d946ca12d0f00b2092d599b&"
];

	const lazyCrime = crime[Math.floor(Math.random() * crime.length)];
	interaction.reply(`${lazyCrime}`)
}