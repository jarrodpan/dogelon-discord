import { Message, TextChannel } from 'discord.js';

enum MatchOn {
	TOKEN,
	MESSAGE,
}

class DummyTokenCommand extends Command {
	constructor() {
		super();
	}
}
class DummyMessageCommand extends Command {
	constructor() {
		super();
	}
}
class Command {
	constructor() {
		return;
	}
	public init = () => {
		return;
	};
	public execute!: (
		message: Message | TextChannel,
		input: any
	) => Promise<any> | any;

	public static matchOn = new Map([
		[MatchOn.TOKEN, /^(?<DummyTokenCommand>[$%](\S*))$/gm],
		[MatchOn.MESSAGE, /^(?<DummyMessageCommand>!(\S*))$/gm],
	]);

	static commandMap: Map<any, any> = new Map([
		['DummyTokenCommand', new DummyTokenCommand()],
		['DummyMessageCommand', new DummyMessageCommand()],
	]);

	public static getExecuteFromCommandName = (command: string) =>
		Command.commandMap.get(command).execute;
}

export { Command, MatchOn, DummyMessageCommand, DummyTokenCommand };
