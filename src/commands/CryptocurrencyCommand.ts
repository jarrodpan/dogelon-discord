import axios from 'axios';
import {
	Message,
	MessageEmbed,
	TextChannel,
	UserContextMenuInteraction,
} from 'discord.js';
import { ExitStatus } from 'typescript';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';
// eslint-disable-next-line @typescript-eslint/no-var-requires

/**
 * Searches coin prices from coingecko.com
 *
 * https://www.coingecko.com/en/api/documentation
 *
 * Coin list sourced from https://api.coingecko.com/api/v3/coins/list
 */
type Coin = {
	id: string;
	symbol: string;
	name: string;
};

export default class CryptocurrencyCommand extends Command {
	private db: Database | undefined;
	public constructor(db: Database) {
		super();
		if (db) this.db = db;
	}

	private static coins;

	public init = () => {
		const cacheName = 'crypto-coinlist';

		return Promise.resolve()
			.then(async () => {
				return await this.db?.get(cacheName);
			})
			.then(async (coinList) => {
				let coins = coinList;
				if (!coinList) {
					console.debug('fetching new result...');
					coinList = await axios.get(
						'https://api.coingecko.com/api/v3/coins/list?include_platform=false'
					);
					coins = coinList.data;
					await this.db?.set(cacheName, { coins }, Database.ONE_WEEK);
					return { coins };
				} else return coins;
			})
			.then((coins) => {
				CryptocurrencyCommand.coins = coins.coins;
			})
			.catch((e) => {
				console.error(e);
			});
	};

	public expression = `(?:\\%\\S*)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	public execute = (message: Message | TextChannel, input: string) => {
		const args = input.split(':');
		const ticker = args[0].slice(1);
		const timeframe = args[1] ? this.validateTimeframe(args[1]) : '24h';
		const cc = args[2] ? this.validateCurrency(args[2]) : 'usd';

		let embed;

		// find coin ticker
		const coin: Coin = CryptocurrencyCommand.coins.find(
			(item) => item.symbol == ticker
		);
		if (coin == undefined) return null;

		console.log(coin);
		//const cc = 'usd';
		// coin exists
		return Promise.resolve()
			.then(async () => {
				let response;
				let data;
				let error = false;
				const cacheName = 'crypto-' + coin.id.toUpperCase();

				try {
					if (this.db) {
						response = await this.db.get(cacheName);
						console.log('cache hit:');
						console.debug(response);
					}

					if (response == false) {
						console.debug('fetching new result...');
						response = await axios.get(
							'https://api.coingecko.com/api/v3/coins/' +
								coin.id +
								'?tickers=false&market_data=true&community_data=false&developer_data=false'
						);
						console.debug('new data:', response);
						response.request = undefined;
						if (this.db) await this.db.set(cacheName, response);
						console.log('cache updated');
					}
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
					console.error('cyrpto error');
				}
				return [response, data, error];
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			})
			.then(([response, data, error]) => {
				//console.log(data.error);
				if (!error) {
					console.log('setting up response');
					const result = data.market_data;
					const title =
						data.name + ' (' + data.symbol.toUpperCase() + ')';
					console.log(title);
					console.debug('title set');
					// TODO: select currency dynamically
					//let price = result.current_price[cc];
					//let priceChange = result.price_change_24h_in_currency[cc];
					//let pcChange = result.price_change_24h_in_currency[cc];
					const coinPrice = result.current_price.usd;
					const sigDigits = coinPrice < 10 ? 5 : 2;

					const price = coinPrice.toFixed(sigDigits).toString();
					const priceChange =
						'$' +
						result.price_change_24h_in_currency.usd
							?.toFixed(sigDigits)
							.toString();
					const pcChange =
						result.price_change_percentage_24h_in_currency.usd
							.toFixed(2)
							.toString() + '%';
					const footer = 'CoinGecko  •  ' + cc.toUpperCase();

					console.log(
						'variables set',
						price,
						priceChange,
						pcChange,
						footer
					);
					embed = new MessageEmbed()
						.setColor('#0099ff')
						.setTitle('🚀  ' + title)
						.setThumbnail(
							data.image.large ||
								'https://i.imgur.com/AfFp7pu.png'
						)
						.addField('💸  Price', price, true)
						.addField('🪙  $ Change (24h)', priceChange, true)
						.addField('💹  % Change (24h)', pcChange, true)
						//.setTimestamp()
						.setFooter({ text: footer });
					console.log('embed set');
					console.debug(embed);
				} else {
					//embed = null;
					// error case
					/*embed
					.setColor("RED")
					.setTitle(data.error.code)
					.setDescription(data.error.description)
					;*/
					console.error('Crypto: response error');
					return null;
				}
				//console.log("finance return", embed);
				if (embed == null)
					throw new Error(
						'CryptoCommand: embed is undefined or null'
					);
				//if (typeof embed != null || typeof embed !== undefined) {
				return { embeds: [embed] };
				//}
			})
			.catch((_) => {
				console.error(_);
				embed = null;
				return null;
			});
	};

	private validateCurrency = (cc: string) => {
		cc = cc.trim().toLowerCase();
		const ccList = [
			'aed',
			'ars',
			'aud',
			'bch',
			'bdt',
			'bhd',
			'bmd',
			'bnb',
			'brl',
			'btc',
			'cad',
			'chf',
			'clp',
			'cny',
			'czk',
			'dkk',
			'dot',
			'eos',
			'eth',
			'eur',
			'gbp',
			'hkd',
			'huf',
			'idr',
			'ils',
			'inr',
			'jpy',
			'krw',
			'kwd',
			'lkr',
			'ltc',
			'mmk',
			'mxn',
			'myr',
			'ngn',
			'nok',
			'nzd',
			'php',
			'pkr',
			'pln',
			'rub',
			'sar',
			'sek',
			'sgd',
			'thb',
			'try',
			'twd',
			'uah',
			'usd',
			'vef',
			'vnd',
			'xag',
			'xau',
			'xdr',
			'xlm',
			'xrp',
			'yfi',
			'zar',
			'bits',
			'link',
			'sats',
		];

		if (ccList.includes(cc)) return cc;
		return 'usd';
	};

	private validateTimeframe = (tf: string) => {
		tf = tf.trim().toLowerCase();
		const tfList = ['1h', '24h', '7d', '14d', '30d', '60d', '200d', '1y'];
		if (tfList.includes(tf)) return tf;
		switch (
			tf // switch of doom and despair
		) {
			case 'h':
			case 'hour':
			case 'hourly':
				return '1h';
			case 'd':
			case 'daily':
			case '24hour':
			case '24hours':
			case '24 hour':
			case '24 hours':
				return '24h';
			case 'w':
			case 'week':
			case 'weekly':
			case 'oneweek':
			case 'one week':
				return '7d';
			case '2w':
			case '2week':
			case '2weeks':
			case '2 week':
			case '2 weeks':
			case 'biweekly':
			case 'fortnight':
			case 'fortnightly':
			case 'twoweek':
			case 'two week':
			case 'twoweeks':
			case 'two weeks':
				return '2w';
			case 'm':
			case 'month':
			case 'monthly':
				return '30d';
			case '2m':
			case 'bimonth':
			case '2month':
			case '2months':
			case '2 month':
			case '2 months':
			case 'two month':
			case 'two months':
			case 'twomonth':
			case 'twomonths':
			case 'bimonthly':
			case '60day':
			case '60days':
			case '60 day':
			case '60 days':
				return '60d';
			case 'y':
			case 'year':
			case 'yearly':
				return '1y';
		}
		return '24h';
	};
}
