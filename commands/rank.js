const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sequelize = require('../sequelize');

const Users = sequelize.model('user');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Affiche le classement des quoi'),
	async execute(interaction) {
     	let userList = await Users.findAll({ attributes: ['username', 'count'], limit: 3, order: [['count', 'DESC']] } );

        const medals = ['🥇', '🥈', '🥉']
        const fields = []

        userList.map((user, i) => {
            let field = {
                "name": `${medals[i]} ${user.username}`,
                "value": `${user.count} quoi`
            }

            fields.push(field)
        })       

        const rankEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Leaderboard')
            .setAuthor({ name: 'AlfredBot', iconURL: 'https://i1.sndcdn.com/avatars-MmuJFpzZtMItCYzd-3DJJqQ-t500x500.jpg' })
            .setFields(fields)
            .setTimestamp()
            .setFooter({ text: 'AlfredBot', iconURL: 'https://i1.sndcdn.com/avatars-MmuJFpzZtMItCYzd-3DJJqQ-t500x500.jpg' });

		await interaction.reply({ embeds: [rankEmbed] });
	},
};