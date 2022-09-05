const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('rarity', {
		id: {
			type: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
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