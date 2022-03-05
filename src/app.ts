//"use strict";
import Action from "./types/Action";
import Commands from './commands';
import { MatchOn } from "./types/Command";

require('dotenv').config();
//console.log(process.env); // to test dotenv
const { Client, Intents, MessageEmbed } = require('discord.js');
const axios = require('axios');


// TODO: might want to refactor this
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

// TODO: fix this crap
const queue: Action[] = [];


// TODO: this is where the magic happens with the parser

//console.debug(Commands.listCommandNames());



// initialise
// TODO: refactor this
client.once('ready', () => {
	console.log('Ready!');
	console.debug(Commands);
	console.debug(Commands.matchOn);
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
		console.log("match found:", Object.entries(matchOnMessage));
		// filter out unmatched expressions
		msgMatchCommands = Object.entries(matchOnMessage).filter(([_, matchString]) => { return matchString != undefined; });
		console.log(message.content, "message matching commands:", msgMatchCommands);
	}
	catch (e) {
		console.error(message.content, "no message matching groups found");
		msgMatchCommands = [];
	}

	// tokenize
	let tokens = message.content.split(" ");
	tokens.forEach(token => {

		if (token.charAt(0) == "$") queue.push(new Action(message, token, async (token: string) => {
			// code goes here
			let ticker = token.slice(1);

			let response = await axios.get("https://query1.finance.yahoo.com/v10/finance/quoteSummary/" + ticker + "?region=AU&lang=en-AU&corsDomain=au.finance.yahoo.com&formatted=true&modules=price%2CsummaryDetail%2CpageViews%2CfinancialsTemplate");
			const embed = new MessageEmbed();

			//console.log(response.data);
			let data: any = {};
			let error = false;
			try {
				data = response.data.quoteSummary;
			} catch (e) {
				data = response.data.finance;
				error = true;
			}
			//console.log(data.error);
			if (!error) {
				let result = data.result[0].price;
				let title = result.longName + " (" + result.symbol + ")";
				let price = result.currencySymbol + result.regularMarketPreviousClose.fmt;
				let priceChange = result.currencySymbol + result.regularMarketChange.fmt; // BUG: fix this line if the response is messed up
				let pcChange = result.regularMarketChangePercent.fmt;
				let footer = result.quoteSourceName + " " + result.currency;

				embed
					.setColor("#0099ff")
					.setTitle("🚀 " + title)
					.addField("💸 Price", price, true)
					.addField("🪙 $ Change", priceChange, true)
					.addField("% Change", pcChange, true)
					.setTimestamp()
					.setFooter({ text: footer })
					;
			} else {
				// error case
				embed
					.setColor("RED")
					.setTitle(data.error.code)
					.setDescription(data.error.description)
					;
			}

			//console.log(embed);
			return { embeds: [embed] };
		}));


		try {
			// TODO: define groups type
			// TODO: refactor this into Commands module
			const matchOnToken: any = (Commands.matchOn.get(MatchOn.TOKEN).exec(token)).groups;
			console.log("match found:", Object.entries(matchOnToken));
			// filter out unmatched expressions
			tokenMatchCommands = Object.entries(matchOnToken).filter(([_, matchString]) => { return matchString != undefined; })
			console.log(token, "token matching commands:", tokenMatchCommands.toString());
			Commands.matchOn.get(MatchOn.TOKEN).lastIndex = 0;
		}
		catch (e) {
			console.error(token, "no token matching groups found");
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
	let output: any = await action.callback(action.token);
	// send message to channel
	return action.message.reply(output);

}, 500);