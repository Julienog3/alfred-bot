const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../sequelize');
const Canvas = require('canvas');

const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

const { getProperties, getAllArtists } = require('../utils/notion.service');
const { getRarity } = require('../utils/database.service');
const sharp = require('sharp');
const axios = require('axios');
const Cards = sequelize.model('card');

const RaritiesBorders = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function roundedImage({ ctx, x, y, width, height, radius }) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('card')
		.setDescription('Donne une carte aléatoire représentant un artiste'),
	async execute(interaction, user) {
		await interaction.deferReply();

		if (user.attemps < 1) {
			return await interaction.followUp({
				content: 'Désolé tu n\'as plus de cartes pour aujourd\'hui, reviens demain 👋',
				ephemeral: true,
			});
		}

		const artists = await getAllArtists();

		const selectedArtist = artists[Math.floor(Math.random() * artists.length)];

		const rarity = await getRarity();
		const coinEmoji = '<:deepcoin:1006995844970586164>';

		const name = await getProperties(selectedArtist.id, process.env.NOTION_NAME_ID).then((res) => res.results[0].title.text.content);
		const image = await getProperties(selectedArtist.id, process.env.NOTION_IMAGE_ID).then((res) => res.files[0].file.url);

		const imageResponse = await axios.get(image, {
			responseType: 'arraybuffer',
		}).then((res) => res.data);

		const img = await sharp(imageResponse).toFormat('png').toBuffer();

		const canvas = Canvas.createCanvas(800, 1200);
		const context = canvas.getContext('2d');


		const artistImage = await Canvas.loadImage(img);
		const borderImage = await Canvas.loadImage(`./images/${RaritiesBorders[rarity.id - 1]}.png`);

		const photoScale = Math.max(canvas.width / artistImage.width, canvas.height / artistImage.height);
		const photoWidth = artistImage.width * photoScale;
		const photoHeight = artistImage.height * photoScale;

		const marginTop = (canvas.height - photoHeight) / 2;
		const marginLeft = (canvas.width - photoWidth) / 2;

		roundedImage({
			ctx: context,
			x: 0,
			y: 0,
			width: canvas.width,
			height: canvas.height,
			radius: 55,
		});
		context.clip();

		// context.drawImage(artistImage, marginLeft, marginTop, photoWidth, photoHeight, 30, 50, canvas.width - 60, canvas.height - 100);
		context.drawImage(artistImage, marginLeft, marginTop, photoWidth, photoHeight);
		context.drawImage(borderImage, 40, 80, 1692, 2321, 0, 0, canvas.width, canvas.height);


		const attachment = new MessageAttachment(canvas.toBuffer(), 'artist-image.png');


		const cardEmbed = new MessageEmbed()
			.setTitle(`🃏 Vous avez obtenu **${name}**`)
			.addFields([
				{ name: 'Rareté', value: rarity.name, inline: false },
				{ name: 'Valeur', value: `${rarity.price} ${coinEmoji}`, inline: false },
			])
			.setDescription(`Il ne te reste plus que ${user.attemps - 1} carte${user.attemps > 1 ? 's' : ''} à ouvrir`)
			.setColor(rarity.color)
			.setImage('attachment://artist-image.png');

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('collect')
					.setLabel('Récupérer')
					.setStyle('SUCCESS'),
			)
			.addComponents(
				new MessageButton()
					.setCustomId('sell')
					.setLabel('Vendre')
					.setStyle('DANGER'),
			);

		const disabledRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('collect')
					.setLabel('Récupérer')
					.setDisabled(true)
					.setStyle('SUCCESS'),
			)
			.addComponents(
				new MessageButton()
					.setCustomId('sell')
					.setLabel('Vendre')
					.setDisabled(true)
					.setStyle('DANGER'),
			);

		user.attemps -= 1;
		await user.save();

		await interaction.followUp({
			embeds: [cardEmbed],
			files: [attachment],
			components: [row],
			fetchReply: true,
		})
			.then((msg) => {
				const filter = i => {
					return i.user.id === interaction.member.id && i.message.id === msg.id;
				};

				const collector = msg.channel.createMessageComponentCollector({
					filter,
					componentType: 'BUTTON',
					time: 300000,
					max: 1,
				});

				collector.on('collect', async (buttonInteraction) => {
					const id = buttonInteraction.customId;

					await buttonInteraction.deferReply();
					await msg.edit({ embeds: [cardEmbed], components: [disabledRow], fetchReply: true });

					let message;

					if (id === 'sell') {
						user.money += rarity.price;
						await user.save();

						message = {
							content: `Vous avez vendu **${name} en ${rarity.name}** pour **${rarity.price}** ${coinEmoji}`,
							ephemeral: true,
						};
					}
					else if (id === 'collect') {

						const card = await Cards.create({
							artistId: selectedArtist.id,
							rarityId: rarity.id,
						});

						if (card) {
							await user.addCard(card).catch((err) => console.error(err));
							await user.save();
						}

						message = {
							content: `Vous avez récupérer **${name} en ${rarity.name}**`,
							ephemeral: true,
						};
					}

					await buttonInteraction.followUp(message);
				});
			});
	},
};

