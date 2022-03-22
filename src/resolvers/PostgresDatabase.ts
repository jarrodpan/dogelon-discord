import Database from '../types/Database'
import { Pool, Client } from 'pg'
import { client } from '../app'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

export default class SQLiteDatabase extends Database {
	private db: any

	public connect(
		uname?: string,
		pword?: string,
		host?: string,
		port?: string
	) {
		// new postgres pool
		const pool = new Pool({
			user: uname || process.env.PGUSER,
			host: host || process.env.PGHOST,
			database: process.env.PGDATABASE || 'mydb',
			password: pword || process.env.PGPASSWORD,
			port: Number.parseInt(process.env.PGPORT || port || '5432'),
		})

		pool.on('error', (err, client) => {
			console.error('Unexpected error on idle client', err)
			process.exit(-1)
		})

		pool.query(
			'CREATE TABLE IF NOT EXISTS dogelon(key TEXT PRIMARY KEY, jsonData JSONB, cacheUntil INTEGER)'
		)

		this.db = pool
		// create table
		//this.db.prepare('CREATE TABLE IF NOT EXISTS dogelon(key TEXT PRIMARY KEY, jsonData TEXT, cacheUntil INTEGER)').run();
		return true
	}

	public async get(key: string) {
		try {
			this.db.connect().then(() => {
				return client
					.query({
						text: 'SELECT jsonData, cacheUntil FROM dogelon WHERE key = $1::string',
						values: [key],
					})
					.then((res) => {
						if (res.rowCount == 0) return false
						const row = res.row[0]

						if (row.cacheUntil < Database.unixTime()) return false // TODO: delete old entries

						return row
					})
			})
		} catch (e) {
			console.error(e)
		}
		return false
	}

	public set(key: string, val: any, setCache?: number) {
		const cache = Database.unixTime() + (setCache ?? 60)
		try {
			return this.db.connect().then((client) => {
				return client
					.query({
						text: 'INSERT OR REPLACE INTO dogelon (key, jsonData, cacheUntil) VALUES ($1::text, $2::jsonb, $3::integer)',
						values: [key, val, cache],
					})
					.then((res) => {
						return res.rowCount
					})
			})
		} catch (e) {
			console.error(e)
		}
		return false
	}

	public clean(): number {
		// TODO: convert to postgres
		return this.db
			.prepare('DELETE FROM dogelon WHERE cacheUntil < ?')
			.run(Database.unixTime()).changes
	}

	public constructor() {
		super()
	}
}
