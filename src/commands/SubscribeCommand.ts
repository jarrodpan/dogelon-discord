import axios from 'axios';
import { Channel, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../types/Command';
import Database from '../types/Database';
import { client, queue } from '../app';
import Action from '../types/Action';

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

	private intervalList = new Map<string, NodeJS.Timer>();

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
			console.log(action, feature, subscribe);

			if (!validFeatures.includes(feature))
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

					//console.log("cache hit:", subscribers);

					if (!subscriberLookup) {
						// if no subscribers do nothing
						if (!subscribe) return null;

						// new subscriber object
						subscribers = {
							lastUpdate:
								new Date().getTime() - 24 * 60 * 60 * 1000,
							channels: [message.channelId],
						};
					} else {
						// subscriber list exists
						subscribers = subscriberLookup as Subscribers;
						if (subscribe) {
							// want to subscribe
							// check if already subscribed
							console.debug(subscribe);
							if (
								subscribers.channels.filter(
									(x) => x == message.channelId
								).length == 0
							) {
								subscribers.channels.push(message.channelId); // add channel to list if not subscribed
							} else return null; // otherwise do nothing
						} else {
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
									this.intervalList.get(
										cacheName
									) as NodeJS.Timer
								);
								this.intervalList.delete(cacheName);
								return;
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
					if (!this.intervalList.has(cacheName)) {
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
									this.intervalList.get(
										cacheName
									) as NodeJS.Timer
								);
								this.intervalList.delete(cacheName);
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
								const year = date.getFullYear();
								const month = date.getMonth();
								const dt = date.getDate();
								// build title string
								const timestamp = `${year}-${month}-${dt}`;

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
														'📰  New Binance Cryptocurrency Listing News - ' +
															timestamp
													)

													.setThumbnail(
														data.icon ||
															'https://i.imgur.com/2vHF2jl.jpg'
													)
													.setDescription(
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

						this.intervalList.set(cacheName, poller);
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
}

// https://stackoverflow.com/questions/6685396/execute-the-setinterval-function-without-delay-the-first-time
function setIntervalImmediately(func, interval) {
	func();
	return setInterval(func, interval);
}
