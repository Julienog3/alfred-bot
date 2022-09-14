const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const User = require('./models/user.model')(sequelize);
const Rarity = require('./models/rarity.model')(sequelize);
const Card = require('./models/card.model')(sequelize);

User.hasMany(Card);
Card.belongsTo(User);

sequelize.sync()
	.then(async () => {

		const rarities = [
			await Rarity.upsert({ name: 'Commun', color: '#707070', probability: 100, price: 10 }),
			await Rarity.upsert({ name: 'Peu commun', color: '#009e35', probability: 50, price: 50 }),
			await Rarity.upsert({ name: 'Rare', color: '#0073ff', probability: 25, price: 100 }),
			await Rarity.upsert({ name: 'Epique', color: '#b300ff', probability: 10, price: 500 }),
			await Rarity.upsert({ name: 'Légendaire', color: '#ffd000', probability: 1, price: 1000 }),
		];

		await Promise.all(rarities);
		console.log('📚 All models are synchronized');

		// sequelize.close();
	})
	.catch(err => {
		console.error(err);
	});

module.exports = sequelize;