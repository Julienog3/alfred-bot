const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('card', {
		id: {
			type: DataTypes.UUIDV4,
			unique: true,
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		artistId: {
			type: DataTypes.INTEGER,
		},
		rarityId: {
			type: DataTypes.INTEGER,
		},
	}, {
		updatedAt: false,
	});
};