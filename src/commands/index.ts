import { Command } from "../types/Command";

export default class Commands {

	/**
	 * must run directly after declaration
	 */
	static initialize() {

		{ // load commands from file
			const commandList: any[] = [];
			require('fs').readdirSync('./src/commands/').forEach((command: string) => {
				const [commandName, ts] = command.split(".");
				if (
					ts !== "ts"								// not typescript
					|| commandName == "index"				// index file
					|| !commandName.endsWith("Command")		// not a command
				) return;

				commandList.push(require("./" + commandName).default);
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
	 * all the command classes
	 */
	static commands: any[];

	/**
	 * @deprecated - might not require
	 * lists all command names available
	 * 
	 * @returns string[] list of command names
	 */
	static listCommandNames = (): string[] => {
		const names: any[] = [];
		Commands.commands.forEach((cmd: any) => { //
			names.push(cmd.name);
		});
		return names;
	}
}
Commands.initialize();