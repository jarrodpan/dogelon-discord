import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';

export default class NewsCommand extends Command {
	private db: Database;
	public constructor(db: Database) {
		super();
		this.db = db;
	}

	public expression = `(!n(ews)?)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (_message: Message | TextChannel, _input: any) => {
		let embed;

		// coin exists
		return Promise.resolve()
			.then(async () => {
				let response;
				let data;
				let error = false;
				const cacheName = 'abc-news';

				try {
					response = await this.db.get(cacheName);
					console.log('cache hit:', response ? true : false);

					if (response == false) {
						console.log('fetching new result...');
						response = await axios.get(
							'https://www.abc.net.au/news-web/api/loader/newshometopstories?edition=vic'
						);
						console.debug('new data:', response);
						response.request = undefined;
						if (response.data !== undefined)
							await this.db.set(
								cacheName,
								response,
								Database.ONE_HOUR
							);
						console.log('cache updated');
					}
					//console.log(response);
					//console.log(response);
					data = response.data.editions[0].items;
				} catch (e) {
					data = undefined;
					error = true;
					console.error('news error');
				}
				return [response, data, error];
			})
			.then(([_response, data, error]) => {
				//console.log(data.error);
				if (!error) {
					console.log('setting up response');
					const result = data;
					const title = 'Latest Top Stories (Victoria) - ABC News';
					const footer = 'ABC News  •  Top Stories';

					embed = new MessageEmbed()
						.setColor('#FCD535')
						.setTitle('🚀  ' + title)
						.setThumbnail(
							result[0].cardImagePrepared.imgSrc ||
								'https://i.imgur.com/AfFp7pu.png'
						)
						//.setTimestamp()
						.setFooter({ text: footer });

					result.forEach((article) => {
						const title = article.cardHeadingPrepared.children;
						const text = article.synopsis;
						const link =
							'https://www.abc.com.au' +
							article.cardLinkPrepared.to;
						// build body string
						const body = `[${text}](${link})`;

						embed.addField(title, body);
					});

					console.log('embed set');
					console.debug(embed);
				} else {
					console.error('news: response error');
					return null;
				}
				//console.log("finance return", embed);
				if (embed == null)
					throw new Error('NewsCommand: embed is undefined or null');
				//if (typeof embed != null || typeof embed !== undefined) {
				return { embeds: [embed] };
				//}
			})
			.catch((_) => {
				console.error(_);
				embed = null;
				return null;
			});
	};
}
