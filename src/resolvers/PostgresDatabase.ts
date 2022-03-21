import Database from "../types/Database";
import { Pool, Client } from 'pg';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export default class SQLiteDatabase extends Database {
	private db: any;
	
	public connect(uname?: string, pword?: string, host?: string, port?: string) {
		// new postgres pool
		const pool = new Pool({
			user: uname || process.env.PGUSER,
			host: host || process.env.PGHOST,
			database: process.env.PGDATABASE || 'mydb',
			password: pword || process.env.PGPASSWORD,
			port: Number.parseInt(port || "5432")
		});
		
		pool.on('error', (err, client) => {
			console.error('Unexpected error on idle client', err)
			process.exit(-1)
		});
		
		pool.query('CREATE TABLE IF NOT EXISTS dogelon(key TEXT PRIMARY KEY, jsonData JSONB, cacheUntil INTEGER)');
		
		this.db = pool;
		// create table
		//this.db.prepare('CREATE TABLE IF NOT EXISTS dogelon(key TEXT PRIMARY KEY, jsonData TEXT, cacheUntil INTEGER)').run();
		return true;
	}
	
	public get(key: string) {
		const stmt = this.db.prepare("SELECT jsonData, cacheUntil FROM dogelon WHERE key = ?");
		try {
			const res = stmt.get(key);
			//console.log("db response:", res);
			if (!res) return false;
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
	
	public set(key: string, val: any, setCache?: number) {
		const cache = Database.unixTime() + (setCache ?? 60);
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
	
	public clean(): number {
		return (this.db.prepare('DELETE FROM dogelon WHERE cacheUntil < ?').run(Database.unixTime())).changes;
	}
	
	public constructor() { super(); }
	
}