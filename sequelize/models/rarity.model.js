const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('rarity', {
        id: {
            type: DataTypes.UUIDV4,
            unique: true,
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
        }
    }, {
        timestamps: false
    });
}