const { Op } = require('sequelize');
const sequelize = require('../sequelize');
const Rarities = sequelize.model('rarity');

module.exports = {
	getRarity: async () => {
		const roll = Math.floor(Math.random() * 100);

		const t = await Rarities.findAll();
		console.log(t);

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
};
