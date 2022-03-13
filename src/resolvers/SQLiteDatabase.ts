import Database from "../types/Database";
import SQLiteDb from 'better-sqlite3'; // alias of 'Database'

export default class SQLiteDatabase extends Database {
	private db: any;
	
	public connect(uname?: string, pword?: string, host?: string, port?: string) {
		this.db = new SQLiteDb(':memory:');
		
		// create table
		this.db.prepare('CREATE TABLE IF NOT EXISTS dogelon(key TEXT PRIMARY KEY, jsonData TEXT, cacheUntil INTEGER)').run();
		return true;
	}
	
	public get(key: string) {
		const stmt = this.db.prepare("SELECT jsonData, cacheUntil FROM dogelon WHERE key = ?");
		try {
			const res = stmt.get(key);
			//console.log(res);
			if (res.cacheUntil < Database.unixTime()) {
				//console.log("cache expired");
				this.db.prepare('DELETE FROM dogelon WHERE key = ?').run(key);
				return false;
			}
			return JSON.parse(res.jsonData);
		} catch (e) {
			console.error(e);
		}
		return false;
	}
	
	public set(key: string, val: any, cache?: number) {
		if (!cache) cache = Database.unixTime() + 60; // cache for 1 min by default
		const stmt = this.db.prepare("INSERT OR REPLACE INTO dogelon (key, jsonData, cacheUntil) VALUES (?, ?, ?)");
		try {
			const info = stmt.run(key, JSON.stringify(val), cache);
			//console.log(info);
			return info.changes;
		} catch (e) {
			console.error(e);
		}
		return false;
	}
	
	public constructor() { super(); }
	
}