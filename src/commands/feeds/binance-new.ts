import axios from 'axios';
import { MessageEmbed, TextChannel } from 'discord.js';
import { DiscordMessageOptions } from '..';
import { Dogelon } from '../../dogelon';
import Database from '../../types/Database';
import { Feed } from '../../types/Feed';
import { Subscribers } from '../SubscribeCommand';

export default class binanceNew implements Feed {
	private db: Database;
	public readonly feedName: string = 'binance-new';
	public readonly updateTime: number = 600000;

	constructor(db: Database) {
		this.db = db;
		this.feedName = 'binance-new';
		console.log(this.feedName, 'constructed');
	}

	public updateFeed = (): Promise<DiscordMessageOptions> => {
		// binance-new
		// TODO: generalise
		console.log('calling', this.feedName);
		const cacheName = 'subscribe-' + this.feedName;
		let data;

		return Promise.resolve()
			.then(async () => {
				const response = await axios.get(
					'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=5'
				);
				//const response = await axios.get("http://localhost:3000");
				data = response.data.data.catalogs[0];
			})
			.then(async () => {
				console.log('Subscriber: polling for changes on ' + cacheName);

				const subscribers = (await this.db.get(
					cacheName
				)) as Subscribers;
				return subscribers;
			})
			.then((subscribers) => {
				data.articles.forEach((article) => {
					if (article.releaseDate > subscribers.lastUpdate)
						console.log(
							article.releaseDate,
							subscribers.lastUpdate,
							article.releaseDate > subscribers.lastUpdate
						);
					if (article.releaseDate < subscribers.lastUpdate) return;

					const date = new Date(article.releaseDate);
					const year = date.getUTCFullYear();
					const month = (date.getUTCMonth() + 1)
						.toString()
						.padStart(2, '0');
					const dt = date.getUTCDate().toString().padStart(2, '0');

					const hr = date.getUTCHours().toString().padStart(2, '0');
					const mi = date.getUTCMinutes().toString().padStart(2, '0');
					const se = date.getUTCSeconds().toString().padStart(2, '0');
					const tz = 'UTC';
					// build title string
					const timestamp = `${year}-${month}-${dt} ${hr}:${mi}:${se} ${tz}`;

					const text = article.title;
					const link = article.code;

					subscribers.channels.forEach((subscriberId) => {
						Dogelon.Queue.push(
							Dogelon.Queue.client.channels.cache.get(
								subscriberId
							) as TextChannel,
							'',
							(_msg, _input) => {
								const embed = new MessageEmbed()
									.setColor('#9B59B6')

									.setTitle(
										'📰  New Binance Cryptocurrency Listing News'
									)

									.setThumbnail(
										data.icon ||
											'https://i.imgur.com/2vHF2jl.jpg'
									)
									.addField(
										timestamp,
										`[${text}](https://www.binance.com/en/support/announcement/${link})`
									)
									//.setTimestamp()
									.setFooter({
										text: 'Dogelon  •  Subscription Service',
									});
								return { embeds: [embed] };
							}
						);
					});
				});
				return subscribers;
			})
			.then(async (subscribers) => {
				// change last updated time
				subscribers.lastUpdate = new Date().getTime();
				await this.db.set(
					cacheName,
					subscribers,
					Database.NEVER_EXPIRE
				);
				return;
			})
			.catch((e) => {
				console.error(e);
				return null;
			});

		// TODO: move to subscribecommand interval set on init
		/*if (subscribers.channels.length == 0) {
			// remove empty list from DB and stop polling
			await this.db.set(cacheName, {}, Database.EXPIRE);
			clearInterval(this.intervalMap.get(cacheName) as NodeJS.Timer);
			this.intervalMap.delete(cacheName);
			return;
		}*/
	};
}
