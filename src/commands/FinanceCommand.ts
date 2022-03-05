import axios from 'axios';
import { MessageEmbed, UserContextMenuInteraction } from 'discord.js';
import { Command, MatchOn } from '../types/Command'

/**
 * a command to turn r/ and /r/ references and reply with the link (as discord doesnt do it automatically for some reason)
 * 
 * Example of token matching.
 */
export default class FinanceCommand implements Command {
	public expression = `(?:\\$\\S*)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	public execute = (input: any) => {
		let ticker = input.slice(1);


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
				let result = data.result[0].price;
				let title = result.longName + " (" + result.symbol + ")";
				let price = result.currencySymbol + result.regularMarketPreviousClose.fmt;
				let priceChange = result.currencySymbol + result.regularMarketChange.fmt; // BUG: fix this line if the response is messed up
				let pcChange = result.regularMarketChangePercent.fmt;
				let footer = result.exchangeName + "  •  " + result.quoteSourceName + " " + result.currency;

				embed = new MessageEmbed()
					.setColor("#0099ff")
					.setTitle("🚀  " + title)
					.addField("💸  Price", price, true)
					.addField("🪙  $ Change", priceChange, true)
					.addField("💹  % Change", pcChange, true)
					.setTimestamp()
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