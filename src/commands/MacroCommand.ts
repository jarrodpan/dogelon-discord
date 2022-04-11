import { Message, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';
import { HelpPage } from '../types/Help';

/**
 * Command to register macros with the bot.
 */
export default class MacroCommand extends Command {
	private db?: Database;
	public constructor(db?: Database) {
		super();
		if (db) this.db = db;
	}

	// TODO: write help
	public helpPage: HelpPage = {
		command: 'macro',
		message: [
			{
				title: '`!subscribe {feed}`\n`!s {feed}`', // TODO
				body: 'Subscribe a channel to a news feed.', // TODO
			},
			{
				title: '`!unsubscribe {feed}`\n`!uns {feed}`', // TODO
				body: 'Unsubscribe a channel from a news feed.', // TODO
			},
		],
	};

	private macroMap = new Map<string, any>();

	public expression = '&(\\S*)';
	public matchOn = MatchOn.MESSAGE;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (message: Message | TextChannel, input: string) => {
		// flags
		let setDefinition;

		// parse command
		// knockout if non command gets passed in for some reason
		if (input.slice(0, 1) !== '&') return null;
		// split any trailling spaced off stuff, split by equals sign
		const splitInput = input.split(' ')[0].slice(1).split('=>');
		const [macro, ..._] = splitInput;
		let [, ...definition] = splitInput;

		if (!macro || macro.trim().length == 0) return null;

		if (!definition || definition.length == 0) setDefinition = false;
		else setDefinition = true;

		console.debug(macro, setDefinition, definition);

		if (setDefinition) {
			// TODO: validate all commands are valid
			// remove any whitespace or empty commands
			definition = definition.filter((val) => val.trim() !== '');
			if (definition.length == 0) return null;

			let invalidCommand = false;
			definition.forEach((cmd) => {
				// TODO: match against Commands, return if invalid
				let tokenMatchCommands;
				try {
					const matchOnMessage: any = Command.matchOn
						.get(MatchOn.TOKEN)
						.exec(cmd).groups;
					tokenMatchCommands = Object.entries(matchOnMessage).filter(
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						([_s, matchString]) => {
							return matchString != undefined;
						}
					);
					console.log(
						cmd,
						'message matching commands:',
						tokenMatchCommands
					);
					Command.matchOn.get(MatchOn.TOKEN).lastIndex = 0;
				} catch (e) {
					console.error(cmd, '=>\tno token matching groups found');
					tokenMatchCommands = [];
					invalidCommand = true;
					return null;
				}
			});
			if (invalidCommand) return null;
			// TODO: do database calls
		} else {
			// check macro exists
			if (!this.macroMap.has(macro)) return null;

			const cmdList = this.macroMap.get(macro);
		}

		return 1; // TODO: fix, done for prototyping
	};
}
