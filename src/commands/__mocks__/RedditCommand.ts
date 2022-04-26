import { CallbackChannelInput, Command } from '../';

jest.mock('../');

export default class RedditCommand extends Command {
	constructor() {
		super();
	}

	public execute = (
		_message: CallbackChannelInput,
		_input: any
	): Promise<any> | any => jest.fn();
}
