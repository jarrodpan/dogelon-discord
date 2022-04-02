import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../commands/';
import Database from '../types/Database';
import { client, queue } from '../app';
import Action from '../types/Action';
import * as fs from 'fs';
import { Feed } from '../types/Feed';

export interface Subscribers {
	lastUpdate: number;
	channels: string[];
}
export default class SubscribeCommand extends Command {
	private db: Database;
	public constructor(db: Database) {
		super();
		this.db = db;
	}

	private intervalMap = new Map<string, NodeJS.Timer>();
	private feedMap = new Map<string, Feed>();

	public expression = `(!(un)?s(ubscribe)? \\S*)`;
	public matchOn = MatchOn.MESSAGE; // MatchOn.TOKEN
	public execute = (messageInput: Message | TextChannel, input: any) => {
		const message = messageInput as Message;

		// TODO: might want to refactor into modules if more subs required
		const validFeatures = ['binance-new'];

		const args = input.split(' ');

		let action: '!s' | '!subscribe' | '!uns' | '!unsubscribe';
		let feature;
		let subscribe: boolean;

		try {
			// validation
			if (!this.db) throw new Error('Subscribe: database not defined');
			if (args.length != 2)
				throw new Error(
					'Subscribe: argument count invalid (expect 2):' +
						args.length
				);

			action = args[0];
			feature = args[1];
			subscribe = !(action === '!uns' || action === '!unsubscribe');
			console.log(
				action,
				feature,
				'channel:',
				message.channelId,
				'subscribing:',
				subscribe
			);

			// stupid iterator logic
			//if (!this.feedMap.keys().includes(feature))
			let keyFound = false;
			for (const key of this.feedMap) {
				if (key == feature) {
					keyFound = true;
					break;
				}
			}
			if (!keyFound)
				throw new Error('Subscribe: argument is not valid: ' + feature);
		} catch (e) {
			console.error(e);
			return null;
		}

		// TODO: pseudocode
		/** TODO: here
		 * - get object from db: subscriber list with last check time
		 * - if channel not in list, subscribe them
		 *
		 * - if not set, set interval to check for changes
		 * - if change is found, send update to subscriber list
		 * - reset interval
		 *
		 *
		 */

		let embed;

		// coin exists
		return Promise.resolve()
			.then(async () => {
				let subscribers: Subscribers;
				let data;
				let error = false;
				const cacheName = 'subscribe-' + feature;

				try {
					const subscriberLookup = await this.db.get(cacheName);

					console.debug('subscriber cache hit:', subscriberLookup);

					if (!subscriberLookup) {
						// if no subscribers and not subscribing do nothing
						if (!subscribe) return null;
						console.debug('generating new subscriber list...');
						// new subscriber object
						subscribers = {
							lastUpdate:
								new Date().getTime() - 24 * 60 * 60 * 1000,
							channels: [message.channelId],
						} as Subscribers;
					} else {
						// subscriber list exists
						subscribers = subscriberLookup as Subscribers;
						const subList = subscribers.channels.filter(
							(x) => x == message.channelId
						);

						console.debug('subscribers in list?', subList);

						const inList = subList.length != 0;

						console.debug(
							'subscriber channel in database: ',
							inList
						);

						if (subscribe) {
							// want to subscribe
							// check if already subscribed
							console.debug(subscribe);
							if (!inList) {
								subscribers.channels.push(message.channelId); // add channel to list if not subscribed
							} else return null; // otherwise do nothing
						} else {
							// if already unsubscribed, do nothing
							if (!inList) {
								return null;
							}

							// remove from subscription list
							subscribers.channels = subscribers.channels.filter(
								(x) => x !== message.channelId
							);

							// no subscribers left?
							if (subscribers.channels.length == 0) {
								// remove empty list from DB and stop polling
								await this.db.set(
									cacheName,
									{},
									Database.EXPIRE
								);
								clearInterval(
									this.intervalMap.get(
										cacheName
									) as NodeJS.Timer
								);
								this.intervalMap.delete(cacheName);
								//return;
							}
						}
					}
					await this.db.set(
						cacheName,
						subscribers,
						Database.NEVER_EXPIRE
					);

					embed = new MessageEmbed()
						.setColor('#9B59B6')
						.setTitle('🚀  Dogelon Subscriber')
						.setThumbnail('https://i.imgur.com/2vHF2jl.jpg')

						//.setTimestamp()
						.setFooter({
							text: 'Dogelon  •  Subscription Service',
						});

					if (subscribe)
						embed.setDescription(
							'Subscribed <#' +
								message.channelId +
								'> to feed `' +
								feature +
								'`'
						);
					else
						embed.setDescription(
							'Unsubscribed <#' +
								message.channelId +
								'> from feed `' +
								feature +
								'`'
						);

					// set polling interval if not already scheduled
					if (!this.intervalMap.has(cacheName)) {
						//
						const poller = setIntervalImmediately(async () => {
							// binance-new
							// TODO: generalise
							let data;
							try {
								const response = await axios.get(
									'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=5'
								);
								//const response = await axios.get("http://localhost:3000");
								data = response.data.data.catalogs[0];
							} catch (e) {
								console.error(e);
								return null;
							}

							console.log(
								'Subscriber: polling for changes on ' +
									cacheName
							);

							const subscribers = (await this.db.get(
								cacheName
							)) as Subscribers;

							if (subscribers.channels.length == 0) {
								// remove empty list from DB and stop polling
								await this.db.set(
									cacheName,
									{},
									Database.EXPIRE
								);
								clearInterval(
									this.intervalMap.get(
										cacheName
									) as NodeJS.Timer
								);
								this.intervalMap.delete(cacheName);
								return;
							}

							data.articles.forEach((article) => {
								if (
									article.releaseDate > subscribers.lastUpdate
								)
									console.log(
										article.releaseDate,
										subscribers.lastUpdate,
										article.releaseDate >
											subscribers.lastUpdate
									);
								if (
									article.releaseDate < subscribers.lastUpdate
								)
									return;

								const date = new Date(article.releaseDate);
								const year = date.getUTCFullYear();
								const month = date
									.getUTCMonth()
									.toString()
									.padStart(2, '0');
								const dt = date
									.getUTCDate()
									.toString()
									.padStart(2, '0');

								const hr = date
									.getUTCHours()
									.toString()
									.padStart(2, '0');
								const mi = date
									.getUTCMinutes()
									.toString()
									.padStart(2, '0');
								const se = date
									.getUTCSeconds()
									.toString()
									.padStart(2, '0');
								const tz = 'UTC';
								// build title string
								const timestamp = `${year}-${month}-${dt} ${hr}:${mi}:${se} ${tz}`;

								const text = article.title;
								const link = article.code;

								subscribers.channels.forEach((subscriberId) => {
									queue.push(
										new Action(
											client.channels.cache.get(
												subscriberId
											) as TextChannel,
											'',
											(msg, input) => {
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
										)
									);
								});
							});

							// change last updated time
							subscribers.lastUpdate = new Date().getTime();
							await this.db.set(
								cacheName,
								subscribers,
								Database.NEVER_EXPIRE
							);
							// TODO: proper test configuration logic
						}, 600000); // poll once per 10 mins

						this.intervalMap.set(cacheName, poller);
					}

					return { embeds: [embed] };

					//const response = await axios.get("https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=5");

					//console.log(response);
					//console.log(response);
					//data = response.data.data.catalogs[0];
				} catch (e) {
					data = undefined;
					error = true;
					console.error('subscribe error');
				}
				return null;
			})
			.catch((_) => {
				console.error(_);
				embed = null;
			});

		return null;
	};

	public init = () => {
		this.loadAllFeeds();
	};

	private loadAllFeeds = async () => {
		//const feeds = new Map<string, Feed>();

		await fs
			.readdirSync('./src/commands/feeds')
			.forEach(async (command: string) => {
				const [feedName, ts] = command.split('.');
				if (
					// knockout junk files
					ts !== 'ts' // not typescript
				)
					return;

				// import code
				const feedClass: Feed = new (
					await import(`./feeds/${feedName}`)
				).default(this.db);
				console.debug('new feed:', feedClass.feedName);

				// add command to command map
				this.feedMap.set(feedClass.feedName, feedClass);
			});
		//return feeds;
	};
}

// https://stackoverflow.com/questions/6685396/execute-the-setinterval-function-without-delay-the-first-time
function setIntervalImmediately(func, interval) {
	func();
	return setInterval(func, interval);
}
