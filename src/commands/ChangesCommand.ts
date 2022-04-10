import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';
import { HelpPage } from '../types/Help';

/**
 * shows command list
 */
export default class ChangesCommand extends Command {
	private db: Database;
	public constructor(db: Database) {
		super();
		this.db = db;
	}

	public helpPage: HelpPage = {
		command: 'changes',
		message: [
			{
				title: '`!changes`, `!c`',
				body: 'Displays latest changelog entry',
			},
		],
	};

	public version;

	public expression = '(!c(hange(s)?)?(:S*)?)';
	public matchOn = MatchOn.MESSAGE;

	private changesEmbed?: MessageEmbed;

	public init = async () => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const readme: string = require('fs')
			.readFileSync('./README.md')
			.toString();
		const latestChange = readme
			.match(/# Changelog[\S\s]*?(?:###[\S\s]*?){1,3}## /)
			?.toString()
			.replace(/\r/gm, '')
			.split(/\n/gm); // chaotic regex to extract the latest change in the changelog

		let title;
		const changed = {
			Added: new Array<string>(),
			Changed: new Array<string>(),
			Removed: new Array<string>(),
		} as object;
		let state: 'Added' | 'Changed' | 'Removed';

		let v;

		// extract all the junk
		latestChange?.forEach((line) => {
			if (line == '# Changelog' || line.length == 0) return;
			if (line.startsWith('## ') && line.length > 3)
				(title = line.slice(3).replace('[', 'v').replace(']', '')) &&
					(v = line.slice(line.indexOf('[') + 1, line.indexOf(']')));
			if (line.startsWith('### Added')) state = 'Added';
			if (line.startsWith('### Changed')) state = 'Changed';
			if (line.startsWith('### Removed')) state = 'Removed';

			if (line.substring(0, 5).includes('-')) changed[state].push(line);
		});

		// check for first run variable in Commands class db assuming Commands has been loaded
		// this is terrible code and should be refactored to elevate db to main so we dont get surprises
		const dbKey = 'firstRun';

		const oldRun = await this.db.get(dbKey);

		const oldVer = oldRun ? oldRun.version : v;

		const newRunDetails = {
			deployTime: Database.unixTime(),
			version: v,
			prevVersion: oldVer,
		};

		await Command.db?.set(dbKey, newRunDetails, Database.NEVER_EXPIRE);

		const quoteObj = (
			await axios.get('http://quotes.stormconsultancy.co.uk/random.json')
		).data;
		const quote = quoteObj.quote;
		const auth = quoteObj.author;
		const qLink = quoteObj.permalink;
		const motd = `${quote} \n— [${auth}](${qLink})`;

		//const a =	'[phantomagic](https://discordapp.com/users/944798462053089300/)';
		const embed = new MessageEmbed()
			.setColor('#9B59B6')
			.setTitle(`🚀  Dogelon Update - ` + title)
			.addField('Message of the Day', motd)
			.setThumbnail('https://i.imgur.com/1LIQGWa.png')
			//.setTimestamp()
			.setFooter({
				text: `Dogelon v${v}`,
				iconURL:
					'https://cdn.discordapp.com/app-icons/945669693576994877/c11dde4d4f016ffcc820418864efd9f4.png?size=64',
			});
		//console.log(changed);

		for (const [k, v] of Object.entries(changed)) {
			if (v.length > 0) embed.addField(k, v.join('\n'));
		}

		this.changesEmbed = embed;
		this.version = v;
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (message: Message | TextChannel, _: unknown) => {
		return { embeds: [this.changesEmbed] };
	};
}
