const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		discord_id: {
			type: DataTypes.STRING,
			unique: true,
		},
		username: {
			type: DataTypes.STRING,
		},
		count: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		money: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		attemps: {
			type: DataTypes.INTEGER,
			defaultValue: 3,
		},
	});

};