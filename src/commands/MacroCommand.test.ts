/* eslint-disable @typescript-eslint/no-var-requires */

console.debug = (...any) => null; // TODO: this is a hack for test development

const dummyMessage = require('discord.js').Message;
const dummyTextChannel = require('discord.js').TextChannel;
import MacroCommand from './MacroCommand';

jest.mock('discord.js');
jest.mock('./');

describe('MacroCommand', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	const macro = new MacroCommand();

	describe('when macro is not defined', () => {
		it.each([
			['empty string', ''],
			['undefined macro', '&nope'],
			['empty macro', '&'],
		])("should return null on %s '%s'", async (desc, input) => {
			const res = await macro.execute(dummyMessage, input);
			expect(res).toBeNull();
		});
	});

	describe('when macro definition is set', () => {
		describe('when definition is invalid', () => {
			it.each([
				'&nope=>',
				'&nope=>=>',
				'&nope=> ',
				'&nope=> =>    ',
				'&nope=>whatsligma=>fff',
			])(
				"should return null on invalid definition '%s'",
				async (input) => {
					const res = await macro.execute(dummyMessage, input);
					expect(res).toBeNull();
				}
			);
		});

		describe('when definition is valid', () => {
			it.each([
				'&yes=>!one',
				'&valid=>!one=>$two',
				'&chain=>!one=>$two=>%three=>!four=>$five',
			])(
				"should return confirmation embed on valid definition '%s'",
				async (input) => {
					const res = await macro.execute(dummyMessage, input);
					expect(res).toEqual(1); // TODO: fix
				}
			);
		});
	});

	describe('when macro is defined', () => {
		it.todo('should call parsing callback on defined macro');
	});
});
