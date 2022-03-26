import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('./../../package.json');
/**
 * shows command list
 */
export default class HelpCommand extends Command {
	private db: Database | undefined;
	public constructor(db?: Database | undefined) {
		super();
		if (db) this.db = db;
	}

	public expression = '(!h(elp)?)';
	public matchOn = MatchOn.MESSAGE;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (message: Message | TextChannel, _: unknown) => {
		const v = `v${pkg.version}`;
		const a = 'author info here';

		const embed = new MessageEmbed()
			.setColor('#9B59B6')
			.setTitle(`🚀  Dogelon`)
			.setThumbnail('https://i.imgur.com/2vHF2jl.jpg')
			.setDescription(
				'The not-so-stupid discord bot made for no reason. Written in Node.js and TypeScript.'
			)
			.addField(
				'`${stock ticker}` (inline)',
				'Gets current price for a stock. Cached and/or delayed depending on API response and exchange opening times. Sourced from [Yahoo Finance](https://finance.yahoo.com/).'
			)
			.addField(
				'`%{crypto ticker}(:currency:time)` (inline)',
				'Gets current price for a cryptocurrency. Cached and/or delayed. Usage: `%eth`, `%btc:aud:1y`, `%doge::2w`. Sourced from [CoinGecko](https://www.coingecko.com).'
			)
			.addField(
				'`/r/{subreddit}`, `r/{subreddit}` (inline)',
				'Converts a subreddit reference to a reddit link, regardless of if it exists or not.'
			)
			.addField(
				'`!subscribe {feed}`, `!s {feed}`\n`!unsubscribe {feed}`, `!uns {feed}`',
				'Subscribe/unsubscribe a channel to a news feed. Polls once every half hour. Current options:\n - [`binance-new`](https://www.binance.com/en/support/announcement/c-48)'
			)
			.addField(
				'`!binance`, `!b` (inline)',
				'Shows the latest cryptocurrency listing news from [Binance](https://www.binance.com/en/support/announcement/c-48)'
			)
			.addField('`!help`, `!h`', 'Displays this message')
			//.setTimestamp()
			.setFooter({ text: `Dogelon ${v}  •  ${a}` });
		return { embeds: [embed] };
	};
}
