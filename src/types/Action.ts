import { Message, TextChannel } from 'discord.js'

export default class Action {
	public message: Message | TextChannel
	public token: string
	public callback: (
		message: Message | TextChannel,
		input: string
	) => Promise<any> | any

	constructor(
		message: Message | TextChannel,
		token: string,
		callback: (
			message: Message | TextChannel,
			input: string
		) => Promise<any> | any
	) {
		this.message = message
		this.token = token
		this.callback = callback
	}
}
