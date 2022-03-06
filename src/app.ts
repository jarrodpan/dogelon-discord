//"use strict";
import Action from "./types/Action";
import Commands from './commands';
import { MatchOn } from "./types/Command";

require('dotenv').config();
//console.log(process.env); // to test dotenv
const { Client, Intents, MessageEmbed } = require('discord.js');
const axios = require('axios');


// TODO: might want to refactor this
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], partials: ['CHANNEL'] });

// TODO: fix this crap
const queue: Action[] = [];


// TODO: this is where the magic happens with the parser

//console.debug(Commands.listCommandNames());



// initialise
// TODO: refactor this
client.once('ready', () => {
	console.debug(Commands.matchOn);
	console.log('Ready!');
	//console.debug(Commands);
	//console.debug(Commands.matchOn);
});

// login to discord
client.login(process.env.DISCORD_TOKEN);

client.on('messageCreate', (message: any): void => {
	let server = client.channels.cache.get(message.channelId).guild.name;
	let channel = client.channels.cache.get(message.channelId).name;

	console.log("<" + server + "#" + channel + "@" + message.author.username + ">", message.content);

	// ignore self messages
	if (message.author.bot) return;

	// get match groups
	let msgMatchCommands: any[];
	let tokenMatchCommands: any[] = [];

	try {
		// TODO: define groups type
		// TODO: refactor this into Commands module
		const matchOnMessage: any = (Commands.matchOn.get(MatchOn.MESSAGE).exec(message.content)).groups;
		//console.log("match found:", Object.entries(matchOnMessage));
		// filter out unmatched expressions
		msgMatchCommands = Object.entries(matchOnMessage).filter(([_, matchString]) => { return matchString != undefined; });
		console.log(message.content, "message matching commands:", msgMatchCommands);
	}
	catch (e) {
		console.error(message.content, "=>\tno message matching groups found");
		msgMatchCommands = [];
	}

	// tokenize
	let tokens = message.content.split(" ");
	tokens.forEach(token => {


		try {
			// TODO: define groups type
			// TODO: refactor this into Commands module
			const matchOnToken: any = (Commands.matchOn.get(MatchOn.TOKEN).exec(token)).groups;
			//console.log("match found:", Object.entries(matchOnToken));
			// filter out unmatched expressions
			tokenMatchCommands = Object.entries(matchOnToken).filter(([_, matchString]) => { return matchString != undefined; })
			console.log(token, "token matching commands:", tokenMatchCommands.toString());
			Commands.matchOn.get(MatchOn.TOKEN).lastIndex = 0;
		}
		catch (e) {
			console.error(token, "=>\tno token matching groups found");
			tokenMatchCommands = [];
		}


		tokenMatchCommands.forEach(([commandName, _]) => {
			queue.push(new Action(message, token, Commands.commandMap.get(commandName).execute));
		});

	});


	msgMatchCommands.forEach(([commandName, _]) => {
		queue.push(new Action(message, message.content, Commands.commandMap.get(commandName).execute));
	});



});

const parseLoop = setInterval(async () => {
	// skip if empty queue
	if (queue.length == 0) return;

	// get next item from queue
	const action: Action = queue.shift()!;
	//console.log(message);
	//let output;
	Promise.resolve().then(async () => {
		let output = await action.callback(action.token);
		// send message to channel
		return output;

	}).then((output) => {
		console.log("sending to discord...", output);
		if (output == null) throw new Error("output is undefined");

		action.message.reply(output);
		return;
	}).catch((_) => {
		//
	});


	return;

}, 500);