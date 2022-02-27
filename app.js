'use strict'

require('dotenv').config();
//console.log(process.env); // to test dotenv
const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

const queue = [];

// initialise
client.once('ready', () => {
	console.log('Ready!');

	//	console.log(client.channels.cache);
});

client.on('interactionCreate', interaction => {
	console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
});

// login to discord
client.login(process.env.DISCORD_TOKEN);


client.on('messageCreate', (message) => {
	let server = client.channels.cache.get(message.channelId).guild.name;
	let channel = client.channels.cache.get(message.channelId).name;

	console.log("<" + server + "#" + channel + "@" + message.author.username + ">", message.content);

	// ignore self messages
	if (message.author.bot) return;

	// tokenize
	let tokens = message.content.split(" ");
	tokens.forEach(token => {
		if (token.charAt(0) == "$") {
			queue.push([message, token]);
		}

		if (token.slice(0, 2) == "r/" || token.slice(0, 3) == "/r/") queue.push([message, token]);

	});

});

const parseLoop = setInterval(() => {
	// skip if empty queue
	if (queue.length == 0) return;

	// get next item from queue
	let [message, token] = queue.shift();

	// send message to channel
	return message.channel.send(token);

}, 10);