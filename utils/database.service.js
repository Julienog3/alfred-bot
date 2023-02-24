const { Op, Sequelize } = require('sequelize');
const sequelize = require('../sequelize');
const Rarities = sequelize.model('rarity');
const Artists = sequelize.model('artist');

module.exports = {
	getRarity: async () => {
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
	},

	getRandomCard: async () => {
		return await Artists.findAll({ order: sequelize.random(), limit: 1 });
	},
};
