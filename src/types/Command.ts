import { Action } from "./Action";

export const enum ExecuteOn {
	TOKEN,
	MESSAGE
}

export interface Command {
	expression: string,
	executeOn: ExecuteOn,
	execute: (action: Action) => Promise<any>
}
