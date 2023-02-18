const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageSelectMenu, MessageActionRow } = require('discord.js');
const sequelize = require('../sequelize');
const { getProperties } = require('../utils/notion.service');


const Card = sequelize.model('card');
const Rarity = sequelize.model('rarity');

const coinEmoji = '<:deepcoin:1006995844970586164>';


module.exports = {
	data: new SlashCommandBuilder()
		.setName('sell')
		.setDescription('Vendre une carte de ton deck'),
	async execute(interaction, user) {

		await interaction.deferReply();
		const deck = [];

		const rarityEmojis = ['⚪', '🟢', '🔵', '🟣', '🟡'];

		const cards = await Card.findAll({ where: { userId: user.id } });

		if (cards.length < 1) {
			return await interaction.followUp({
				content: 'Désolé tu n\'as pas de cartes dans ton deck',
				ephemeral: true,
			});
		}

		await Promise.all(
			cards.map(async (card) => {
				const name = await getProperties(card.dataValues.artistId, process.env.NOTION_NAME_ID).then((res) => res.results[0].title.text.content);
				const rarity = await Rarity.findOne({ where: { id: card.dataValues.rarityId } });

				deck.push({
					card,
					name,
					value: rarity.dataValues.name,
					rarity: `${rarityEmojis[rarity.dataValues.id - 1]} ${rarity.dataValues.name}`,
				});
			}),
		);

		deck.sort((a, b) => {
			return new Date(b.card.dataValues.createdAt) - new Date(a.card.dataValues.createdAt);
		});

		const formatedDeck = deck.map((card) => ({
			label: card.name,
			description: card.rarity,
			value: card.card.id,
		}));

		const menu = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Sélectionne une carte')
					.addOptions(formatedDeck),
			);


		await interaction.followUp({ components: [menu] }).then((msg) => {

			const filter = i => {
				i.deferUpdate();
				return i.user.id === interaction.member.id && i.message.id === msg.id;
			};

			const selectMenuCollector = msg.channel.createMessageComponentCollector({
				filter,
				componentType: 'SELECT_MENU',
				time: 300000,
				max: 1,
			});

			selectMenuCollector.on('collect', async (selectInteraction) => {
				const soldCard = await Card.findOne({ where: { id: selectInteraction.values[0] } });

				const name = await getProperties(soldCard.dataValues.artistId, process.env.NOTION_NAME_ID).then((res) => res.results[0].title.text.content);
				const rarity = await Rarity.findOne({ where: { id: soldCard.dataValues.rarityId } });

				await Card.destroy({ where: { id: selectInteraction.values[0] } });

				user.money += rarity.price;
				await user.save();

				await selectInteraction.followUp({
					content: `Vous avez vendu **${name} en ${rarity.name}** pour **${rarity.price}** ${coinEmoji}`,
					ephemeral: true,
				});
			});
		});
	},
};