import Database from "../types/Database";
import SQLiteDb from 'better-sqlite3'; // alias of 'Database'

export default class SQLiteDatabase implements Database {
	private db: any;
	
	connect(uname?: string, pword?: string, host?: string, port?: string) {
		this.db = new SQLiteDb(':memory:');
		
		// create table
		this.db.prepare('CREATE TABLE IF NOT EXISTS dogelon(callingFunction TEXT, key TEXT, cacheUntil INTEGER, jsonData TEXT)').run();
	}
	get(key: string, callingFunction? :string | undefined) {
		throw new Error("Method not implemented.");
	}
	set(key: string, ...arg0: any): void {
		throw new Error("Method not implemented.");
	}
	
}