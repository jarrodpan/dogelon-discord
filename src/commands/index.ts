import { Command } from "../types/Command";

export default class Commands {

	/**
	 * all the command classes
	 */
	static commands: Map<any, any>;

	/**
	 * must run directly after declaration
	 */
	static initialize() {
		'load all commands from file'
		{ // load commands from file
			let commandList: Map<any, any> = new Map();
			require('fs').readdirSync('./src/commands/').forEach((command: string) => {
				const [commandName, ts] = command.split(".");
				if (
					ts !== "ts"								// not typescript
					|| commandName == "index"				// index file
					|| !commandName.endsWith("Command")		// not a command
				) return;

				commandList.set(commandName, require("./" + commandName).default);
				//console.log(commandName, "loaded");
			});
			Commands.commands = commandList;
		}

		// TODO: compile regexes here
		{
			// for each command
			// take the regex string and append to either messageRegex or tokenRegex with named groups

			// compile regexes
		}
	}

	/**
	 * @deprecated might not require
	 * 
	 * lists all command names available
	 * 
	 * @returns string[] list of command names
	 */
	static listCommandNames = (): string[] => {
		const names: any[] = [];
		Commands.commands.forEach((_: any, cmd: any) => { //
			names.push(cmd);
		});
		return names;
	}
}
Commands.initialize();