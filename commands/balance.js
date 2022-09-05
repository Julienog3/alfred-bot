const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Affiche votre nombre de Deep Coin'),
	async execute(interaction, user) {
		const { money } = user;

		return interaction.reply(`Vous avez actuellement **${money}** <:deepcoin:1006995844970586164>`);
	},
};