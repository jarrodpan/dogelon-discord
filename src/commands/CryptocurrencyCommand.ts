import axios from 'axios';
import { MessageEmbed, UserContextMenuInteraction } from 'discord.js';
import { Command, MatchOn } from '../types/Command'
const coins = require("./../types/coingeckocoins.json");

/**
 * Searches coin prices from coingecko.com
 * 
 * https://www.coingecko.com/en/api/documentation
 * 
 * Coin list sourced from https://api.coingecko.com/api/v3/coins/list
 */
type Coin = {
	id: string,
	symbol: string,
	name: string
}

export default class CryptocurrencyCommand implements Command {
	public expression = `(?:\\%\\S*)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	public execute = (input: any) => {
		let ticker = input.slice(1);


		let embed;

		// find coin ticker
		const coin: Coin = coins.find(item => item.symbol == ticker);
		if (coin == undefined) return null;

		console.log(coin);
		let cc = "usd";
		// coin exists
		return Promise.resolve().then(async () => {
			let response;
			let data;
			let error = false;

			try {
				response = await axios.get("https://api.coingecko.com/api/v3/coins/" + coin.id + "?tickers=false&market_data=true&community_data=false&developer_data=false");
				//console.log(response);
				//console.log(response);
				data = response.data;
			} catch (e) {
				//if (typeof response.data != undefined) data = {};
				//if (typeof response.data.quoteSummary != undefined) data = response.data.quoteSummary;
				//else if (typeof response.data.finance != undefined) data = response.data.finance;

				//data = (response.data.quoteSummary ?? response.data.finance ?? {});
				data = undefined;
				error = true;
				console.error("cyrpto error");
			}
			return [response, data, error];
		}).then(([response, data, error]) => {
			//console.log(data.error);
			if (!error) {
				console.log("setting up response");
				let result = data.market_data;
				let title = data.name + " (" + (data.symbol).toUpperCase() + ")";
				console.log(title);
				console.log("title set");
				// TODO: select currency dynamically
				//let price = result.current_price[cc];
				//let priceChange = result.price_change_24h_in_currency[cc]; 
				//let pcChange = result.price_change_24h_in_currency[cc];
				let coinPrice = result.current_price.usd;
				let sigDigits = (coinPrice < 10 ? 5 : 2);

				let price = (coinPrice).toFixed(sigDigits).toString();
				let priceChange = '$' + (result.price_change_24h_in_currency.usd).toFixed(sigDigits).toString();
				let pcChange = (result.price_change_percentage_24h_in_currency.usd).toFixed(2).toString() + '%';
				let footer = "CoinGecko  •  " + cc.toUpperCase();

				console.log("variables set", price, priceChange, pcChange, footer);
				embed = new MessageEmbed()
					.setColor("#0099ff")
					.setTitle("🚀  " + title)
					.addField("💸  Price", price, true)
					.addField("🪙  $ Change (24h)", priceChange, true)
					.addField("💹  % Change (24h)", pcChange, true)
					.setTimestamp()
					.setFooter({ text: footer })
					;
				console.log("embed set");
				console.log(embed);
			} else {
				//embed = null;
				// error case
				/*embed
					.setColor("RED")
					.setTitle(data.error.code)
					.setDescription(data.error.description)
					;*/
				console.error("Crypto: response error");
				return null;
			}
			//console.log("finance return", embed);
			if (embed == null) throw new Error("CryptoCommand: embed is undefined or null");
			//if (typeof embed != null || typeof embed !== undefined) {
			return { embeds: [embed] };
			//}

		}).catch((_) => {
			console.error(_);
			embed = null;
			return null;
		});



	}
}