const sequelize = require('../sequelize');

const Users = sequelize.model('user');

module.exports = {
	name: 'messageCreate',
	async execute(msg) {
		if (!msg.author.bot && msg.channel.type !== 'dm') {

			let message = msg.content.replace(/ /g, '');

			if (message[message.length - 1] === '?') message = message.slice(0, -1);

			if (message.slice(-4).localeCompare('quoi', 'fr', { sensitivity: 'base' }) === 0) {
				const pourcentage = Math.floor(Math.random() * 101);

				const user = (await Users.count({ where: { discord_id: msg.author.id } })) >= 1
					? await Users.findOne({ where: { discord_id: msg.author.id } })
					: await Users.create({
						discord_id: msg.author.id,
						username: msg.author.username,
					});

				if (user) {
					Users.increment('count', { where: { id: msg.author.id } });
				}

				if (pourcentage <= 5) {
					msg.reply('drilatère');
				}
				else {
					msg.reply('feur !');
				}
			}
		}
	},
};