import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import { Dogelon } from '../dogelon';
import Database from '../types/Database';
import { HelpPage } from '../types/Help';

type MacroPreferences = {
	[channelId: string]: ChannelMacros;
};

type ChannelMacros = {
	[macro: string]: string[];
};

type MacroDefinition = {
	valid: boolean;
	definitions?: ValidMacroCommand[];
};

type ValidMacroCommand = [string, string];

/**
 * Command to register macros with the bot.
 */
export default class MacroCommand extends Command {
	private db: Database;
	public constructor(db: Database) {
		super();
		this.db = db;
	}

	private cacheName = 'macro-preferences';

	// TODO: write help
	public helpPage: HelpPage = {
		command: 'macro',
		message: [
			{
				title: '`&{macro name}` (inline)',
				body: 'Run a macro defined in this channel.',
			},
			{
				title: '`&{macro name}=>{dogelon command}(=>...)` (inline)',
				body: 'Define a macro to be run when called in this channel.\nValid commands are listed in `!help` pages, no whitespace allowed.\nExample definitions: `&hello=>!news`, `&dogelon=>$tsla=>%doge`',
			},
		],
	};

	public expression = '&(\\S*)';
	public matchOn = MatchOn.TOKEN;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = async (message: Message | TextChannel, input: string) => {
		// flags
		let setDefinition;
		const channelId = (message as Message).channelId;

		// parse command
		// knockout if non command gets passed in for some reason
		if (input.slice(0, 1) !== '&') return null;
		// split any trailling spaced off stuff, split by equals sign
		const splitInput = input.split(' ')[0].slice(1).split('=>');
		const [macro, ..._] = splitInput;
		let [, ...definition] = splitInput;

		if (!macro || macro.trim().length == 0) return null;

		if (!definition || definition.length == 0) setDefinition = false;
		else setDefinition = true;

		console.debug(macro, setDefinition, definition);

		if (setDefinition) {
			// TODO: validate all commands are valid
			// remove any whitespace or empty commands
			definition = definition.filter((val) => val.trim() !== '');
			if (definition.length == 0) return null;

			const validDef = this.validateDefinition(definition);
			if (!validDef.valid) return null;

			console.log(validDef);
			// all commands are valid

			const macroSaved = await this.setChannelMacro(
				channelId,
				macro,
				definition
			);

			console.log(macroSaved == 1 && `macro &${macro} saved`);

			if (macroSaved) {
				const macroList = (await this.getChannelMacros(
					channelId
				)) as ChannelMacros;
				console.log(macroList);
			}

			const embed = new MessageEmbed()
				.setTitle('Macro set')
				.setDescription(
					'Macro `&' + macro + '` set on <#' + channelId + '>'
				);

			console.debug(embed);

			return { embeds: [embed] };
		} else {
			// check macro exists
			const definition = await this.getChannelMacro(channelId, macro);
			if (!definition) return null;

			//console.log(definition);

			const { valid, definitions } = this.validateDefinition(definition);
			if (!valid || !definitions) return null; // this should never happen

			console.debug(definitions);

			for (const [token, command] of definitions) {
				Dogelon.Queue.push(
					message,
					token,
					Command.getExecuteFromCommandName(command)
				);
			}
			return null;
		}

		return null;
	};

	private validateDefinition = (definition: string[]): MacroDefinition => {
		const validDef: ValidMacroCommand[] = [];
		let invalid;
		definition.some((cmd) => {
			let tokenMatchCommands, messageMatchCommands;
			try {
				const matchOnToken: any = Command.matchOn
					.get(MatchOn.TOKEN)
					.exec(cmd).groups;
				tokenMatchCommands = Object.entries(matchOnToken).filter(
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					([_s, matchString]) => {
						return matchString != undefined;
					}
				);
				Command.matchOn.get(MatchOn.TOKEN).lastIndex = 0;
			} catch (e) {
				tokenMatchCommands = null;
			}

			try {
				//for (const cat in [MatchOn.MESSAGE, MatchOn.TOKEN]) {
				const matchOnMessage: any = Command.matchOn
					.get(MatchOn.MESSAGE)
					.exec(cmd).groups;
				messageMatchCommands = Object.entries(matchOnMessage).filter(
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					([_s, matchString]) => {
						return matchString != undefined;
					}
				);
				Command.matchOn.get(MatchOn.MESSAGE).lastIndex = 0;
			} catch (e) {
				messageMatchCommands = null;
			}

			//console.log(tokenMatchCommands);
			//console.log(messageMatchCommands);
			const commandMatches: string | null =
				(tokenMatchCommands &&
					tokenMatchCommands[0] &&
					tokenMatchCommands[0][0]) ??
				(messageMatchCommands &&
					messageMatchCommands[0] &&
					messageMatchCommands[0][0]) ??
				null;

			if (!commandMatches || commandMatches.length == 0) {
				console.error(cmd, 'does not match any commands');
				invalid = { valid: false };
				return false;
			}

			console.log(cmd, 'matches', commandMatches);

			validDef.push([cmd, commandMatches]);
		});
		return (
			invalid ?? {
				valid: true,
				definitions: validDef,
			}
		);
	};

	private getMacros = async (): Promise<MacroPreferences | false> => {
		return await this.db.get(this.cacheName);
	};
	private setMacros = async (data: any): Promise<1 | false> => {
		return await this.db.set(this.cacheName, data, Database.NEVER_EXPIRE);
	};

	private getChannelMacros = async (
		channelId: string
	): Promise<ChannelMacros | false> => {
		const macros = await this.getMacros();

		if (macros != false && Object.keys(macros).includes(channelId))
			return macros[channelId];
		return false;
	};

	private getChannelMacro = async (
		channelId: string,
		macro: string
	): Promise<string[] | false> => {
		const macros = await this.getChannelMacros(channelId);

		if (macros != false && Object.keys(macros)?.includes(macro))
			return macros[macro];
		return false;
	};

	private setChannelMacro = async (
		channelId: string,
		macro: string,
		definition: string[]
	): Promise<1 | false> => {
		let macros = await this.getMacros();

		if (macros == false) macros = {} as MacroPreferences;

		const channel = Object.keys(macros)?.includes(channelId)
			? macros[channelId]
			: ({} as ChannelMacros);

		channel[macro] = definition;
		macros[channelId] = channel;

		return await this.setMacros(macros);
	};
}
