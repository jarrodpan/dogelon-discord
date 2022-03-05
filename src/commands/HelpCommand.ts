import { MessageEmbed } from 'discord.js';
import { Command, MatchOn } from '../types/Command'
let pkg = require("./../../package.json")
/**
 * shows command list
 */
export default class HelpCommand implements Command {
	public expression = "(!h(elp)?)";
	public matchOn = MatchOn.MESSAGE;
	public execute = (input: any) => {
		let embed = new MessageEmbed();
		const v = `v${pkg.version}`;
		const a = "author info here";

		embed
			.setColor("#9B59B6")
			.setTitle(`🚀 Dogelon`)
			.setThumbnail("https://i.imgur.com/2vHF2jl.jpg")
			.setDescription("The not-so-stupid discord bot made for no reason. Written in Node.js and TypeScript.")
			.addField("`${stock ticker}` (inline)", "Gets current price for a stock. Cached and/or delayed depending on API response and exchange opening times. Yahoo tickers, add `.AX` for Australian stocks.")
			.addField("`/r/{subreddit}`, `r/{subreddit}` (inline)", "Converts a subreddit reference to a reddit link, regardless of if it exists or not.")
			.addField("`what's ligma?` (and some variants, inline)", "dare you to ask me")
			.addField("`!help`, `!h`", "Displays this message")
			//.setTimestamp()
			.setFooter({ text: `Dogelon ${v} • ${a}` })
			;

		return { embeds: [embed] };
	}
}