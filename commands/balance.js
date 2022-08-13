const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelize = require('../sequelize');

const Users = sequelize.model('user');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Affiche votre nombre de Deep Coin'),
	async execute(interaction) {
		const { money } = await Users.findOne({ where: { id: interaction.member.id } });

		return interaction.reply(`Vous avez actuellement **${money}** <:deepcoin:1006995844970586164>`);
	},
};