import Action from '../types/Action';
import { Command, MatchOn } from '../types/Command'

/**
 * what's ligma?
 * 
 * Example of message matching.
 */
export default class LigmaCommand implements Command {
	public expression = "what('{0,1}| i)s ligma\?*"; //"what's ligma";
	public matchOn = MatchOn.MESSAGE;
	public execute = (action: Action) => {
		return "ligma balls";
	}
	public constructor() { };
}