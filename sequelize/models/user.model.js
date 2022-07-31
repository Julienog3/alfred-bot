const { Sequelize } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER,
            unique: true,
            primaryKey: true
        },    
        username: {
            type: Sequelize.STRING,
        },
        count: {
            type: Sequelize .INTEGER,
        }
    });
}