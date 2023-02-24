const { Client } = require('@notionhq/client');
const notion = new Client({
	auth: process.env.NOTION_TOKEN,
});

const getAllArtists = async (cursor = undefined, artists = []) => {
	const { results: data, next_cursor: nextCursor } = await notion.databases.query({
		database_id: process.env.NOTION_DATABASE_ID,
		page_size: 100,
		start_cursor: cursor,
	});

	const allArtists = [...artists, ...data];

	if (nextCursor) {
		return getAllArtists(nextCursor, allArtists);
	}
	else {
		return allArtists;
	}
};

module.exports = {
	getAllArtists,
	getProperties: async (pageId, propertyId) => {
		return await notion.pages.properties.retrieve({ page_id: pageId, property_id: propertyId });
	},
};
