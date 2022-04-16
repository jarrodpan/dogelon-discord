/* eslint-disable no-mixed-spaces-and-tabs */
import { Client, Message, MessageOptions, TextChannel } from 'discord.js';
import { DiscordMessageOptions } from '../commands';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const v = 'v' + require('./../../package.json').version;

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
	public static client: Client;

	public static push = (
		message: Message | TextChannel | string,
		token: string,
		callback: (...params: any) => DiscordMessageOptions
	) => {
		if (typeof message === 'string') {
			if (!Queue.client) throw new Error('client called before defined');
			message = Queue.client.channels.cache.get(message) as TextChannel;
		}

		Queue.queue.push({ message, token, callback } as Action);
	};

	public static processNext = async () => {
		if (Queue.queue.length == 0) return;
		//console.log(client.channels.cache);
		// get next item from queue - definitely defined as we check above
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const action: Action = Queue.queue.shift()!;
		//console.log(message);
		//let output;
		Promise.resolve()
			.then(async () => {
				const output = await action.callback(
					action.message,
					action.token
				);
				// send message to channel
				return output;
			})
			.then(async (output) => {
				//console.log(action.message);
				if (output == null) return;

				// global footer icon
				if (output.embeds) {
					const icon =
						'https://cdn.discordapp.com/app-icons/945669693576994877/c11dde4d4f016ffcc820418864efd9f4.png?size=64';
					output.embeds[0].footer
						? (output.embeds[0].footer.iconURL = icon)
						: output.embeds[0].setFooter({
								text: `Dogelon ${v}`,
								iconURL: icon,
						  });
				}

				console.debug('sending to discord...', output);

				//try {
				if (action.message instanceof Message)
					await action.message.reply(output);
				if (action.message instanceof TextChannel)
					await action.message.send(output);
				//else await (action.message as TextChannel).send(output);
				//} catch (e) { console.error(e); }

				return;
			})
			.catch((e) => {
				console.error(e);
			});
	};

	public static setClient = (client: Client) => (Queue.client = client);
}
