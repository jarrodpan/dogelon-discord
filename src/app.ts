/* eslint-disable no-mixed-spaces-and-tabs */
'use strict';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import Action from './types/Action';
import { Command, MatchOn } from './commands';
//import { MatchOn } from './types/Command';
import { DMChannel, Message, TextChannel } from 'discord.js';
import axios from 'axios';

// following need to be 'require' to work
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, Intents } = require('discord.js');

// set up discord client api
export const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
	partials: ['MESSAGE', 'CHANNEL'],
});

// TODO: make this better
export const queue: Action[] = [];

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
			.split(' ') as string[];
		const caller =
			stackline.length == 2
				? stackline[1].slice(stackline[1].indexOf('bin') + 4)
				: stackline[2].slice(stackline[2].indexOf('bin') + 4) +
				  ' ' +
				  stackline[1];
		// eslint-disable-next-line @typescript-eslint/no-array-constructor
		oLog.apply(this, new Array().concat('[' + caller + ']', msg));
	}
};

console.log = newLog;
console.debug = newLog;

// override console.debug for production
if (process.env.NODE_ENV === 'production') {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	console.debug = (..._msg: unknown[]) => {
		return;
	};
}

// initialise
// TODO: refactor this
client.once('ready', () => {
	//console.log();
	setInterval(async () => {
		// skip if empty queue
		if (queue.length == 0) return;
		//console.log(client.channels.cache);
		// get next item from queue - definitely defined as we check above
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const action: Action = queue.shift()!;
		//console.log(message);
		//let output;
		Promise.resolve()
			.then(async () => {
				const output = await action.callback(
					action.message,
					action.token
				);
				// send message to channel
				return output;
			})
			.then(async (output) => {
				//console.log(action.message);
				if (output == null) return; //throw new Error("output is undefined");

				// global footer icon
				if (output.embeds) {
					output.embeds[0].footer.iconURL =
						'https://cdn.discordapp.com/app-icons/945669693576994877/c11dde4d4f016ffcc820418864efd9f4.png?size=64';
				}

				//console.log((action.message as TextChannel).isText());
				console.debug('sending to discord...', output);

				//try {
				if (action.message instanceof Message)
					await action.message.reply(output);
				if (action.message instanceof TextChannel)
					await action.message.send(output);
				//else await (action.message as TextChannel).send(output);
				//} catch (e) { console.error(e); }

				return;
			})
			.catch((e) => {
				console.error(e);
			});

		return;
	}, 550); // 500ms is the rate limit of discord's bot API

	console.debug(Command.matchOn);
	//console.debug(Commands.db);
	console.log('Ready!');
	//console.debug(Commands);
	//console.debug(Commands.matchOn);

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
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tokenMatchCommands = Object.entries(matchOnToken).filter(
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		tokenMatchCommands.forEach(([commandName, _]) => {
			queue.push(
				new Action(
					message,
					token,
					Command.commandMap.get(commandName).execute
				)
			);
		});
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	msgMatchCommands.forEach(([commandName, _]) => {
		queue.push(
			new Action(
				message,
				message.content,
				Command.commandMap.get(commandName).execute
			)
		);
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
		const oldVer = runDetails.prevVersion.split('.').map(Number);
		const newVer = runDetails.version.split('.').map(Number);

		for (let i = 0; i < 3; i++) {
			if (oldVer[i] >= newVer[i]) {
				// whatever, this works, deal with it 😎
				console.debug(oldVer[i], newVer[i], oldVer[i] >= newVer[i]);
				firstRun = false;
			} else {
				firstRun = true;
				channels.forEach((_subscriberId, v) => {
					const ch = channels.get(v);
					//console.log(ch);
					if (ch.viewable && ch instanceof TextChannel)
						queue.push(
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							new Action(
								ch,
								'',
								Command.commandMap.get('ChangesCommand').execute
							)
						);
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
