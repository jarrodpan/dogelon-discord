import { Command, MatchOn } from "./Command";
import * as fs from 'fs';

export default class Parser {

	protected static commandList: any[];

	constructor() {
		Parser.commandList = []
	}
}