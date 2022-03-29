/* eslint-disable no-mixed-spaces-and-tabs */
import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
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
	private db: Database;
	public constructor(db: Database) {
		super();
		this.db = db;
	}

	private static coins: APIResponse.CoinGeckoCoins.CoinDetails[];

	public init = () => {
		const cacheName = 'crypto-coinlist';

		return Promise.resolve()
			.then(async () => {
				return await this.db.get(cacheName);
			})
			.then(async (coinList) => {
				let coins: APIResponse.CoinGeckoCoins = coinList;
				if (!coinList) {
					console.debug('fetching new result...');
					coinList = await axios.get(
						'https://api.coingecko.com/api/v3/coins/list?include_platform=false'
					);
					coins = coinList.data;
					await this.db.set(cacheName, { coins }, Database.ONE_WEEK);
					return { coins };
				} else return coins;
			})
			.then((coins) => {
				CryptocurrencyCommand.coins =
					coins.coins as APIResponse.CoinGeckoCoins.CoinDetails[];
			})
			.catch((e) => {
				console.error(e);
			});
	};

	public expression = `(?:\\%\\S*)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	public execute = async (message: Message | TextChannel, input: string) => {
		const args = input.split('/');
		const tickerArgs = args[0].slice(1).split(':');
		let ticker = tickerArgs[0];

		// logic for preference setting detection
		let setPref = false;
		if (ticker.startsWith('!')) {
			ticker = ticker.slice(1);
			setPref = true;
		}

		const cc = args[1] ? this.validateCurrency(args[1]) : 'usd';
		const timeframe = args[2] ? this.validateTimeframe(args[2]) : '24h';

		let embed;

		// find coin ticker
		const coinArr: APIResponse.CoinGeckoCoin[] | undefined =
			CryptocurrencyCommand.coins.filter((item) => item.symbol == ticker);
		if (coinArr === undefined) return null;

		let prefSpecified = false;
		let pref: string | number = 'all';

		if (tickerArgs[1] !== undefined) {
			pref = tickerArgs[1]
				? this.validatePreference(
						tickerArgs[1].toLowerCase(),
						coinArr.length
				  )
				: 'all';
			prefSpecified = true;
		}

		/**
		 * Arguments parsed
		 */
		console.debug(
			'Crypto: arguments=',
			ticker,
			pref,
			timeframe,
			cc,
			`setPref:${setPref}`
		);
		console.log('Coin list:', coinArr);

		// check for existing preference
		// TODO: should skip this if only one currency in list but cbf
		const prefCache = 'crypto-preferences';
		let dbPref: object | false = await this.db.get(prefCache);
		const channel = (message as Message).channelId.toString();
		// if no preferences in db and we want to set a preference
		if (!dbPref && setPref) dbPref = {};

		if (setPref) {
			if (pref !== 'all') {
				// we have a preference object we want to update ('all' = no preference)

				if (!dbPref[channel]) dbPref[channel] = {};
				dbPref[channel][ticker] = pref;
				// return notification
			} else {
				// pref is 'all' which is unset pref
				if (
					dbPref[channel] !== undefined &&
					dbPref[channel][ticker] !== undefined
				)
					delete dbPref[channel][ticker];
				else return null; // preference is already unset // delete preference
			}
			await this.db.set(prefCache, dbPref, Database.NEVER_EXPIRE);

			const coinName =
				pref === 'all'
					? '`all`'
					: `\`${pref.toString()}\`` +
					  ' (id: `' +
					  coinArr[pref].id +
					  '`)';

			embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('🚀  Crypto Preferences Changed')
				.setDescription(
					`Set <#${channel}> preference for \`${ticker}\` to ${coinName}.`
				)
				.setFooter({ text: 'CoinGecko' });
			return { embeds: [embed] };
		}
		console.debug('dbPref:', dbPref);
		console.debug(
			'channel pref:',
			dbPref[channel] !== undefined &&
				dbPref[channel][ticker] !== undefined
				? dbPref[channel][ticker]
				: 'unset'
		);
		// load preference from db
		if (
			dbPref[channel] !== undefined &&
			dbPref[channel][ticker] !== undefined &&
			!prefSpecified
		) {
			pref = dbPref[channel][ticker];
			console.log('preference set:', channel, ticker, pref);
		}

		//let coin: Coin;
		if (coinArr.length == 0) return null;
		if (coinArr.length == 1) pref = 0;
		if (!setPref && pref === 'all') {
			// return list of coins
			embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('🚀  Multiple Coins Detected')
				.setDescription(
					'Multiple coins have this ticker. Select one of the following:'
				)
				.setFooter({ text: 'CoinGecko' });

			// enumerate options
			coinArr.forEach((coin, index) => {
				embed.addField(
					'`%' + coin.symbol + ':' + index + '`',
					coin.name + ' (id: `' + coin.id + '`)'
				);
			});

			// instructions on setting preferences
			const sym = coinArr[0].symbol;
			embed
				.addField('\u200b', '**Special options**')
				.addField(
					'`%' + sym + ':all`',
					'Show this list when a preference is set.'
				)
				.addField(
					'`%!' + sym + ':{index}`',
					'Set preference for this ticker e.g. `%!' + sym + ':1`.'
				)
				.addField(
					'`%!' + sym + ':all`',
					'Remove preference for this ticker.'
				);

			return { embeds: [embed] };
		}

		// definitely have a number here within range
		const coin: Coin = coinArr[pref];

		// coin exists
		return Promise.resolve()
			.then(async () => {
				let response;
				const cacheName = 'crypto-' + coin.id.toUpperCase();

				if (this.db) {
					response = await this.db.get(cacheName);
					console.log('cache hit:');
					//console.debug(response);
				}

				if (response == false) {
					console.debug('fetching new result...');
					response = await axios.get(
						'https://api.coingecko.com/api/v3/coins/' +
							coin.id +
							'?tickers=false&market_data=true&community_data=false&developer_data=false'
					);
					//console.debug('new data:', response);
					response.request = undefined;
					if (this.db) await this.db.set(cacheName, response);
					console.log('cache updated');
				}
				//console.log(response);
				const data = response.data as APIResponse.CoinGeckoCoin;

				return { data };
			})
			.then(({ data }) => {
				//console.log(data.error);

				console.log('setting up response');
				const result = data.market_data;
				const title =
					data.name + ' (' + data.symbol?.toUpperCase() + ')';
				console.log(title);
				console.debug('title set');

				const coinPrice: number = result.current_price[cc];
				const sigDigits: number = coinPrice < 10 ? 5 : 2;

				console.debug(`price ${cc}`, coinPrice);

				const ccUpper = cc.toUpperCase();

				const price = coinPrice.toFixed(sigDigits).toString();
				console.debug(`price_change_${timeframe}_in_currency`);
				const priceChange = // read response if 24h otherwise derive from %
					timeframe === '24h'
						? //result.price_change_24h_in_currency.usd
						  result[`price_change_${timeframe}_in_currency`][cc]
								?.toFixed(sigDigits)
								.toString()
						: (
								coinPrice -
								coinPrice /
									(result[
										`price_change_percentage_${timeframe}_in_currency`
									][cc] /
										100 +
										1)
						  )
								?.toFixed(sigDigits)
								.toString();
				console.debug(`change ${cc}`, priceChange);
				const pcChange =
					//result.price_change_percentage_24h_in_currency.usd
					result[`price_change_percentage_${timeframe}_in_currency`][
						cc
					]
						.toFixed(2)
						.toString() + '%';

				const marketCap = result.market_cap[cc].toString();
				const marketCapChange =
					result.market_cap_change_24h_in_currency[cc].toString();
				const marketCapPcChange =
					result.market_cap_change_percentage_24h_in_currency[cc]
						.toFixed(2)
						.toString() + '%';

				console.debug(`change pc ${cc}`, pcChange);

				const footer = 'CoinGecko  •  ' + ccUpper;

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
						data.image.large || 'https://i.imgur.com/AfFp7pu.png'
					)
					.addField(`💸  Price ${ccUpper}$`, price, true)
					.addField(
						`🪙  Change ${ccUpper}$ (${timeframe})`,
						priceChange,
						true
					)
					.addField(`💹  Change % (${timeframe})`, pcChange, true)

					.addField(`🏦  Market Cap ${ccUpper}$`, marketCap, true)
					.addField(
						`💵  MC Change ${ccUpper}$ (24h)`,
						marketCapChange,
						true
					)
					.addField(`📈  MC Change % (24h)`, marketCapPcChange, true)
					//.setTimestamp()
					.setFooter({ text: footer });
				console.log('embed set');
				console.debug(embed);

				if (embed == null)
					throw new Error(
						'CryptoCommand: embed is undefined or null'
					);

				return { embeds: [embed] };
			})
			.catch((e) => {
				console.error(e);
				embed = null;
				return null;
			});
	};

	private validatePreference = (pref: string, cap: number) => {
		const n = Number.parseInt(pref);
		if (Number.isNaN(n) || n < 0) return 'all';
		if (n > cap - 1) return 'all';
		return n;
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
		switch (
			tf // switch of doom and despair
		) {
			case 'h':
			case 'hour':
			case 'hourly':
			case '1h':
				return '1h';
			case 'd':
			case '1d':
			case 'daily':
			case '24hour':
			case '24hours':
			case '24h':
			case '24':
				return '24h';
			case 'w':
			case '1w':
			case 'week':
			case '1week':
			case 'weekly':
			case 'oneweek':
			case '7d':
			case '7':
				return '7d';
			case '2w':
			case '2week':
			case '2weeks':
			case 'biweekly':
			case 'fortnight':
			case 'fortnightly':
			case 'twoweek':
			case 'twoweeks':
			case '14d':
			case '14day':
			case '14days':
				return '14d';
			case 'm':
			case '1m':
			case 'month':
			case 'monthly':
			case '30d':
			case '30day':
			case '30days':
				return '30d';
			case '2m':
			case 'bimonth':
			case '2month':
			case '2months':
			case 'twomonth':
			case 'twomonths':
			case 'bimonthly':
			case '60d':
			case '60day':
			case '60days':
				return '60d';
			case '200d':
			case '200day':
			case '200days':
				return '200d';
			case 'y':
			case '365d':
			case '365day':
			case '365days':
			case '366d':
			case '366day':
			case '366days':
			case '1y':
			case 'year':
			case '1year':
			case 'yearly':
				return '1y';
		}
		return '24h';
	};
}
