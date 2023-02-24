const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('artist', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		image: {
			type: DataTypes.STRING,
		},
	});

};