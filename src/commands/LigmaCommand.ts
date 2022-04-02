import { Message, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';

/**
 * what's ligma?
 *
 * Example of message matching.
 */
export default class LigmaCommand extends Command {
	public expression =
		"(?:\\s|\\S)*what(?:'{0,1}| | i)s ligma\\?*(?:\\s|\\S)*"; //"what's ligma";
	public matchOn = MatchOn.MESSAGE;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (message: Message | TextChannel, _: unknown) => {
		return 'ligma balls';
	};
}
