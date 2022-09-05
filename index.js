// Require the necessary discord.js classes
const { Client, Intents, Collection } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();

// Create client Discord
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

commandFiles.map((file) => {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

eventFiles.map((file) => {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);

process.on('unhandledRejection', (reason, promise) => {
	console.error('\n\n========================================= Unhandled Rejection Error ========================================');
	console.error(reason);
	console.error(promise);
	console.error('============================================================================================================\n\n');
});

process.on('uncaughtException', (error, origin) => {
	console.error('\n\n========================================= Uncaught Exception Error =========================================');
	console.error(error);
	console.error(origin);
	console.error('============================================================================================================\n\n');
});

process.on('uncaughtExceptionMonitor', (error, origin) => {
	console.error('\n\n========================================= Uncaught Exception Error =========================================');
	console.error(error);
	console.error(origin);
	console.error('============================================================================================================\n\n');
});
