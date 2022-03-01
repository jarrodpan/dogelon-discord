import { Action } from "./Action";

export const enum MatchOn {
	TOKEN,
	MESSAGE
}
/**
 * @author Jarrod Pan
 * 
 * Provides an abstract class to implement commands in Dogelon
 * 
 * @param expression: the regular expression as a string used to determine matching
 * @param matchOn: a member of the @enum MatchOn to determine if 
 */
export abstract class Command {
	public readonly expression!: string;
	public readonly matchOn!: MatchOn;
	public readonly execute!: (action: Action) => Promise<any> | any;
}