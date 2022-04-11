/* eslint-disable @typescript-eslint/no-var-requires */
require('./index.mock').default;

const dummyMessage = require('discord.js').Message;
const dummyTextChannel = require('discord.js').TextChannel;
import MacroCommand from './MacroCommand';
jest.mock('discord.js');

describe('MacroCommand', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	const macro = new MacroCommand();

	describe('when macro is not defined', () => {
		it.each([
			['empty string', ''],
			['undefined macro', '&nope'],
		])('should return null on %s', async (desc, input) => {
			const res = await macro.execute(dummyMessage, input);
			expect(res).toBeNull();
		});
	});

	describe('when macro definition is set', () => {
		it('should return null on invalid definition', async () => {
			const res = await macro.execute(dummyMessage, '&nope=>ff=>fff');
			expect(res).toBeNull();
		});
		it.todo('should return confirmation embed on valid definition');
		it.todo('should call parsing callback on defined macro');
	});
});
