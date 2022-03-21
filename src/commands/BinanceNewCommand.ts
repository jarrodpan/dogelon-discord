import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, MatchOn } from '../types/Command'
import Database from '../types/Database';

export default class BinanceNewCommand extends Command {
	private db: Database | undefined;
	public constructor(db?: Database | undefined) { super(); if (db) this.db = db; }
	
	public expression = `(!b(inance)?)`;
	public matchOn = MatchOn.TOKEN; // MatchOn.TOKEN
	public execute = (message: Message | TextChannel, input: any) => {
		let embed;

		// coin exists
		return Promise.resolve().then(async () => {
			let response;
			let data;
			let error = false;
			const cacheName = "binance-new";

			try {
				if (this.db) {
					response = this.db.get(cacheName);
					console.log("cache hit:");
					console.debug(response);
				}

				if (response == false) {
					console.log("fetching new result...");
					response = await axios.get("https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=5");
					console.debug("new data:",response);
					response.request = undefined;
					if (this.db) this.db.set(cacheName, response, 600);
					console.log("cache updated");
				}
				//console.log(response);
				//console.log(response);
				data = response.data.data.catalogs[0];
			} catch (e) {
				//if (typeof response.data != undefined) data = {};
				//if (typeof response.data.quoteSummary != undefined) data = response.data.quoteSummary;
				//else if (typeof response.data.finance != undefined) data = response.data.finance;

				//data = (response.data.quoteSummary ?? response.data.finance ?? {});
				data = undefined;
				error = true;
				console.error("binance error");
			}
			return [response, data, error];
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		}).then(([response, data, error]) => {
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
					//.setTimestamp()
					.setFooter({ text: footer })
					;
				
				
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
				console.debug(embed);
			} else {
				//embed = null;
				// error case
				/*embed
					.setColor("RED")
					.setTitle(data.error.code)
					.setDescription(data.error.description)
					;*/
				console.error("Binance: response error");
				return null;
			}
			//console.log("finance return", embed);
			if (embed == null) throw new Error("BinanceNewCommand: embed is undefined or null");
			//if (typeof embed != null || typeof embed !== undefined) {
			return { embeds: [embed] };
			//}

		}).catch((_) => {
			console.error(_);
			embed = null;
			return null;
		});



	}
}