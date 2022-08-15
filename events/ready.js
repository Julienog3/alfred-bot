const { ETwitterStreamEvent, TwitterApi } = require('twitter-api-v2');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { MessageEmbed } = require('discord.js');
const sequelize = require('../sequelize');
const moment = require('moment');

require('dotenv').config();

const proxy = process.env.HTTP_PROXY || 'https://1.1.1.1:3000';
const httpsAgent = new HttpsProxyAgent(proxy);

const twitterClient = new TwitterApi(process.env.BEARER_TOKEN, { httpsAgent });

const Users = sequelize.model('user');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`🏁 Ready at ${new Date(client.readyTimestamp).toLocaleString()}`);

		client.user.setPresence({
			activities: [{
				name: 'WINNTERZUKO DANS LA TCHOP',
				type: 'LISTENING',
			}],
			status: 'online',
		});

		Users.update({ money: 0, attemps: 3 }, { where: { money: null, attemps: null } });

		const resetAttemps = async () => {
			await Users.update({ attemps: 3 }, { where: {} }).then(() => '🃏 Cards has been reset');
		};

		moment('24:00:00', 'hh:mm:ss').diff(moment(), 'seconds');
		setTimeout(resetAttemps, moment('24:00:00', 'hh:mm:ss').diff(moment(), 'seconds'));

		// const user = await twitterClient.v2.userByUsername('lowkeypack')

		await twitterClient.v2.updateStreamRules({
			add: [
				{ value: 'from:lowkeypack' },
				{ value: '-is:retweet' },
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

			},
		);
	},
};