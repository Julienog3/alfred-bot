const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const User = require('./models/user.model')(sequelize);
const Raritie = require('./models/rarity.model')(sequelize);
const Card = require('./models/card.model')(sequelize);

User.hasMany(Card, { 
	as: 'deck',
	foreignKey: 'userId'
	
});
Card.belongsTo(User)


module.exports = sequelize;