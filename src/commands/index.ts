import { Command, MatchOn } from '../types/Command';
import * as fs from 'fs';
import Database from '../types/Database';
import PostgresDatabase from '../resolvers/PostgresDatabase';
export default class Commands {
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
			Commands.db = new PostgresDatabase();
			await Commands.db.connect();

			// load commands from file
			const commandList: Map<any, any> = new Map();
			await fs
				.readdirSync('./src/commands/')
				.forEach(async (command: string) => {
					const [commandName, ts] = command.split('.');
					if (
						// knockout junk files
						ts !== 'ts' || // not typescript
						!commandName.endsWith('Command') // not a command
					)
						return;

					// import code
					const commandClass: Command = new (
						await import(`./${commandName}`)
					).default(Commands.db);
					console.debug('new command:', commandClass);
					//console.debug("match string:", commandClass.expression);

					// push regex match on to correct queue
					Commands.matchOn
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
			Commands.commandMap = commandList;

			return;
		})
		.then(() => {
			// for each command
			// take the regex string and append to either messageRegex or tokenRegex with named groups
			const newMatch: Map<MatchOn, RegExp> = new Map();
			Commands.matchOn.forEach((val: string[], key) => {
				//console.log("MATCHon", key, val.join("|"));
				newMatch.set(key, new RegExp(val.join('|'), 'gm'));
			});
			// save compiled regexes
			Commands.matchOn = newMatch;

			// clear db expired data every 5 mins
			setInterval(() => {
				Commands.db?.clean();
			}, 360);

			return;
		});
}
