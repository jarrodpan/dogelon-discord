import { Action } from '../types/Action';
import { Command, MatchOn } from '../types/Command'

/**
 * a command to turn r/ and /r/ references and reply with the link (as discord doesnt do it automatically for some reason)
 * 
 * Example of token matching
 */
export class RedditCommand implements Command {
	expression = "(r/|/r/)";
	matchOn = MatchOn.TOKEN;
	execute = (action: Action) => {
		return "https://www.reddit.com" + (action.token.slice(0, 1) == "/" ? "" : "/") + action.token;
	}
}