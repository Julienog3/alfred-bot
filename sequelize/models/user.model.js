const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
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