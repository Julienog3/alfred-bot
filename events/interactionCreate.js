const sequelize = require('../sequelize');

const Users = sequelize.model('user');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				return interaction.reply({
					content: 'Aïe ! Tu viens d\'utiliser une commande qui n\'existe pas',
				});
			}

			const user = (await Users.count({ where: { discord_id: interaction.member.id } })) >= 1
				? await Users.findOne({ where: { discord_id: interaction.member.id } })
				: await Users.create({
					discord_id: interaction.member.id,
					username: interaction.member.user.username,
				});

			try {
				await command.execute(interaction, user);
			}
			catch (error) {
				console.error(error);
				await interaction.reply({ content: 'Aïe ! Tu viens de rencontrer un deep problème, envoie un MP à Ju\' et dis lui que son bot est éclaté', ephemeral: true });
			}
		}
	},
};