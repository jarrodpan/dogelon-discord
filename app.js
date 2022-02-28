"use strict";

require('dotenv').config();
//console.log(process.env); // to test dotenv
const { Client, Intents, MessageEmbed } = require('discord.js');
const axios = require('axios');



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

	// gettem with the ligma
	let ligma = message.content.search(/what('{0,1}| i)s ligma\?*/gm);
	if (ligma > -1) queue.push([message, "", (_) => { return "ligma balls" }]);

	// tokenize
	let tokens = message.content.split(" ");
	tokens.forEach(token => {

		if (token.charAt(0) == "$") queue.push([message, token, async (token) => {
			// code goes here
			let ticker = token.slice(1);

			let response = await axios.get("https://query1.finance.yahoo.com/v10/finance/quoteSummary/" + ticker + "?region=AU&lang=en-AU&corsDomain=au.finance.yahoo.com&formatted=true&modules=price%2CsummaryDetail%2CpageViews%2CfinancialsTemplate");
			const embed = new MessageEmbed();

			//console.log(response.data);
			let data = {};
			try {
				data = response.data.quoteSummary;
			} catch (e) {
				data = response.data.finance;
			}
			console.log(data.error);
			if (!data.error) {
				let result = data.result[0].price;
				let title = result.longName + " (" + result.symbol + ")";
				let price = result.currencySymbol + result.regularMarketPreviousClose.fmt;
				let priceChange = result.currencySymbol + result.regularMarketChange.fmt;
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
		}]);

		if (token.slice(0, 2) == "r/" || token.slice(0, 3) == "/r/") queue.push([message, token, (token) => {
			return "https://www.reddit.com" + (token.slice(0, 1) == "/" ? "" : "/") + token;
		}]);

	});

});

const parseLoop = setInterval(async () => {
	// skip if empty queue
	if (queue.length == 0) return;

	// get next item from queue
	let [message, token, callback] = queue.shift();

	let output = await callback(token);
	// send message to channel
	return message.reply(output);

}, 10);