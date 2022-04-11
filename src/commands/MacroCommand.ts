import { Message, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';

/**
 * Command to register macros with the bot.
 */
export default class MacroCommand extends Command {
	public expression = '&(\\S*)';
	public matchOn = MatchOn.MESSAGE;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (message: Message | TextChannel, _: unknown) => {
		return '';
	};
}
