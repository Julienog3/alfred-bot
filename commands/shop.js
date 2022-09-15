const { SlashCommandBuilder } = require('@discordjs/builders');

const PRICE = 50;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Affiche la boutique')
		.addStringOption(option =>
			option.setName('item')
				.setDescription('\'élément choisi')
				.setRequired(true)
				.addChoices(
					{ name: 'Une carte (50 💰)', value: 'cards_1' },
					{ name: '5 cartes (250 💰)', value: 'cards_5' },
					{ name: '10 cartes (500 💰)', value: 'cards_10' },
				),
		),
	async execute(interaction, user) {

		const item = interaction.options.get('item');
		const amount = parseInt(item.value.slice(6));

		const getTotalPrice = () => {
			return amount * PRICE;
		};

		if (user.money >= getTotalPrice()) {
			user.money -= getTotalPrice();
			user.attemps += amount;

			await user.save().then(() => {
				return interaction.reply(`Vous avez achetez **${amount}** cartes pour ${getTotalPrice()} <:deepcoin:1006995844970586164>`);
			});
		}
		else {
			return interaction.reply('Vous n\'avez pas assez de <:deepcoin:1006995844970586164> deepcoins ');
		}
	},
};