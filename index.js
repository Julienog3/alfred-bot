// Require the necessary discord.js classes
const { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } = require('twitter-api-v2');
const { Client, Intents, MessageEmbed, MessageAttachment  } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Sequelize = require('sequelize');
const Canvas = require('canvas');

require('dotenv').config()

const { HttpsProxyAgent } = require('https-proxy-agent');

// Create proxy for Twitter
const proxy = process.env.HTTP_PROXY || 'https://1.1.1.1:3000';
const httpsAgent = new HttpsProxyAgent(proxy);

// Create database
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

// Users Sequelize Model
const Users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        primaryKey: true
    },    
    username: {
        type: Sequelize.STRING,
    },
    count: {
        type: Sequelize.INTEGER,
    }
})

// Create client Discord
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES],
});

// Create client Twitter
const twitterClient = new TwitterApi(process.env.BEARER_TOKEN, { httpsAgent });

const commands = [
	new SlashCommandBuilder().setName('rank').setDescription('Renvoi le classement des quoi'),
    new SlashCommandBuilder().setName('profile').setDescription('Montre le deep profil discord'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);


rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

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

    Users.sync();

    //const user = await twitterClient.v2.userByUsername('lowkeypack')

    await twitterClient.v2.updateStreamRules({
        add: [{ value: 'from:lowkeypack' }],
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

	const { commandName } = interaction;
	
    if (commandName === 'rank') {

        let userList = await Users.findAll({ attributes: ['username', 'count'], limit: 3, order: [['count', 'DESC']] } );

        const medals = ['🥇', '🥈', '🥉']
        const fields = []

        userList.map((user, i) => {
            let field = {
                "name": `${medals[i]} ${user.username}`,
                "value": `${user.count} quoi`
            }

            fields.push(field)
        })       

        const rankEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Leaderboard')
            .setAuthor({ name: 'AlfredBot', iconURL: 'https://i1.sndcdn.com/avatars-MmuJFpzZtMItCYzd-3DJJqQ-t500x500.jpg' })
            .setFields(fields)
            .setTimestamp()
            .setFooter({ text: 'AlfredBot', iconURL: 'https://i1.sndcdn.com/avatars-MmuJFpzZtMItCYzd-3DJJqQ-t500x500.jpg' });

		await interaction.reply({ embeds: [rankEmbed] });
	} 

    const applyText = (canvas, text) => {
        const context = canvas.getContext('2d');
    
        // Declare a base size of the font
        let fontSize = 70;
    
        do {
            // Assign the font to the context and decrement it so it can be measured again
            context.font = `${fontSize -= 10}px sans-serif`;
            // Compare pixel width of the text to the canvas minus the approximate avatar size
        } while (context.measureText(text).width > canvas.width - 300);
    
        // Return the result to use in the actual canvas
        return context.font;
    };

    if (commandName === 'profile') {
        let user = await Users.findOne({ where: { id: interaction.member.id } })

        const canvas = Canvas.createCanvas(700, 250);
		const context = canvas.getContext('2d');

        const background = await Canvas.loadImage('./wallpaper.jpg');

        
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.fill();

        const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({ format: 'jpg' }));

        // Slightly smaller text placed above the member's display name
        context.font = '28px sans-serif';
        context.fillStyle = '#ffffff';
        context.fillText(`${user.count} quoi`, canvas.width / 2.5, canvas.height / 1.4);

        context.font = applyText(canvas, interaction.member.displayName);
        context.fillStyle = '#ffffff';
        context.fillText(interaction.member.displayName , canvas.width / 2.5, canvas.height / 1.8);

        context.beginPath();
        context.arc(125, 125, 100, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        context.drawImage(avatar, 25, 25, 200, 200);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');

        interaction.reply({ files: [attachment] });
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