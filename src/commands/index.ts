//import { Command, MatchOn } from '../types/Command';
import * as fs from 'fs';
import Database from '../types/Database';
import PostgresDatabase from '../resolvers/PostgresDatabase';
import { Message, TextChannel } from 'discord.js';
import { HelpPage } from '../types/Help';

export enum MatchOn {
	TOKEN,
	MESSAGE,
}

export abstract class Command {
	/**
	 * Required. Regular expression to check against when matching in discord chat
	 */
	public readonly expression!: string;
	/**
	 * Required. Enum to determine whether to match on messages as a whole or just tokens in messages (separated by spaces)
	 * Values: MatchOn.TOKEN, MatchOn.MESSAGE
	 */
	public readonly matchOn!: MatchOn;
	/**
	 * Required. The callback to run when a match is detected and queued up to generate the output for discord.
	 * @param message a Discord.js `Message` or `TextChannel` object to send the message/reply to
	 * @param input the message or token string to parse.
	 * @returns a Promise or response to send to discord.
	 */
	public readonly execute!: (
		message: Message | TextChannel,
		input: any
	) => Promise<any> | any;

	/**
	 * A callback to run after the class has been loaded. Done like this to allow for asynchronous initialisation.
	 */
	public readonly init?: () => void;

	/**
	 * If defined, provides the command for the help page and a list of string arrays with field
	 */
	public readonly helpPage?: HelpPage;

	/**
	 * all the command classes
	 */
	static commandMap: Map<any, any>;
	static db: Database | undefined;

	static matchOn: Map<MatchOn, any> = new Map([
		[MatchOn.MESSAGE, []],
		[MatchOn.TOKEN, []],
	]);

	/**
	 * runs directly after declaration
	 */
	private static _initialize = Promise.resolve()
		.then(async () => {
			// initialise database
			Command.db = new PostgresDatabase();
			await Command.db.connect();

			// load commands from file
			const commandList: Map<any, any> = new Map();
			await fs
				.readdirSync('./src/commands/')
				.forEach(async (command: string) => {
					const [commandName, ts, ..._] = command.split('.');
					if (
						// knockout junk files
						ts !== 'ts' || // not typescript or a test or something
						!commandName.endsWith('Command') // not a command
					)
						return;

					// import code
					const commandClass: Command = new (
						await import(`./${commandName}`)
					).default(Command.db);
					console.debug('new command:', commandClass);
					//console.debug("match string:", commandClass.expression);

					if (commandClass.init) {
						console.debug('running init() on', commandName);
						commandClass.init();
					}

					// push regex match on to correct queue
					Command.matchOn
						.get(commandClass.matchOn)
						.push(
							`^(?<${commandName}>` +
								commandClass.expression +
								`)$`
						);

					// add command to command map
					commandList.set(commandName, commandClass);
				});

			// assign static variables at runtime
			Command.commandMap = commandList;

			return;
		})
		.then(() => {
			// for each command
			// take the regex string and append to either messageRegex or tokenRegex with named groups
			const newMatch: Map<MatchOn, RegExp> = new Map();
			Command.matchOn.forEach((val: string[], key) => {
				//console.log("MATCHon", key, val.join("|"));
				newMatch.set(key, new RegExp(val.join('|'), 'gm'));
			});
			// save compiled regexes
			Command.matchOn = newMatch;

			// clear db expired data every 5 mins
			setInterval(() => {
				Command.db?.clean();
			}, 300000);

			return;
		});
}
