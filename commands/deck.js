const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../sequelize');

const { MessageEmbed } = require('discord.js');

require('dotenv').config();

const { Client } = require('@notionhq/client');

const User = sequelize.model('user');
const Card = sequelize.model('card');
const Rarity = sequelize.model('rarity');

const notion = new Client({
	auth: process.env.NOTION_TOKEN,
});

const getProperties = async (pageId, propertyId) => {
	const response = await notion.pages.properties.retrieve({ page_id: pageId, property_id: propertyId });
	return response;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deck')
		.setDescription('Affiche votre deck de cartes'),
	async execute(interaction) {
		
		await interaction.deferReply();
		const deck = [];

        const cards = await Card.findAll({ where: { userId: interaction.member.id } })

		await Promise.all(
			cards.map(async (card) => {
				const name = await getProperties(card.dataValues.artistId, process.env.NOTION_NAME_ID).then((res) => res.results[0].title.text.content);
				const rarity = await Rarity.findOne({ where: { id: card.dataValues.rarityId} })

				deck.push({
					name,
					value: rarity.dataValues.name,
					inline: false
				})
			})
		)

		const deckEmbed = new MessageEmbed()
			.setTitle(`Deck de cartes de ${interaction.member.user.username}`)
			.addFields(deck)

		return interaction.editReply({ embeds: [deckEmbed] });
	},
};