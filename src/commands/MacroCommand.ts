import { Message, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import { HelpPage } from '../types/Help';

/**
 * Command to register macros with the bot.
 */
export default class MacroCommand extends Command {
	private db: Database;
	public constructor(db: Database) {
		super();
		this.db = db;
	}
	public expression = '^&(\\S*)(=)?(\\S*)';
	public matchOn = MatchOn.MESSAGE;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (message: Message | TextChannel, input: string) => {
		// set flags
		let setDefinition;

		// parse command
		// knockout if non command gets passed in for some reason
		if (input.slice(0, 1) !== '&') return null;
		// split any trailling spaced off stuff, split by equals sign
		const [macro, definition] = input.split(' ')[0].slice(1).split('=');

		if (!definition || definition.length == 0) setDefinition = false;
		else setDefinition = true;

		return '';
	};
}
