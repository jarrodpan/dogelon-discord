import { MessageEmbed } from 'discord.js';
import Action from '../types/Action';
import { Command, MatchOn } from '../types/Command'
let pkg = require("./../../package.json")
/**
 * what's ligma?
 * 
 * Example of message matching.
 */
export default class HelpCommand implements Command {
	public expression = "(!h(elp)?)";
	public matchOn = MatchOn.MESSAGE;
	public execute = (input: any) => {
		let embed = new MessageEmbed();
		const v = `v${pkg.version}`;
		const a = "author info here";

		embed
			.setColor("#3f00ad")
			.setTitle(`🚀 Dogelon ${v}`)
			.setThumbnail("https://i.imgur.com/2vHF2jl.jpg")
			.setDescription("The not-so-stupid discord bot made for no reason.")
			.addField("`${stock ticker}` (inline)", "Gets current price for a stock. Cached and/or delayed depending on API response and exchange opening times.")
			.addField("`/r/{subreddit}`, `r/{subreddit}` (inline)", "Converts a subreddit reference to a reddit link, regardless of if it exists or not.")
			.addField("`what's ligma?` (and some variants, inline)", "dare you to ask me")
			.addField("`!help`, `!h`", "Displays this message")
			//.setTimestamp()
			.setFooter({ text: `${v} • ${a}` })
			;

		return { embeds: [embed] };
	}
}