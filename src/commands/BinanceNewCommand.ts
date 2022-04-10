import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';
import { HelpPage } from '../types/Help';

export default class BinanceNewCommand extends Command {
	private db: Database | undefined;
	public constructor(db?: Database | undefined) {
		super();
		if (db) this.db = db;
	}

	public helpPage: HelpPage = {
		command: 'binance',
		message: [
			{
				title: '`!binance`, `!b` (inline)',
				body: 'Shows the latest cryptocurrency listing news from [Binance](https://www.binance.com/en/support/announcement/c-48)',
			},
		],
	};

	public expression = `(!b(inance)?)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	public execute = async (
		_message: Message | TextChannel,
		_input: unknown
	) => {
		let embed;

		// coin exists
		try {
			await Promise.resolve();
			let response;
			//let data: APIResponses.BinanceNewCryptocurrency.Catalog;
			const cacheName = 'binance-new';

			if (this.db) {
				response = await this.db.get(cacheName);
				console.log('cache hit:');
				console.debug(response);
			}

			if (response == false) {
				console.log('fetching new result...');
				response = await axios.get(
					'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=5'
				);
				console.debug('new data:', response);
				response.request = undefined;
				if (this.db) await this.db.set(cacheName, response, 600);
				console.log('cache updated');
			}
			//console.log(response);
			const data: APIResponse.BinanceNewCryptocurrency.Data.Catalog =
				response.data.data.catalogs[0];
			const { data: data_1 } = await { data };
			//console.log(data.error);
			console.log('setting up response');
			const result = data_1.articles;
			const title = 'Latest Binance Cryptocurrency Listing News';
			const footer = 'Binance  •  New Cryptocurrency Listing';

			embed = new MessageEmbed()
				.setColor('#FCD535')
				.setTitle('🚀  ' + title)
				.setThumbnail(data_1.icon || 'https://i.imgur.com/AfFp7pu.png')
				//.setTimestamp()
				.setFooter({ text: footer });

			result?.forEach((article) => {
				const date = new Date(article.releaseDate);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const dt = date.getDate().toString().padStart(2, '0');
				// build title string
				const timestamp = `${year}-${month}-${dt}`;

				const text_1 = article.title;
				const link = article.code;
				// build body string
				const body = `[${text_1}](https://www.binance.com/en/support/announcement/${link})`;

				embed.addField(timestamp, body);
			});

			console.log('embed set');
			console.debug(embed);

			//console.log("finance return", embed);
			if (embed == null)
				throw new Error(
					'BinanceNewCommand: embed is undefined or null'
				);
			return { embeds: [embed] };
		} catch (e) {
			console.error(e);
			return null;
		}
	};
}
