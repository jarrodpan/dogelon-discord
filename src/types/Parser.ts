import { Command, MatchOn } from "./Command";
import * as fs from 'fs';
import * as Commands from './../commands';

export default class Parser {
	static Parser: typeof Commands;

	constructor() {
		console.log(Commands);
	}
}