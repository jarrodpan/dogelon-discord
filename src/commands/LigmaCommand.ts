import { CallbackChannelInput, Command, MatchOn } from '../commands/';

/**
 * what's ligma?
 *
 * Example of message matching.
 */
export default class LigmaCommand extends Command {
	public expression =
		"(?:\\s|\\S)*what(?:'{0,1}| | i)s ligma\\?*(?:\\s|\\S)*"; //"what's ligma";
	public matchOn = MatchOn.MESSAGE;
	public execute = (_message: CallbackChannelInput, _: unknown) => {
		return 'ligma balls';
	};
}
