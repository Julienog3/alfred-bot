const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../sequelize');

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
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

		const rarityEmojis = ['⚪', '🟢', '🔵', '🟣', '🟡'];

		const cards = await Card.findAll({ where: { userId: user.id } });

		let currentPage = 0;

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

		const getButtons = () => {
			return new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('previous')
						.setEmoji('⬅️')
						.setStyle('PRIMARY')
						.setDisabled(currentPage === 0),
				)
				.addComponents(
					new MessageButton()
						.setCustomId('next')
						.setEmoji('➡️')
						.setStyle('PRIMARY')
						.setDisabled((currentPage + 1) * 6 > deck.length),
				);
		};


		deck.sort((a, b) => {
			return new Date(b.card.dataValues.createdAt) - new Date(a.card.dataValues.createdAt);
		});

		const formatedDeck = deck.map((card) => ({
			name: card.name,
			value: card.rarity,
			inline: false,
		}));

		const getPage = (array, page = 0) => {
			return array.slice(page * 6, (page + 1) * 6);
		};


		const getDeckEmbed = () => {
			const deckEmbed = new MessageEmbed()
				.setTitle(`Deck de cartes de ${interaction.member.user.username}`)
				.setDescription(`🃏 Nombre de cartes : \`${deck.length}\``)
				.setThumbnail(interaction.user.displayAvatarURL())
				.addFields(getPage(formatedDeck, currentPage));

			return deckEmbed;
		};


		await interaction.editReply({ embeds: [getDeckEmbed()], components: [getButtons()], fetchReply: true }).then((msg) => {
			const filter = i => {
				return i.user.id === interaction.member.id && i.message.id === msg.id;
			};

			const collector = interaction.channel.createMessageComponentCollector({
				filter,
				componentType: 'BUTTON',
				time: 300000,
			});

			collector.on('collect', async (buttonInteraction) => {
				if (!buttonInteraction) {
					return;
				}

				buttonInteraction.deferUpdate();

				if (buttonInteraction.customId !== 'previous' && buttonInteraction.customId !== 'next') {
					return;
				}

				if (buttonInteraction.customId === 'previous' && currentPage > 0) {
					currentPage -= 1;
					await interaction.editReply({ embeds: [getDeckEmbed()], components: [getButtons()] });
				}
				else if (buttonInteraction.customId === 'next') {
					currentPage += 1;
					await interaction.editReply({ embeds: [getDeckEmbed()], components: [getButtons()] });
				}
			});
		});
	},
};