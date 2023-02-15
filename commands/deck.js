const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../sequelize');

const { MessageEmbed } = require('discord.js');
const { getProperties } = require('../utils/notion.service');

require('dotenv').config();

const Card = sequelize.model('card');
const Rarity = sequelize.model('rarity');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deck')
		.setDescription('Affiche votre deck de cartes'),
	async execute(interaction, user) {

		user.attemps += 5;
		await user.save();

		await interaction.deferReply();
		const deck = [];

		const rarityEmojis = ['⚪', '🟢', '🔵', '🟣', '🟡'];

		const cards = await Card.findAll({ where: { userId: user.id } });

		await Promise.all(
			cards.map(async (card) => {
				const name = await getProperties(card.dataValues.artistId, process.env.NOTION_NAME_ID).then((res) => res.results[0].title.text.content);
				const rarity = await Rarity.findOne({ where: { id: card.dataValues.rarityId } });

				deck.push({
					card,
					name,
					rarity: `${rarityEmojis[rarity.dataValues.id - 1]} ${rarity.dataValues.name}`,
				});
			}),
		);

		const cardsNb = deck.length;

		deck.sort((a, b) => {
			return new Date(b.card.dataValues.createdAt) - new Date(a.card.dataValues.createdAt);
		});

		const formatedDeck = deck.map((card) => ({
			name: card.name,
			value: card.rarity,
			inline: false,
		}));

		const deckEmbed = new MessageEmbed()
			.setTitle(`Deck de cartes de ${interaction.member.user.username}`)
			.setDescription(`🃏 Nombre de cartes : \`${cardsNb}\``)
			.setThumbnail(interaction.user.displayAvatarURL())
			.addFields(formatedDeck);

		return interaction.editReply({ embeds: [deckEmbed] });
	},
};