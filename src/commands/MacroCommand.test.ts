/* eslint-disable @typescript-eslint/no-var-requires */

//console.debug = (...any) => null; // TODO: this is a hack for test development

import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Dogelon } from '../dogelon';
import MockDatabase from '../resolvers/__mocks__/MockDatabase';
import MacroCommand from './MacroCommand';

//jest.mock('discord.js');
jest.mock('./');
jest.mock('../dogelon');
//jest.mock('../dogelon/Queue');
const db = new MockDatabase();
const dbGetSpy = jest.spyOn(db, 'get');
const dbSetSpy = jest.spyOn(db, 'set');

const mockMessage: Message = require('discord.js').Message as Message;
mockMessage.channelId = '123456789';

const mockChannel: TextChannel = require('discord.js')
	.TextChannel as TextChannel;
//mockChannel.id

describe('MacroCommand', () => {
	afterEach(() => {
		//jest.resetAllMocks();
	});

	const macro = new MacroCommand(db);

	describe('when macro is not defined', () => {
		it.each([
			['empty string', ''],
			['undefined macro', '&nope'],
			['empty macro', '&'],
		])("should return null on %s '%s'", async (desc, input) => {
			const res = await macro.execute(mockMessage, input);
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
				'&nope=>$tsla=>fff',
				'&nope=>dssdds=>!changes',
				'&nope====>dssdds=>!changes',
				'&nope=>>>$eth=>!changes',
			])(
				"should return null on invalid definition '%s'",
				async (input) => {
					const res = await macro.execute(mockMessage, input);
					expect(res).toBeNull();
				}
			);
		});

		describe('when definition is valid', () => {
			it.each([
				'&yes=>!one',
				'&valid=>!one=>$two',
				'&chain=>!one=>$two=>%three=>!four=>$five',
				'&ethereum=>%eth=>',
				'&tesla=>=>$tsla',
			])(
				"should return confirmation embed on valid definition '%s'",
				async (input) => {
					const res = await macro.execute(mockMessage, input);
					const embed = res?.embeds[0] as MessageEmbed;
					expect(embed instanceof MessageEmbed).toBe(true);
					expect(embed.description).toContain(mockMessage.channelId);
					const macroName = input.slice(1).split('=>')[0];
					expect(embed.description).toContain(macroName);
				}
			);
		});
	});

	describe('when macro is defined', () => {
		it.each([
			['&yes', 1],
			['&valid', 2],
			['&chain', 5],
			['&etherum', 1],
			['&tesla', 1],
		])(
			"should call queueing callback on defined macro '%s' %i times",
			async (cmd, count) => {
				const res = await macro.execute(mockMessage, cmd);
				expect(Dogelon.Queue.push).toBeCalledTimes(count);
			}
		);
	});
});
