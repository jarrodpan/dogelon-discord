import { Command, MatchOn } from "../types/Command";

export default class Commands {

	/**
	 * all the command classes
	 */
	static commands: Map<any, any>;

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
	private static _initialize = (() => {

		// load commands from file
		let commandList: Map<any, any> = new Map();
		require('fs').readdirSync('./src/commands/').forEach(async (command: string) => {
			const [commandName, ts] = command.split(".");
			if (
				ts !== "ts"								// not typescript
				|| commandName == "index"				// index file
				|| !commandName.endsWith("Command")		// not a command
			) return;

			/*
			let commandClass: Command;
			import('./' + commandName).then((module: Command) => {
				console.log("new module", module);
				commandClass = module;
				console.log(module.expression);
				commandList.set(commandName, commandClass);
			});*/
			console.log(commandName);
			const commandClass = await (async () => {
				const commandCode = await import(`./${commandName}`);
				let commandClass = Object.assign(commandCode);
				console.log(commandName, commandClass, commandClass.expression);
				return commandClass;
			})();

			//commandClass = command;
			console.log(commandClass);


			//console.debug(commandClass);
			//console.debug(Commands.matchOn.get(commandClass.matchOn));
			//Commands.matchOn.get(commandClass.matchOn).push(commandClass.expression);

			//commandClass.expression

			commandList.set(commandName, commandClass);
			//console.log(commandName, "loaded");
		});
		Commands.commands = commandList;
		console.log("commands:", Commands.commands);

		// TODO: compile regexes here

		// for each command
		// take the regex string and append to either messageRegex or tokenRegex with named groups

		// compile regexes

	})();

}
