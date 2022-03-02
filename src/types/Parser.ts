import { Command, MatchOn } from "./Command";
import * as fs from 'fs';
import * as Commands from './../commands';

export default class Parser {
	static Parser: typeof Commands;
	//commands: any[] = Commands;
	constructor() {

		console.log(Commands);
	}
}