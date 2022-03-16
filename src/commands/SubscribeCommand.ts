import axios from 'axios';
import { Message, MessageEmbed } from 'discord.js';
import { Command, MatchOn } from '../types/Command'
import Database from '../types/Database';

export default class SubscribeCommand extends Command {
	private db: Database;
	public constructor(db: Database) { super(); this.db = db; }
	
	private intervalList = new Map<string, NodeJS.Timer>();
	
	public expression = `(!s(ubscribe)? \\S*)`;
	public matchOn = MatchOn.MESSAGE; // MatchOn.TOKEN
	public execute = (message: Message, input: any) => {
		
		const validFeatures = ['binance-new'];
		
		
		const args = input.split(" ");
		let feature;
		
		// TODO: add unsubscribe function
		// TODO: check for existing subscriptions
		// TODO: check for no subscriptions and remove interval if so
		// TODO: set expiry time in database
		
		try {
			// validation
			if (!this.db) throw new Error("Subscribe: database not defined");
			if (args.length != 2) throw new Error("Subscribe: argument count invalid (expect 2):" + args.length);
			feature = args[1];
			
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
			let subscribers;
			let data;
			let error = false;
			const cacheName = "subscribe-"+feature;
			

			try {
				subscribers = this.db.get(cacheName);
				//console.log("cache hit:", subscribers);

				if (!subscribers) {
					// new subscriber object 
					subscribers = {
						lastUpdate: Database.unixTime(),
						channels: [
							message.channelId
						]
					}
					
				}
				else {
					if (!subscribers.channels.filter(message.channelId)) subscribers.channels.push(message.channelId);
				}
				this.db.set(cacheName, subscribers);
				
				embed = new MessageEmbed()
					.setColor("#9B59B6")
					.setTitle("🚀  Dogelon Subscriber")
					.setThumbnail("https://i.imgur.com/2vHF2jl.jpg")
					.setDescription('Subscribed <#'+message.channelId+'> to feature `'+feature+'`')
					.setTimestamp()
					.setFooter({ text: "Dogelon  •  Subscription Service" })
					;
				
				// TODO: set polling interval and push changes
				if (!this.intervalList.has(cacheName)) {
					//
					const poller = setInterval(() => {
						//
					}, 3600000); // poll once per hour
					
					this.intervalList.set(cacheName, poller);
				}
				
				
				
				
				
				return { embeds: [embed] };
				
				//const response = await axios.get("https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=5");
				
				//console.log(response);
				//console.log(response);
				//data = response.data.data.catalogs[0];
			} catch (e) {
				//if (typeof response.data != undefined) data = {};
				//if (typeof response.data.quoteSummary != undefined) data = response.data.quoteSummary;
				//else if (typeof response.data.finance != undefined) data = response.data.finance;

				//data = (response.data.quoteSummary ?? response.data.finance ?? {});
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
			