const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../sequelize');

const { Client } = require("@notionhq/client");
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

require('dotenv').config();

const Users = sequelize.model('user');

const rarities = [
    {
        name: 'Commune',
        color: '#707070',
        probability: '100'
    },
    {
        name: 'Peu commune',
        color: '#009e35',
        probability: '50'
    },
    {
        name: 'Rare',
        color: '#0073ff',
        probability: '25'
    },
    {
        name: 'Epique',
        color: '#b300ff',
        probability: '10'
    },
    {
        name: 'Légendaire',
        color: '#ffd000',
        probability: '1'
    },
]

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})

const databaseId = process.env.NOTION_DATABASE_ID

const getArtists = async () => {
    const notionPages = await notion.databases.query({ database_id: databaseId }).then((res) => res.results);
    return notionPages;
}

const getRarity = () => {
    const roll = Math.floor(Math.random() * 100);

    const res = rarities.filter(({ probability }) => roll <= probability).sort((a, b) => a.probability - b.probability)
    return res[0];
}


const getProperties = async (pageId, propertyId) => {    
    const response = await notion.pages.properties.retrieve({ page_id: pageId, property_id: propertyId });
    return response;
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('card')
		.setDescription('Donne une carte aléatoire représentant un artiste'),
	async execute(interaction) {
        await interaction.deferReply();

        const artists = await getArtists();

        const selectedArtist = artists[Math.floor(Math.random() * artists.length)]

        const name = await getProperties(selectedArtist.id, process.env.NOTION_NAME_ID).then((res) => res.results[0].title.text.content)
        const image = await getProperties(selectedArtist.id, process.env.NOTION_IMAGE_ID).then((res) => res.files[0].file.url)

        const rarity = getRarity();

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
					.setStyle('DANGER')
                    .setEmoji('💰')

			);

        const cardEmbed = new MessageEmbed()
            .setTitle(`🃏 Vous avez obtenu **${name}**`)
            .setDescription(`Rareté : ${rarity.name}`)
            .setColor(rarity.color)
            .setImage(image)

		return interaction.editReply({ embeds: [cardEmbed], components: [row] });
	},
};

