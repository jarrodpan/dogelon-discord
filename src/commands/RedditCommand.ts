import { Message, TextChannel } from 'discord.js'
import { Command, MatchOn } from '../types/Command'

/**
 * a command to turn r/ and /r/ references and reply with the link (as discord doesnt do it automatically for some reason)
 *
 * Example of token matching.
 */
export default class RedditCommand extends Command {
	public expression = `(?:r\\/|\\/r\\/)\\S*`
	public matchOn = MatchOn.TOKEN // MatchOn.TOKEN
	public execute = (message: Message | TextChannel, input: any) => {
		return (
			'https://www.reddit.com' +
			(input.slice(0, 1) == '/' ? '' : '/') +
			input
		)
	}
}
