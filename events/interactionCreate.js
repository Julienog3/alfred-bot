const sequelize = require('../sequelize');

const Users = sequelize.model('user');

const rarities = [
    {
        id: 'common',
        name: 'Commune',
        color: '#707070',
        probability: 100,
        price: 10
    },
    {
        id: 'uncommon',
        name: 'Peu commune',
        color: '#009e35',
        probability: 50,
        price: 50
    },
    {
        id: 'rare',
        name: 'Rare',
        color: '#0073ff',
        probability: 25,
        price: 100
    },
    {
        id: 'epic',
        name: 'Epique',
        color: '#b300ff',
        probability: 10,
        price: 500
    },
    {
        id: 'legendary',
        name: 'Légendaire',
        color: '#ffd000',
        probability: 1,
        price: 1000
    },
]

const getPriceOfRarity = (rarityName) => {
    return rarities.find(({ name }) => rarityName === name).price;
}

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);    
            
            if (!command) return;
    
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Aïe ! Tu viens de rencontrer un deep problème, envoie un à Julien Auger et dis lui que son bot est éclaté', ephemeral: true });
            }   
        }        
	},
};