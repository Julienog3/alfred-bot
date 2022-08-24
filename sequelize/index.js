const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const User = require('./models/user.model')(sequelize);
require('./models/rarity.model')(sequelize);
const Card = require('./models/card.model')(sequelize);

User.hasMany(Card, {
	as: 'Card',
	onDelete: 'CASCADE',
});

// Card.belongsTo(User, {

// });

sequelize.sync({ force: false })
	.then(() => console.log('📚 All models are synchronized'))
	.catch((err) => console.error(err));

module.exports = sequelize;