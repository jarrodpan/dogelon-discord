import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';
import { APIResponses } from '../types/APIResponses/BinanceNewCryptocurrency';

export default class BinanceNewCommand extends Command {
	private db: Database | undefined;
	public constructor(db?: Database | undefined) {
		super();
		if (db) this.db = db;
	}

	public expression = `(!b(inance)?)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	public execute = (message: Message | TextChannel, input: any) => {
		let embed;

		// coin exists
		return Promise.resolve()
			.then(async () => {
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
				//console.log(response);
				const typedData: APIResponses.BinanceNewCryptocurrency =
					response.data;
				const data: APIResponses.BinanceNewCryptocurrency.Data.Catalog =
					typedData.data.catalogs[0];

				return { response, data };
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			})
			.then(({ response, data }) => {
				//console.log(data.error);

				console.log('setting up response');
				const result = data.articles;
				const title = 'Latest Binance Cryptocurrency Listing News';
				const footer = 'Binance  •  New Cryptocurrency Listing';

				embed = new MessageEmbed()
					.setColor('#FCD535')
					.setTitle('🚀  ' + title)
					.setThumbnail(
						data.icon || 'https://i.imgur.com/AfFp7pu.png'
					)
					//.setTimestamp()
					.setFooter({ text: footer });

				result?.forEach((article) => {
					const date = new Date(article.releaseDate);
					const year = date.getFullYear();
					const month = date.getMonth();
					const dt = date.getDate();
					// build title string
					const timestamp = `${year}-${month}-${dt}`;

					const text = article.title;
					const link = article.code;
					// build body string
					const body = `[${text}](https://www.binance.com/en/support/announcement/${link})`;

					embed.addField(timestamp, body);
				});

				console.log('embed set');
				console.debug(embed);

				//console.log("finance return", embed);
				if (embed == null)
					throw new Error(
						'BinanceNewCommand: embed is undefined or null'
					);
				//if (typeof embed != null || typeof embed !== undefined) {
				return { embeds: [embed] };
				//}
			})
			.catch((e) => {
				console.error(e);
				return null;
			});
	};
}
