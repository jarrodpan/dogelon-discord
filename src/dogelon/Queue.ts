import { Channel, Message, TextChannel } from 'discord.js';

type Action = {
	message: Message | TextChannel;
	token: string;
	callback: (
		message: Message | TextChannel,
		input: string
	) => Promise<any> | any;
};

export class Queue {
	private static queue: Action[] = [];

	public static push(
		message: Message | TextChannel,
		token: string,
		callback: (...params: any) => any
	) {
		Queue.queue.push({ message, token, callback } as Action);
	}

	public static processNext = async () => {};
}
