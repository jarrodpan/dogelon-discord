import Database from "../types/Database";

export default class SQLiteDatabase implements Database {
	connect(uname: string, pword: string, host: string, port: string) {
		throw new Error("Method not implemented.");
	}
	get(key: string) {
		throw new Error("Method not implemented.");
	}
	set(key: string, ...arg0: any): void {
		throw new Error("Method not implemented.");
	}
	
}