import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../types/Command'
import Database from '../types/Database';

/**
 * a command to turn r/ and /r/ references and reply with the link (as discord doesnt do it automatically for some reason)
 * 
 * Example of token matching.
 */
export default class FinanceCommand extends Command {
	private db: Database | undefined;
	public constructor(db?: Database | undefined) { super(); if (db) this.db = db; }
	
	public expression = `(?:\\$\\S*)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	public execute = (message: Message | TextChannel, input: any) => {
		const ticker = input.slice(1);


		let embed;

		//console.log(response.data);

		//let embed = null;
		return Promise.resolve().then(async () => {
			let response;
			let data: any = {};
			let error = false;
			try {
				response = await axios.get("https://query1.finance.yahoo.com/v10/finance/quoteSummary/" + ticker + "?region=AU&lang=en-AU&corsDomain=au.finance.yahoo.com&formatted=true&modules=price%2CsummaryDetail%2CpageViews%2CfinancialsTemplate");
				//console.log(response);
				data = response.data.quoteSummary;
			} catch (e) {
				//if (typeof response.data != undefined) data = {};
				//if (typeof response.data.quoteSummary != undefined) data = response.data.quoteSummary;
				//else if (typeof response.data.finance != undefined) data = response.data.finance;

				//data = (response.data.quoteSummary ?? response.data.finance ?? {});
				error = true;
			}
			return [response, data, error];
		}).then(([response, data, error]) => {
			//console.log(data.error);
			if (!error) {
				console.log("setting up response");
				const result = data.result[0].price;
				const title = result.longName + " (" + result.symbol + ")";
				const price = result.currencySymbol + result.regularMarketPreviousClose.fmt;
				const priceChange = result.currencySymbol + result.regularMarketChange.fmt; // BUG: fix this line if the response is messed up
				const pcChange = result.regularMarketChangePercent.fmt;
				const footer = result.exchangeName + "  •  " + result.quoteSourceName + " " + result.currency;

				embed = new MessageEmbed()
					.setColor("#0099ff")
					.setTitle("🚀  " + title)
					.addField("💸  Price", price, true)
					.addField("🪙  $ Change (D)", priceChange, true)
					.addField("💹  % Change (D)", pcChange, true)
					//.setTimestamp()
					.setFooter({ text: footer })
					;
			} else {
				//embed = null;
				// error case
				/*embed
					.setColor("RED")
					.setTitle(data.error.code)
					.setDescription(data.error.description)
					;*/
				return null;
			}
			//console.log("finance return", embed);
			if (embed == null) throw new Error("FinanceCommands: embed is undefined or null");
			if (typeof embed != null || typeof embed !== undefined) {
				return { embeds: [embed] };
			}

		}).catch((_) => {
			embed = null;
			return null;
		});



	}
}