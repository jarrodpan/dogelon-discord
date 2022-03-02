import { Action } from '../types/Action';
import { Command, MatchOn } from '../types/Command'

/**
 * what's ligma?
 * 
 * Example of message matching.
 */
export default class LigmaCommand implements Command {
	expression = "what('{0,1}| i)s ligma\?*"; //"what's ligma";
	matchOn = MatchOn.MESSAGE;
	execute = (action: Action) => {
		return "ligma balls";
	}
}