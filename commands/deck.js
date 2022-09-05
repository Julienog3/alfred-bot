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

		await interaction.deferReply();
		const deck = [];

		const cards = await Card.findAll({ where: { userId: user.id } });

		await Promise.all(
			cards.map(async (card) => {
				const name = await getProperties(card.dataValues.artistId, process.env.NOTION_NAME_ID).then((res) => res.results[0].title.text.content);
				const rarity = await Rarity.findOne({ where: { id: card.dataValues.rarityId } });

				deck.push({
					name,
					value: rarity.dataValues.name,
					inline: false,
				});
			}),
		);

		const deckEmbed = new MessageEmbed()
			.setTitle(`Deck de cartes de ${interaction.member.user.username}`)
			.addFields(deck);

		return interaction.editReply({ embeds: [deckEmbed] });
	},
};