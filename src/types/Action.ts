import { Message } from 'discord.js';

export default class Action {
	public message: Message;
	public token: string;
	public callback: (message: Message, input: string) => Promise<any>;

	constructor(message: Message, token: string, callback: (message: Message, input: string) => Promise<any>) {
		this.message = message;
		this.token = token;
		this.callback = callback;
	}
}