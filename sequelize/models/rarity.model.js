const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('rarity', {
		id: {
			type: DataTypes.UUIDV4,
			// unique: true,
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