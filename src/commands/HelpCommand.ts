import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';
import { HelpPage, HelpField } from '../types/Help';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('./../../package.json');
/**
 * shows command list
 */
export default class HelpCommand extends Command {
	private db: Database | undefined;
	public constructor(db?: Database | undefined) {
		super();
		if (db) this.db = db;
	}

	public expression = '!h(elp)?.*';
	public matchOn = MatchOn.MESSAGE;

	private helpPages = new Map<string, HelpField[]>();
	private defaultPage = '';

	public loadOptions = (pages: HelpPage[]) => {
		const sorted = pages.sort((a, b) => a.command.localeCompare(b.command));

		sorted.forEach((page) => {
			this.helpPages.set(page.command, page.message);
			this.defaultPage += '- `' + page.command + '`\n';
		});
	};

	public execute = (_message: Message | TextChannel, input: string) => {
		const v = `v${pkg.version}`;
		//const a = '<@944798462053089300>';
		const embed = new MessageEmbed()
			.setColor('#9B59B6')
			.setTitle(`🚀  Dogelon`)
			.setThumbnail('https://i.imgur.com/2vHF2jl.jpg')
			.setFooter({
				text: `Dogelon ${v}`,
				iconURL:
					'https://cdn.discordapp.com/app-icons/945669693576994877/c11dde4d4f016ffcc820418864efd9f4.png?size=64',
			});

		const [_, option, ...__] = input.split(' ');
		console.log(option);

		if (option && this.helpPages.has(option)) {
			const page = this.helpPages.get(option) as HelpField[];
			page.forEach((field) => {
				embed.addField(field.title, field.body);
			});
			//embed.setDescription(`Help page for \`${option}\``);
			embed.setTitle('🚀  Dogelon - Help page for `' + option + '`');
		} else
			embed.setDescription(
				'The not-so-stupid discord bot made for no reason. Written in Node.js and TypeScript.\n\nAvailable options for `!help {option}`:\n\n' +
					this.defaultPage
			);

		//.setTimestamp()
		return { embeds: [embed] };
	};
}
