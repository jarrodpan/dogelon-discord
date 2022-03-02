import Action from "./Action";

export enum MatchOn {
	TOKEN,
	MESSAGE
}

/**
 * @author Jarrod Pan
 * 
 * Provides an abstract class to implement commands in Dogelon
 * 
 * @param expression the regular expression as a string used to determine matching
 * @param matchOn a member of the enum MatchOn to determine if lexical matching is done on tokens or the message as a whole
 * @param execute a callback that takes an *Action* type and returns a *Promise<any>* for asynchronous calls, or an *any* type for synchronous callbacks.
 */
export abstract class Command {
	public readonly expression!: string;
	public readonly matchOn!: MatchOn;
	public readonly execute!: (action: Action) => Promise<any> | any;
}
