import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';
import { HelpPage, HelpField } from '../types/Help';
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

	public expression = '!h(elp)?.*';
	public matchOn = MatchOn.MESSAGE;

	private helpPages = new Map<string, HelpField[]>();
	private defaultPage = '';

	public loadOptions = (pages: HelpPage[]) => {
		const sorted = pages.sort((a, b) => a.command.localeCompare(b.command));

		sorted.forEach((page) => {
			this.helpPages.set(page.command, page.message);
			this.defaultPage += '- `' + page.command + '`\n';
		});
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (message: Message | TextChannel, input: string) => {
		const v = `v${pkg.version}`;
		//const a = '<@944798462053089300>';
		const [_, option, ...__] = input.split(' ');
		console.log(option);

		const embed = new MessageEmbed()
			.setColor('#9B59B6')
			.setTitle(`🚀  Dogelon`)
			.setThumbnail('https://i.imgur.com/2vHF2jl.jpg')
			.setDescription(
				'The not-so-stupid discord bot made for no reason. Written in Node.js and TypeScript.\n\nAvailable options for `!help`:\n\n' +
					this.defaultPage
			)
			.addField(
				'`${stock ticker}` (inline)',
				'Gets current price for a stock. Cached and/or delayed depending on API response and exchange opening times. Sourced from [Yahoo Finance](https://finance.yahoo.com/).'
			)
			.addField(
				'`%{ticker}(:selection)(/currency/time)` (inline)\n`%!{ticker}:{preference}` (inline)',
				'Gets current price for a cryptocurrency. Cached and/or delayed. Examples: `%eth`, `%gala/aud`, `%btc/jpy/1y`, `%doge:1//2w`.\n\
				Example to set preferences for multiple choice: `%!eth:1`.\n\
				Timescale options: `1h`, `24h`, `7d`, `14d`, `30d`, `60d`, `200d`, `1y` (with various aliases).\n\
				Sourced from [CoinGecko](https://www.coingecko.com).'
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
			.addField('`!changes`, `!c`', 'Displays latest changelog entry')
			.addField('`!help`, `!h`', 'Displays this message')
			//.setTimestamp()
			.setFooter({
				text: `Dogelon ${v}`,
				iconURL:
					'https://cdn.discordapp.com/app-icons/945669693576994877/c11dde4d4f016ffcc820418864efd9f4.png?size=64',
			});
		return { embeds: [embed] };
	};
}
