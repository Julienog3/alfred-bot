const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../sequelize');

const { Client } = require('@notionhq/client');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

require('dotenv').config();

const { Op } = require('sequelize');

const Users = sequelize.model('user');
const Rarities = sequelize.model('rarity');
const Cards = sequelize.model('card');

const notion = new Client({
	auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

const getArtists = async () => {
	const notionPages = await notion.databases.query({ database_id: databaseId }).then((res) => res.results);
	return notionPages;
};

const getRarity = async () => {
	const roll = Math.floor(Math.random() * 100);

	const res = await Rarities.findAll({
		where: {
			probability: {
				[Op.gte]: roll,
			},
		},
		order: [
			['probability', 'ASC'],
		],
		raw: true,
	});
	return res[0];
};


const getProperties = async (pageId, propertyId) => {
	const response = await notion.pages.properties.retrieve({ page_id: pageId, property_id: propertyId });
	return response;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('card')
		.setDescription('Donne une carte aléatoire représentant un artiste'),
	async execute(interaction) {

		let user = await Users.findOne({ where: { id: interaction.member.id } });

		const artists = await getArtists();

		const selectedArtist = artists[Math.floor(Math.random() * artists.length)];

		const name = await getProperties(selectedArtist.id, process.env.NOTION_NAME_ID).then((res) => res.results[0].title.text.content);
		const image = await getProperties(selectedArtist.id, process.env.NOTION_IMAGE_ID).then((res) => res.files[0].file.url);

		const rarity = await getRarity();

		const filter = i => i.user.id === interaction.user.id;

		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

		const coinEmoji = '<:deepcoin:1006995844970586164>';

		if (!user) {
			try {
				user = await Users.create({
					id: interaction.member.id,
					username: interaction.member.user.username,
				});
			}
			catch (err) {
				console.log(err);
			}
		}

		const cardEmbed = new MessageEmbed()
			.setTitle(`🃏 Vous avez obtenu **${name}**`)
			.addFields([
				{ name: 'Rareté', value: rarity.name, inline: false },
				{ name: 'Valeur', value: `${rarity.price} ${coinEmoji}`, inline: false },
			])
			.setDescription(`Il ne te reste plus que ${user.cards - 1} carte${user.cards > 1 ? 's' : ''} à ouvrir`)
			.setColor(rarity.color)
			.setImage(image);

		collector.once('collect', async (buttonInteraction) => {
			const id = buttonInteraction.customId;

			if (id === 'sell') {
                await Users.update({ money: user.money + rarity.price }, { where: { id: interaction.member.id }})

				await buttonInteraction.reply({ content: `Vous avez vendu **${name} en ${rarity.name}** pour **${rarity.price}** ${coinEmoji}`, ephemeral: true });
			}
			else if (id === 'collect') {
                const card = await Cards.create({ 
                    userId: interaction.member.id,
                    artistId: selectedArtist.id,
                    rarityId: rarity.id
                })

				await buttonInteraction.reply({ content: `Vous avez récupérer **${name} en ${rarity.name}**`, ephemeral: true });
			}
		});

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

		if (user.cards > 0) {
			await interaction.deferReply();

			await Users.decrement('cards', { where: { id: interaction.member.id } });
			await user.save();

			return interaction.editReply({ embeds: [cardEmbed], components: [row] });
		}
		else {
			return interaction.reply('Désolé tu n\'as plus de cartes pour aujourd\'hui, reviens demain 👋');
		}
	},
};

