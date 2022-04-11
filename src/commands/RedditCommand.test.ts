/* eslint-disable @typescript-eslint/no-var-requires */
require('./index.mock').default;

const dummyMessage = require('discord.js').Message;
import RedditCommand from './RedditCommand';

describe('RedditCommand', () => {
	const command = new RedditCommand();
	jest.mock('discord.js');

	describe.each([
		['/r/wallstreetbets', 'https://www.reddit.com/r/wallstreetbets'],
		['r/wallstreetbets', 'https://www.reddit.com/r/wallstreetbets'],
	])("when input is '%s'", (input, output) => {
		it(`output should be ${output}`, async () => {
			const res = await command.execute(dummyMessage, input);
			expect(res).toEqual(output);
		});
	});
});
