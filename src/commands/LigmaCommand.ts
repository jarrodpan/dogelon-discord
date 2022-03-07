import { Command, MatchOn } from '../types/Command'

/**
 * what's ligma?
 * 
 * Example of message matching.
 */
export default class LigmaCommand implements Command {
	public expression = "what(?:'{0,1}| | i)s ligma\\?*"; //"what's ligma";
	public matchOn = MatchOn.MESSAGE;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public execute = (_: unknown) => {
		return "ligma balls";
	}
}