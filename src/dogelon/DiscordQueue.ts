import { Channel } from 'discord.js';

export type Action = {
	message: Channel;
	token: string;
	callback: (...params: any) => any;
};

export default class DiscordQueue {
	private queue: Action[] = [];

	public push(
		message: Channel,
		token: string,
		callback: (...params: any) => any
	) {
		this.queue.push({ message, token, callback } as Action);
	}
}
