import axios from 'axios';
import { Channel, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../types/Command'
import Database from '../types/Database';
import { client, queue } from '../app';
import Action from '../types/Action';

export interface Subscribers {
	lastUpdate: number,
	channels: string[]
}
export default class SubscribeCommand extends Command {
	private db: Database;
	public constructor(db: Database) { super(); this.db = db; }
	
	private intervalList = new Map<string, NodeJS.Timer>();
	
	public expression = `(!(un)?s(ubscribe)? \\S*)`;

	public matchOn = MatchOn.MESSAGE; // MatchOn.TOKEN
	public execute = (messageInput: Message | TextChannel, input: any) => {
		
		const message = messageInput as Message;
		
		// TODO: might want to refactor into modules if more subs required
		const validFeatures = [
			'binance-new',
		];
		
		
		const args = input.split(" ");

		let action : "!s" | "!subscribe" | "!uns" | "!unsubscribe";
		let feature;
		let subscribe : boolean;

		
		// TODO: add unsubscribe function
		// TODO: check for existing subscriptions
		// TODO: check for no subscriptions and remove interval if so
		
		try {
			// validation
			if (!this.db) throw new Error("Subscribe: database not defined");
			if (args.length != 2) throw new Error("Subscribe: argument count invalid (expect 2):" + args.length);

			action = args[0];
			feature = args[1];
			subscribe = !(action === "!uns" || action === "!unsubscribe");
			console.log(action, feature, subscribe);

			if (!validFeatures.includes(feature)) throw new Error("Subscribe: argument is not valid: " + feature);
			
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
		return Promise.resolve().then(async () => {
			let subscribers : Subscribers;
			let data;
			let error = false;
			const cacheName = "subscribe-"+feature;
			

			try {
				const subscriberLookup = this.db.get(cacheName);
				
				//console.log("cache hit:", subscribers);

				if (!subscriberLookup) {

					// if no subscribers do nothing
					if (!subscribe) return null;

					// new subscriber object 
					subscribers = {
						lastUpdate: (new Date()).getTime(),
						channels: [
							message.channelId
						]
					}
					
				}
				else {

					// subscriber list exists
					subscribers = subscriberLookup as Subscribers;
					if (subscribe) { // want to subscribe
						// check if already subscribed
						if (!subscribers.channels.filter(x => x == message.channelId)) {
							subscribers.channels.push(message.channelId); // add channel to list if not subscribed
						} else return null; // otherwise do nothing
					} else {
						// remove from subscription list
						subscribers.channels = subscribers.channels.filter(x => x !== message.channelId);
						
						// no subscribers left?
						if (subscribers.channels.length == 0) {
							// remove empty list from DB and stop polling
							this.db.set(cacheName, {}, Database.EXPIRE);
							clearInterval(this.intervalList.get(cacheName) as NodeJS.Timer);
							this.intervalList.delete(cacheName);
							return;
						}
						
					}
						

				}
				this.db.set(cacheName, subscribers, Database.NEVER_EXPIRE);
				
				embed = new MessageEmbed()
					.setColor("#9B59B6")
					.setTitle("🚀  Dogelon Subscriber")
					.setThumbnail("https://i.imgur.com/2vHF2jl.jpg")

					.setTimestamp()
					.setFooter({ text: "Dogelon  •  Subscription Service" })
					;
				

				if (subscribe) embed.setDescription('Subscribed <#' + message.channelId + '> to feed `' + feature + '`');
				else embed.setDescription('Unsubscribed <#' + message.channelId + '> from feed `' + feature + '`');
				

				// set polling interval if not already scheduled
				if (!this.intervalList.has(cacheName)) {
					//
					const poller = setInterval(async () => {
						// binance-new
						// TODO: generalise
						let data;
						try {
							const response = await axios.get("https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=5");
							//const response = await axios.get("http://localhost:3000");
							data = response.data.data.catalogs[0];
						} catch (e)
						{
							console.error(e)
							return null;
						}
							
							console.log("Subscriber: polling for changes on " + cacheName);
						
						const subscribers = this.db.get(cacheName) as Subscribers;
						
						if (subscribers.channels.length == 0) {
							// remove empty list from DB and stop polling
							this.db.set(cacheName, {}, Database.EXPIRE);
							clearInterval(this.intervalList.get(cacheName) as NodeJS.Timer);
							this.intervalList.delete(cacheName);
							return;
						}
						
						data.articles.forEach((article) => {
							console.log(article.releaseDate, subscribers.lastUpdate, (article.releaseDate > subscribers.lastUpdate));
							if (article.releaseDate < subscribers.lastUpdate) return;
							
							const date = new Date(article.releaseDate);
							const year = date.getFullYear();
							const month = date.getMonth();
							const dt = date.getDate();
							// build title string
							const timestamp = `${year}-${month}-${dt}`;

							const text = article.title;
							const link = article.code;
						
							subscribers.channels.forEach((subscriberId) => {
								queue.push(new Action(client.channels.cache.get(subscriberId) as TextChannel, "", (msg, input) => {
									
										
										const embed = new MessageEmbed()
											.setColor("#9B59B6")

											.setTitle("📰  New Binance Cryptocurrency Listing News - "+timestamp)

											.setThumbnail(data.icon || "https://i.imgur.com/2vHF2jl.jpg")
											.setDescription(`[${text}](${link})`)
											.setTimestamp()
											.setFooter({ text: "Dogelon  •  Subscription Service" })
											;
										return { embeds: [embed] };
									
								}));
							});
						});
						
						// change last updated time
						subscribers.lastUpdate = (new Date()).getTime();
						this.db.set(cacheName, subscribers, Database.NEVER_EXPIRE);
					// TODO: proper test configuration logic	
					}, 1800000); // poll once per hour
					//}, 2000); // poll once per second
					
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
				console.error("subscribe error");
			}
			return null;
			
			
			
			
		}).catch((_) => {
			console.error(_);
			embed = null;
			
		});

		return null;

	}
}


		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		/*}).then(([response, data, error]) => {
			//console.log(data.error);
			if (!error) {
				console.log("setting up response");
				const result = data.articles;
				const title = "Latest Binance Cryptocurrency Listing News";
				const footer = "Binance  •  New Cryptocurrency Listing";

				
				embed = new MessageEmbed()
					.setColor("#FCD535")
					.setTitle("🚀  " + title)
					.setThumbnail(data.icon || 'https://i.imgur.com/AfFp7pu.png')
					.setTimestamp()
					.setFooter({ text: footer })
					;
				
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				
				result.forEach((article) => {
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
				
				console.log("embed set");
				console.log(embed);
			} else {
				//embed = null;
				// error case

				console.error("Binance: response error");
				return null;
			}
			//console.log("finance return", embed);
			if (embed == null) throw new Error("BinanceNewCommand: embed is undefined or null");
			//if (typeof embed != null || typeof embed !== undefined) {
			return { embeds: [embed] };
			//}
			*/
			