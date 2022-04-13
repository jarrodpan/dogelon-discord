/* eslint-disable @typescript-eslint/no-var-requires */

//console.debug = (...any) => null; // TODO: this is a hack for test development

import { Message, MessageEmbed, TextChannel } from 'discord.js';
import MockDatabase from '../resolvers/__mocks__/MockDatabase';
import MacroCommand from './MacroCommand';

//jest.mock('discord.js');
jest.mock('./');

const dummyMessage: Message = require('discord.js').Message as Message;
dummyMessage.channelId = '123456789';

describe('MacroCommand', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	const macro = new MacroCommand(new MockDatabase());

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
					const embed = res!.embeds[0];
					expect(embed instanceof MessageEmbed).toBe(true);
					expect(embed.description).toContain(dummyMessage.channelId);
					const macroName = input.slice(1).split('=>')[0];
					expect(embed.description).toContain(macroName);
					//dummyMessage.reply())
				}
			);
		});
	});

	describe('when macro is defined', () => {
		it.todo('should call parsing callback on defined macro');
	});
});
