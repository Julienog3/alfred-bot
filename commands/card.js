const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../sequelize');

const { Client } = require("@notionhq/client")

require('dotenv').config();

const Users = sequelize.model('user');

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})

const databaseId = process.env.NOTION_DATABASE_ID

const getDatabase = async () => {
    const response = await notion.databases.retrieve({
        database_id: databaseId
    })
    return response
}

const notionPropertiesById = (properties) => {
    return Object.values(properties).reduce((obj, property) => {
        const { id, ...rest } = property
        return { obj, [id]: rest }
    })
}

const fromNotionPages = (notionPage) => {
    const propertiesById = notionPropertiesById(notionPage.properties);

    console.log(notionPage)

    return {
        id: notionPage.id,
        // name: propertiesById[process.env.NOTION_NAME_ID].title[0].plain_text,
        // image: propertiesById[process.env.NOTION_IMAGE_ID].image,
        // rarity: propertiesById[process.env.NOTION_RARITY_ID].select
    }
}

const getArtists = async () => {
    const notionPages = await notion.databases.query({ database_id: databaseId }).then((res) => res.results);
    return notionPages.map(fromNotionPages);
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('card')
		.setDescription('Affiche votre nombre de Deep Coin'),
	async execute(interaction) {
        const artists = getArtists();

		return interaction.reply(`card`);
	},
};