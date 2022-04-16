import { Message, TextChannel } from 'discord.js';
import LigmaCommand from './LigmaCommand';
import RedditCommand from './RedditCommand';

jest.mock('../RedditCommand');
jest.mock('../LigmaCommand');

enum MatchOn {
	TOKEN,
	MESSAGE,
}

abstract class Command {
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

	public static matchOn = new Map();
	/* = new Map([
		[MatchOn.TOKEN, /^(?<RedditCommand>[$%](\S*))$/gm],
		[MatchOn.MESSAGE, /^(?<LigmaCommand>!(\S*))$/gm],
	]);*/

	static commandMap = new Map();
	/*: Map<any, any> = new Map([
		['RedditCommand', new RedditCommand()],
		['LigmaCommand', new LigmaCommand()],
	]);*/

	public static getExecuteFromCommandName = (command: string) =>
		Command.commandMap.get(command).execute;

	private static _initialise = Promise.resolve().then(() => {
		Command.matchOn.set(MatchOn.TOKEN, /^(?<RedditCommand>[$%](\S*))$/gm);
		Command.commandMap.set('RedditCommand', new RedditCommand());
		Command.matchOn.set(MatchOn.MESSAGE, /^(?<LigmaCommand>[!](\S*))$/gm);
		Command.commandMap.set('LigmaCommand', new LigmaCommand());
	});
}

export { Command, MatchOn };
