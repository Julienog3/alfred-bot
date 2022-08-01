// Require the necessary discord.js classes
const { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } = require('twitter-api-v2');
const { Client, Intents, MessageEmbed, MessageAttachment, Collection  } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Canvas = require('canvas');

const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config()

const sequelize = require('./sequelize');

const { HttpsProxyAgent } = require('https-proxy-agent');

// Create proxy for Twitter
const proxy = process.env.HTTP_PROXY || 'https://1.1.1.1:3000';
const httpsAgent = new HttpsProxyAgent(proxy);

// Users Sequelize Model
const Users = sequelize.model('user');

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
})

// Create client Twitter
const twitterClient = new TwitterApi(process.env.BEARER_TOKEN, { httpsAgent });

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log(`🏁 Ready at ${new Date(client.readyTimestamp).toLocaleString()}`);

    client.user.setPresence({
        activities: [{ 
          name: "WINNTERZUKO DANS LA TCHOP",
          type: "LISTENING"
        }],
        status: "online"
    })

    sequelize.sync({ force: false, alter: true })

    //const user = await twitterClient.v2.userByUsername('lowkeypack')

    await twitterClient.v2.updateStreamRules({
        add: [
            { value: 'from:lowkeypack' },
            { value: '-is:retweet' }
        ],
    });

    // await twitterClient.v2.updateStreamRules({
    //     add: [{ value: 'from:og_julien' }],
    //   });
   
    const stream = await twitterClient.v2.searchStream({
        autoConnect: false,
        'tweet.fields': ['referenced_tweets', 'author_id'],
        expansions: ['referenced_tweets.id'],
    });

    stream.on(ETwitterStreamEvent.Connected, () => console.log('👌 Twitter Stream is OK'));

    await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });

    // Awaits for a tweet
    stream.on(
        // Emitted when Node.js {response} emits a 'error' event (contains its payload).
        ETwitterStreamEvent.ConnectionError,
        err => console.log('Connection error!', err),
    );
    
    stream.on(
        // Emitted when Node.js {response} is closed by remote or using .close().
        ETwitterStreamEvent.ConnectionClosed,
        () => console.log('Connection has been closed.'),
    );
    
    stream.on(
        // Emitted when a Twitter payload (a tweet or not, given the endpoint).
        ETwitterStreamEvent.Data,
        eventData => {
            console.log(eventData)

            const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Nouveau post de lowkey')
            .setURL(`https://twitter.com/twitter/status/${eventData.data.id}`)
            .setAuthor({ name: 'Lowkey', iconURL: 'https://pbs.twimg.com/profile_images/1485709553064980484/UB46MIOx_400x400.jpg', url: 'https://twitter.com/Lowkeypack' })
            .setDescription(eventData.data.text)
            .setThumbnail('https://pbs.twimg.com/profile_banners/1481569384984363011/1642953605/1500x500')
            .setTimestamp()
            .setFooter({ text: 'Lowkey', iconURL: 'https://pbs.twimg.com/profile_images/1485709553064980484/UB46MIOx_400x400.jpg' });

            client.channels.fetch('958358037960212612').then(channel => {
                channel.send({ embeds: [exampleEmbed] });
            });

            // client.channels.fetch('838708707332194315').then(channel => {
            //     channel.send({ embeds: [exampleEmbed] });
            // });

        }
    );
});


// Login to Discord with your client's token
client.login(process.env.TOKEN);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);    
    
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}   
});

client.on('messageCreate', async (msg) => {
    if(!msg.author.bot) {

        console.log(msg.content)
    
        let message = msg.content.replace(/ /g,'');
        
        if(message[message.length - 1] === '?') message = message.slice(0, -1)

        if(message.slice(-4).localeCompare('quoi', 'fr', { sensitivity: 'base' }) === 0) {
            const pourcentage = Math.floor(Math.random() * 101)

            const user = await Users.findOne({ where: { id: msg.author.id}})

            if(user) {
                Users.increment('count', { where: { id: msg.author.id } })
            } else {
                try {
                    const user = await Users.create({
                        id: msg.author.id,
                        username: msg.author.username,
                    })
                } catch(error) {        
                    console.log(error);
                }
            }

            if(pourcentage <= 5) {
                msg.reply('drilatère')
            } else {
                msg.reply('feur !')
            }
        }
    }
    
})