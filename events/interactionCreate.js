module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(error);
				await interaction.reply({ content: 'Aïe ! Tu viens de rencontrer un deep problème, envoie un à Julien Auger et dis lui que son bot est éclaté', ephemeral: true });
			}
		}
	},
};