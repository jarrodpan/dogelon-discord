/* eslint-disable no-mixed-spaces-and-tabs */
'use strict';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { Command, MatchOn } from './commands';
//import { MatchOn } from './types/Command';
import { Message, TextChannel } from 'discord.js';
import axios from 'axios';
import { Dogelon } from './dogelon/';

// following need to be 'require' to work
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, Intents } = require('discord.js');

// set up discord client api
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
	partials: ['MESSAGE', 'CHANNEL'],
});

Dogelon.Queue.setClient(client);

const oLog = console.log;

const newLog = (...msg: unknown[]) => {
	//let e = new Error();
	try {
		throw new Error();
	} catch (e) {
		const stackline = e.stack
			.split('\n')[2]
			.trim()
			.replace('(', '')
			.replace(')', '')
			.slice(3);

		const filepath = stackline.slice(stackline.lastIndexOf(' ') + 1);
		const file = filepath.slice(
			filepath.indexOf('bin') + 4,
			filepath.indexOf('.js')
		);
		const func =
			stackline.lastIndexOf(' ') != -1
				? ' ' + stackline.slice(0, stackline.lastIndexOf(' '))
				: '';

		const caller = file + func;

		oLog.apply(
			this,
			// eslint-disable-next-line @typescript-eslint/no-array-constructor
			new Array().concat('\x1b[48;5;19m[' + caller + ']\x1b[0m', msg)
		);
	}
};

console.log = newLog;
console.debug = newLog;

// override console.debug for production
if (process.env.NODE_ENV === 'production') {
	console.debug = (..._x: unknown[]) => {
		return;
	};
}

// initialise
client.once('ready', () => {
	setInterval(Dogelon.Queue.processNext, 550); // 500ms is the rate limit of discord's bot API
	console.debug(Command.matchOn);
	console.log('Ready!');
	newDeploy(client.channels.cache);
});

// login to discord
client.login(process.env.DISCORD_TOKEN);

client.on('messageCreate', (message: Message): void => {
	console.debug(message);

	const server =
		client.channels.cache.get(message.channelId)?.guild?.name ||
		'$Direct Messages';
	const channel =
		client.channels.cache.get(message.channelId)?.name ||
		client.channels.resolve(message.channelId).recipient.username;

	console.log(
		'<' + server + '#' + channel + '@' + message.author.username + '>',
		message.content
	);

	// ignore self messages
	if (message.author.bot) return;
	if (message.webhookId) return;

	// get match groups
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let msgMatchCommands: any[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let tokenMatchCommands: any[] = [];

	try {
		// TODO: refactor this into Commands module
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const matchOnMessage: any = Command.matchOn
			.get(MatchOn.MESSAGE)
			.exec(message.content).groups;
		//console.log("match found:", Object.entries(matchOnMessage));
		// filter out unmatched expressions
		msgMatchCommands = Object.entries(matchOnMessage).filter(
			([_s, matchString]) => {
				return matchString != undefined;
			}
		);
		console.log(
			message.content,
			'message matching commands:',
			msgMatchCommands
		);
		Command.matchOn.get(MatchOn.MESSAGE).lastIndex = 0;
	} catch (e) {
		//console.error(message.content, "=>\tno message matching groups found");
		msgMatchCommands = [];
	}

	// replace newlines with spaces and tokenize
	const tokens = message.content.replace(/(\r\n|\n|\r)/gm, ' ').split(' ');
	tokens.forEach((token) => {
		try {
			// TODO: refactor this into Commands module
			const matchOnToken = Command.matchOn
				.get(MatchOn.TOKEN)
				.exec(token).groups;
			//console.log("match found:", Object.entries(matchOnToken));
			// filter out unmatched expressions
			tokenMatchCommands = Object.entries(matchOnToken).filter(
				([_s, matchString]) => {
					return matchString != undefined;
				}
			);
			console.log(
				token,
				'token matching commands:',
				tokenMatchCommands.toString()
			);
			Command.matchOn.get(MatchOn.TOKEN).lastIndex = 0;
		} catch (e) {
			//console.error(token, "=>\tno token matching groups found");
			tokenMatchCommands = [];
		}

		tokenMatchCommands.forEach(([commandName, _]) => {
			const cmd = Command.commandMap.get(commandName);
			if (cmd) Dogelon.Queue.push(message, token, cmd.execute);
			else throw new Error('Command does not exist: ' + commandName);
		});
	});

	msgMatchCommands.forEach(([commandName, _]) => {
		const cmd = Command.commandMap.get(commandName);
		if (cmd) Dogelon.Queue.push(message, message.content, cmd.execute);
		else throw new Error('Command does not exist: ' + commandName);
	});
});

const newDeploy = async (channels) => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires

	// check for first run variable in Commands class db assuming Commands has been loaded
	// this is terrible code and should be refactored to elevate db to main so we dont get surprises
	const dbKey = 'firstRun';
	let firstRun = true;
	const runDetails = await Command.db?.get(dbKey);
	console.log(runDetails);
	const v = runDetails.version;

	if (runDetails) {
		const oldVer = runDetails.prevVersion.split('.');
		const newVer: string[] = runDetails.version.split('.');

		for (let i = 0; i < 3; i++) {
			if (
				Number.parseInt(oldVer[i].split('-')[0]) >=
				Number.parseInt(newVer[i].split('-')[0])
			) {
				// whatever, this works, deal with it 😎
				console.debug(oldVer[i], newVer[i], oldVer[i] >= newVer[i]);
				firstRun = false;
			} else {
				firstRun = true;
				if (newVer[newVer.length - 1].includes('-')) {
					console.log('dev version detected');
					break;
				} else console.log('new version detected');
				channels.forEach((_subscriberId, v) => {
					const ch = channels.get(v);
					const cmd = Command.commandMap.get('ChangesCommand');
					//console.log(ch);
					if (ch.viewable && ch instanceof TextChannel && cmd) {
						Dogelon.Queue.push(ch, '', cmd.execute);
					}
				});
				break;
			}
		}

		//if (runDetails.version >= v) firstRun = false; // this will stop reset spam
	}
	//await Command.db?.set(dbKey, newRunDetails, Database.NEVER_EXPIRE);

	let name = 'Dogelon-Dev';
	let env = 'localhost';
	const re = firstRun ? '' : 're';
	// determine environment, the below is only defined locally
	if (process.env.NODE_ENV === 'production')
		(name = 'Dogelon') && (env = 'Heroku');
	// notify discord webhook about deployment
	await axios.post(
		process.env.DISCORD_WEBHOOK as string,
		{
			content: `${name} ${v} ${re}launched on ${env}.`,
		},
		{
			headers: {
				'Content-type': 'application/json',
			},
		}
	);

	// clean db on new deploy
	await Command.db?.clean();
};
