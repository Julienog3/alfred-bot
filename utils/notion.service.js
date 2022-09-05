const { Client } = require('@notionhq/client');
const notion = new Client({
	auth: process.env.NOTION_TOKEN,
});

module.exports = {
	getArtists: async () => {
		return await notion.databases.query({ database_id: process.env.NOTION_DATABASE_ID }).then((res) => res.results);
	},
	getProperties: async (pageId, propertyId) => {
		return await notion.pages.properties.retrieve({ page_id: pageId, property_id: propertyId });
	},
};
