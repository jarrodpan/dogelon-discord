'use strict';
import Action from './types/Action';
import Commands from './commands';
import { MatchOn } from './types/Command';
import { Channel, Message, MessageEmbed, TextChannel } from 'discord.js';
import axios from 'axios';
import { DatabaseError } from 'pg';
import Database from './types/Database';

// following need to be 'require' to work
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, Intents } = require('discord.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// set up discord client api
export const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
});

// TODO: make this better
export const queue: Action[] = [];

// override console.debug for production
if (process.env.NODE_ENV === 'production') {
	console.debug = (...msg: any[]) => {
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
	}, 750); // 500ms is the rate limit of discord's bot API

	console.debug(Commands.matchOn);
	console.log('Ready!');
	//console.debug(Commands);
	//console.debug(Commands.matchOn);

	newDeploy(client.channels.cache);
});

// login to discord
client.login(process.env.DISCORD_TOKEN);

client.on('messageCreate', (message: any): void => {
	const server = client.channels.cache.get(message.channelId).guild.name;
	const channel = client.channels.cache.get(message.channelId).name;

	console.log(
		'<' + server + '#' + channel + '@' + message.author.username + '>',
		message.content
	);

	// ignore self messages
	if (message.author.bot) return;

	// get match groups
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let msgMatchCommands: any[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let tokenMatchCommands: any[] = [];

	try {
		// TODO: refactor this into Commands module
		const matchOnMessage: any = Commands.matchOn
			.get(MatchOn.MESSAGE)
			.exec(message.content).groups;
		//console.log("match found:", Object.entries(matchOnMessage));
		// filter out unmatched expressions
		msgMatchCommands = Object.entries(matchOnMessage).filter(
			([_, matchString]) => {
				return matchString != undefined;
			}
		);
		console.log(
			message.content,
			'message matching commands:',
			msgMatchCommands
		);
		Commands.matchOn.get(MatchOn.MESSAGE).lastIndex = 0;
	} catch (e) {
		//console.error(message.content, "=>\tno message matching groups found");
		msgMatchCommands = [];
	}

	// replace newlines with spaces and tokenize
	const tokens = message.content.replace(/(\r\n|\n|\r)/gm, ' ').split(' ');
	tokens.forEach((token) => {
		try {
			// TODO: refactor this into Commands module
			const matchOnToken = Commands.matchOn
				.get(MatchOn.TOKEN)
				.exec(token).groups;
			//console.log("match found:", Object.entries(matchOnToken));
			// filter out unmatched expressions
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tokenMatchCommands = Object.entries(matchOnToken).filter(
				([_, matchString]) => {
					return matchString != undefined;
				}
			);
			console.log(
				token,
				'token matching commands:',
				tokenMatchCommands.toString()
			);
			Commands.matchOn.get(MatchOn.TOKEN).lastIndex = 0;
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
					Commands.commandMap.get(commandName).execute
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
				Commands.commandMap.get(commandName).execute
			)
		);
	});
});

const newDeploy = async (channels) => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const readme: string = require('fs').readFileSync('./README.md').toString();
	const latestChange = readme
		.match(/# Changelog[\S\s]*?(?:###[\S\s]*?){1,3}## /)
		?.toString()
		.replace(/\r/gm, '')
		.split(/\n/gm); // chaotic regex to extract the latest change in the changelog

	//console.log(latestChange);

	let title;
	const changed = {
		Added: new Array<string>(),
		Changed: new Array<string>(),
		Removed: new Array<string>(),
	} as object;
	let state: 'Added' | 'Changed' | 'Removed';

	let v;

	// extract all the junk
	latestChange?.forEach((line) => {
		if (line == '# Changelog' || line.length == 0) return;
		if (line.startsWith('## ') && line.length > 3)
			(title = line.slice(3).replace('[', 'v').replace(']', '')) &&
				(v =
					'v' + line.slice(line.indexOf('[') + 1, line.indexOf(']')));
		if (line.startsWith('### Added')) state = 'Added';
		if (line.startsWith('### Changed')) state = 'Changed';
		if (line.startsWith('### Removed')) state = 'Removed';

		if (line.substring(0, 5).includes('-')) changed[state].push(line);
	});

	// check for first run variable in Commands class db assuming Commands has been loaded
	// this is terrible code and should be refactored to elevate db to main so we dont get surprises
	const dbKey = 'firstRun';
	let firstRun = true;
	const runDetails = await Commands.db?.get(dbKey);
	console.log(runDetails);
	const newRunDetails = {
		deployTime: Database.unixTime(),
		version: v,
	};

	if (runDetails == false) {
		// this is the first run and no object so update db
		await Commands.db?.set(dbKey, newRunDetails, Database.NEVER_EXPIRE);
	} else {
		// TODO: version check hack... that doesnt work after vx.y.9. fix me in another update
		if (runDetails.version >= v) firstRun = false; // this will stop reset spam
		await Commands.db?.set(dbKey, newRunDetails, Database.NEVER_EXPIRE); // update database
	}

	if (firstRun) {
		const a = 'author';
		const embed = new MessageEmbed()
			.setColor('#9B59B6')
			.setTitle(`🚀  Dogelon Update - ` + title)
			.addField(
				'Notice:',
				'Database is not persistent so you will have to rerun `!subscribe` for all feeds. This will be fixed in a future update.'
			)
			.setThumbnail('https://i.imgur.com/1LIQGWa.png')
			//.setTimestamp()
			.setFooter({ text: `Dogelon ${v}  •  ${a}` });
		//console.log(changed);

		for (const [k, v] of Object.entries(changed)) {
			if (v.length > 0) embed.addField(k, v.join('\n'));
		}

		// queue notify for all channels
		channels.forEach((subscriberId, v) => {
			const ch = channels.get(v);
			//console.log(ch);
			if (ch.viewable && ch instanceof TextChannel)
				queue.push(
					new Action(ch, '', (msg, input) => {
						return { embeds: [embed] };
					})
				);
		});
	}

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
	await Commands.db?.clean();
};
