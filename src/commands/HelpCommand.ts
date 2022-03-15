import { MessageEmbed } from 'discord.js';
import { Command, MatchOn } from '../types/Command'
import Database from '../types/Database';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("./../../package.json");
/**
 * shows command list
 */
export default class HelpCommand extends Command {
	private db: Database | undefined;
	public constructor(db?: Database | undefined) { super(); if (db) this.db = db; }
	
	public expression = "(!h(elp)?)";
	public matchOn = MatchOn.MESSAGE;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (_: unknown) => {
		const v = `v${pkg.version}`;
		const a = "author info here";

		const embed = new MessageEmbed()
			.setColor("#9B59B6")
			.setTitle(`🚀  Dogelon`)
			.setThumbnail("https://i.imgur.com/2vHF2jl.jpg")
			.setDescription("The not-so-stupid discord bot made for no reason. Written in Node.js and TypeScript.")
			.addField("`${stock ticker}` (inline)", "Gets current price for a stock. Cached and/or delayed depending on API response and exchange opening times. Yahoo tickers, add `.AX` for Australian stocks.")
			.addField("`%{crypto ticker}` (inline)", "Gets current price for a cryptocurrency. Cached and/or delayed. Sourced from [CoinGecko](https://www.coingecko.com).")
			.addField("`/r/{subreddit}`, `r/{subreddit}` (inline)", "Converts a subreddit reference to a reddit link, regardless of if it exists or not.")
			.addField("`what's ligma?` (and some variants, inline)", "dare you to ask me")
			.addField("`!binance`, `!b` (inline)", "Shows the latest listing news from Binance")
			.addField("`!help`, `!h`", "Displays this message")
			.setTimestamp()
			.setFooter({ text: `Dogelon ${v}  •  ${a}` })
			;

		return { embeds: [embed] };
	}
}