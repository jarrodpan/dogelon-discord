/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('./', () => {
	return {
		Command: jest.fn().mockImplementation(() => {
			return {
				init: () => null,
			};
		}),
		MatchOn: jest.fn().mockImplementation(() => {
			return {
				TOKEN: 0,
				MESSAGE: 1,
			};
		}),
	};
});
const dummyMessage = require('discord.js').Message;
import LigmaCommand from './LigmaCommand';

describe('LigmaCommand', () => {
	const ligma = new LigmaCommand();
	jest.mock('discord.js');

	it.each(['whats ligma', 'who cares'])(
		'when input is %s output should be "ligma balls"',
		async (input) => {
			const res = await ligma.execute(dummyMessage, input);
			expect(res).toEqual('ligma balls');
		}
	);
});
