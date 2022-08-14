const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER,
			unique: true,
			primaryKey: true,
		},
		username: {
			type: DataTypes.STRING,
		},
		count: {
			type: DataTypes.INTEGER,
		},
		money: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		cards: {
			type: DataTypes.INTEGER,
			defaultValue: 3,
		},
	});

};