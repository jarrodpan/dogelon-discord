import Database from "../types/Database";
import SQLiteDb from 'better-sqlite3'; // alias of 'Database'

export default class SQLiteDatabase extends Database {
	private db: any;
	
	connect(uname?: string, pword?: string, host?: string, port?: string) {
		this.db = new SQLiteDb(':memory:');
		
		// create table
		this.db.prepare('CREATE TABLE IF NOT EXISTS dogelon(key TEXT, jsonData TEXT, cacheUntil INTEGER)').run();
	}
	get(key: string) {
		const time = Database.unixTime();//Math.ceil(Date.now() / 1000);
		const stmt = this.db.prepare("SELECT json_object(jsonData) FROM dogelon WHERE key = ? AND cacheUntil > ?");
		try {
			return stmt.get(key, time) || false;
		} catch (e) {
			console.error(e);
			return false;
		}
	}
	set(key: string, val: any, cache?: number) {
		if (!cache) cache = Database.unixTime();
		const stmt = this.db.prepare("INSERT OR REPLACE INTO dogelon (key, jsonData, cacheUntil) VALUES (?, ?, ?)");
		try {
			const info = stmt.run(key, JSON.stringify(val), cache);
			return info.change;
		} catch (e) {
			console.error(e);
			return false;
		}
	}
	
}