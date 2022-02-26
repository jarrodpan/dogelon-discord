
require('dotenv').config();
//console.log(process.env); // to test dotenv
const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

// initialise
client.once('ready', () => {
	console.log('Ready!');

	//	console.log(client.channels.cache);
});


// login to discord
client.login(process.env.DISCORD_TOKEN);


client.on('messageCreate', (message) => {
	let server = client.channels.cache.get(message.channelId).guild.name;
	let channel = client.channels.cache.get(message.channelId).name;

	console.log("<" + server + "#" + channel + "@" + message.author.username + ">", message.content);
});