import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import Action from '../types/Action';
import { Command, MatchOn } from '../types/Command'

/**
 * a command to turn r/ and /r/ references and reply with the link (as discord doesnt do it automatically for some reason)
 * 
 * Example of token matching.
 */
export default class FinanceCommand implements Command {
	public expression = `(?:\\$\\S*)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	public execute = async (input: any) => {
		let ticker = input.slice(1);

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
	}
}