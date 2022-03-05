import { Command, MatchOn } from "../types/Command";
import * as fs from 'fs';
export default class Commands {

	/**
	 * all the command classes
	 */
	static commandMap: Map<any, any>;

	static matchOn: Map<MatchOn, any> = new Map([
		[MatchOn.MESSAGE, []],
		[MatchOn.TOKEN, []],
	]);

	/**
	 * @deprecated might not require
	 * 
	 * lists all command names available
	 * 
	 * @returns string[] list of command names
	 */
	/*
	static listCommandNames = (): string[] => {
		const names: any[] = [];
		Commands.commands.forEach((_: any, cmd: any) => { //
			names.push(cmd);
		});
		return names;
	}*/

	/**
	 * runs directly after declaration
	 */
	private static _initialize = Promise.resolve(1).then(async () => {



		// load commands from file
		let commandList: Map<any, any> = new Map();
		await fs.readdirSync('./src/commands/').forEach(async (command: string) => {
			const [commandName, ts] = command.split(".");
			if ( // knockout junk files
				ts !== "ts" // not typescript
				|| !commandName.endsWith("Command") // not a command
			) return;

			// import code
			const commandClass: Command = new (await import(`./${commandName}`)).default();
			console.debug("new command:", commandClass);
			console.debug("match string:", commandClass.expression);

			// push regex match on to correct queue
			Commands.matchOn.get(commandClass.matchOn).push(`(?<${commandName}>` + commandClass.expression + `)`);

			// add command to command map
			commandList.set(commandName, commandClass);
		});

		// assign static variables at runtime
		Commands.commandMap = commandList;

		return;

	}).then(() => {

		// for each command
		// take the regex string and append to either messageRegex or tokenRegex with named groups
		const newMatch = new Map();
		Commands.matchOn.forEach((val: string[], key) => {
			//console.log("MATCHon", key, val.join("|"));
			newMatch.set(key, new RegExp(val.join("|"), "gm"));
		});

		Commands.matchOn = newMatch;
		// compile regexes
		return;
	});

}
