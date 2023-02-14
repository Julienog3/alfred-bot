const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('card', {
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		artistId: {
			type: DataTypes.STRING,
		},
		rarityId: {
			type: DataTypes.INTEGER,
		},
	}, {
		updatedAt: false,
	});
};