/* eslint-disable @typescript-eslint/no-var-requires */
//require('./index.mock').default;
// TODO: fix the mock with dummy matches

console.debug = (...any) => null; // TODO: this is a hack for test development

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
		it.each([
			'&nope=>',
			'&nope=>=>',
			'&nope=> ',
			'&nope=> =>    ',
			'&nope=>whats ligma=>fff',
		])("should return null on invalid definition '%s'", async (input) => {
			const res = await macro.execute(dummyMessage, input);
			expect(res).toBeNull();
		});
		it.todo('should return confirmation embed on valid definition');
		it.todo('should call parsing callback on defined macro');
	});
});
