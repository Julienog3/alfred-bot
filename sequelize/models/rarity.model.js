const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('rarity', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
		},
		color: {
			type: DataTypes.STRING,
		},
		probability: {
			type: DataTypes.INTEGER,
		},
		price: {
			type: DataTypes.INTEGER,
		},
	}, {
		timestamps: false,
	});
};