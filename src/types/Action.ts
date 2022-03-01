import { Message } from 'discord.js';

export class Action {
	public message: Message;
	public token: string;
	public callback: (input: string) => Promise<any>;

	constructor(message: Message, token: string, callback: (input: string) => Promise<any>) {
		this.message = message;
		this.token = token;
		this.callback = callback;
	}
}