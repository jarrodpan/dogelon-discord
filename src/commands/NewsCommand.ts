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
	public execute = (_message: Message | TextChannel, _input: unknown) => {
		let embed;

		// coin exists
		return Promise.resolve()
			.then(async () => {
				let response;
				const cacheName = 'abc-news';

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
				const data: APIResponse.ABCTopStories.Edition.EditionItem[] =
					response.data.editions[0].items;

				return { data };
			})
			.then(({ data }) => {
				//console.log(data.error);

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

				for (let i = 0; i < 8; i++) {
					const article = result[i];
					const live = article.contentLabelPrepared?.labelText
						? 'Live: '
						: '';
					const title = live + article.cardHeadingPrepared.children;
					const text = article.synopsis;
					const link =
						'https://www.abc.com.au' + article.cardLinkPrepared.to;
					// build body string
					const body = `${text}\n — [Read More](${link})`;

					embed.addField(title, body);
				}

				console.log('embed set');
				console.debug(embed);

				//console.log("finance return", embed);
				if (embed == null)
					throw new Error('NewsCommand: embed is undefined or null');
				//if (typeof embed != null || typeof embed !== undefined) {
				return { embeds: [embed] };
				//}
			})
			.catch((e) => {
				console.error(e);
				embed = null;
				return null;
			});
	};
}
