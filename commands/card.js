const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../sequelize');

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const { getArtists, getProperties } = require('../utils/notion.service');
const { getRarity } = require('../utils/database.service');
const Cards = sequelize.model('card');

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

		const artists = await getArtists();

		const selectedArtist = artists[Math.floor(Math.random() * artists.length)];

		const name = await getProperties(selectedArtist.id, process.env.NOTION_NAME_ID).then((res) => res.results[0].title.text.content);
		const image = await getProperties(selectedArtist.id, process.env.NOTION_IMAGE_ID).then((res) => res.files[0].file.url);

		const rarity = await getRarity();
		const coinEmoji = '<:deepcoin:1006995844970586164>';

		const cardEmbed = new MessageEmbed()
			.setTitle(`🃏 Vous avez obtenu **${name}**`)
			.addFields([
				{ name: 'Rareté', value: rarity.name, inline: false },
				{ name: 'Valeur', value: `${rarity.price} ${coinEmoji}`, inline: false },
			])
			.setDescription(`Il ne te reste plus que ${user.attemps - 1} carte${user.attemps > 1 ? 's' : ''} à ouvrir`)
			.setColor(rarity.color)
			.setImage(image);

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

		await interaction.followUp({ embeds: [cardEmbed], components: [row], fetchReply: true })
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

