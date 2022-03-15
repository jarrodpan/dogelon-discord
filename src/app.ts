"use strict";
import Action from "./types/Action";
import Commands from './commands';
import { MatchOn } from "./types/Command";

// following need to be 'require' to work
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, Intents } = require('discord.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// set up discord client api
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

// TODO: make this better
const queue: Action[] = [];

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
	const server = client.channels.cache.get(message.channelId).guild.name;
	const channel = client.channels.cache.get(message.channelId).name;

	console.log("<" + server + "#" + channel + "@" + message.author.username + ">", message.content);

	// ignore self messages
	if (message.author.bot) return;

	// get match groups
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let msgMatchCommands: any[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let tokenMatchCommands: any[] = [];

	try {
		// TODO: refactor this into Commands module
		const matchOnMessage: any = (Commands.matchOn.get(MatchOn.MESSAGE).exec(message.content)).groups;
		//console.log("match found:", Object.entries(matchOnMessage));
		// filter out unmatched expressions
		msgMatchCommands = Object.entries(matchOnMessage).filter(([_, matchString]) => { return matchString != undefined; });
		console.log(message.content, "message matching commands:", msgMatchCommands);
		Commands.matchOn.get(MatchOn.MESSAGE).lastIndex = 0;
	}
	catch (e) {
		//console.error(message.content, "=>\tno message matching groups found");
		msgMatchCommands = [];
	}

	// replace newlines with spaces and tokenize
	const tokens = message.content.replace(/(\r\n|\n|\r)/gm, " ").split(" ");
	tokens.forEach(token => {
		try {
			// TODO: refactor this into Commands module
			const matchOnToken = (Commands.matchOn.get(MatchOn.TOKEN).exec(token)).groups;
			//console.log("match found:", Object.entries(matchOnToken));
			// filter out unmatched expressions
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tokenMatchCommands = Object.entries(matchOnToken).filter(([_, matchString]) => { return matchString != undefined; })
			console.log(token, "token matching commands:", tokenMatchCommands.toString());
			Commands.matchOn.get(MatchOn.TOKEN).lastIndex = 0;
		}
		catch (e) {
			//console.error(token, "=>\tno token matching groups found");
			tokenMatchCommands = [];
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		tokenMatchCommands.forEach(([commandName, _]) => {
			queue.push(new Action(message, token, Commands.commandMap.get(commandName).execute));
		});

	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	msgMatchCommands.forEach(([commandName, _]) => {
		queue.push(new Action(message, message.content, Commands.commandMap.get(commandName).execute));
	});



});

setInterval(async () => {
	// skip if empty queue
	if (queue.length == 0) return;

	// get next item from queue - definitely defined as we check above
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const action: Action = queue.shift()!;
	//console.log(message);
	//let output;
	Promise.resolve().then(async () => {
		const output = await action.callback(action.token);
		// send message to channel
		return output;

	}).then((output) => {
		console.log("sending to discord...", output);
		if (output == null) throw new Error("output is undefined");
		
		console.log(action.message);
		
		action.message.reply(output);
		return;
	}).catch((e) => {
		console.error(e);
	});


	return;

}, 500); // 500ms is the rate limit of discord's bot API