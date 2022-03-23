import Database from '../types/Database';
import { Pool, Client } from 'pg';
import { client } from '../app';
import { reduceEachTrailingCommentRange, resolveModuleName } from 'typescript';
import { PartialGroupDMChannel } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export default class PostgresDatabase extends Database {
	private static db: any;

	public connect(
		uname?: string,
		pword?: string,
		host?: string,
		port?: string
	) {
		if (PostgresDatabase.db) return true;
		// new postgres pool
		const pool = new Pool({
			user: uname || process.env.PGUSER,
			host: host || process.env.PGHOST,
			database: process.env.PGDATABASE || 'dogelon',
			password: pword || process.env.PGPASSWORD,
			port: Number.parseInt(process.env.PGPORT || port || '5432'),
		});

		pool.on('error', (err, client) => {
			console.error('Unexpected error on idle client', err);
			process.exit(-1);
		});

		Promise.resolve()
			.then(() => {
				let q = '';
				if (process.env.NODE_ENV === 'development')
					q += 'drop table if exists "dogelon";';
				q +=
					'CREATE TABLE IF NOT EXISTS "dogelon" ("key" TEXT PRIMARY KEY, "jsonData" JSONB not null, "cacheUntil" BIGINT not null)';
				return pool.query(q);
			})
			.catch((e?) => {
				console.error(e);
				return false;
			});

		PostgresDatabase.db = pool;

		// create table
		//this.db.prepare('CREATE TABLE IF NOT EXISTS dogelon(key TEXT PRIMARY KEY, jsonData TEXT, cacheUntil INTEGER)').run();
		return true;
	}

	public get(key: string) {
		return Promise.resolve()
			.then(async () => {
				return await PostgresDatabase.db.connect();
			})
			.then(async (client) => {
				return await client
					.query({
						text: 'SELECT "jsonData", "cacheUntil" FROM "public"."dogelon" WHERE key = $1::text',
						values: [key],
					})
					.then(async (res) => {
						if (res.rowCount == 0) return false;
						if (
							Number.parseInt(res?.rows[0]?.cacheUntil) <
							Database.unixTime()
						)
							return false;
						return res.rows[0].jsonData;
					})
					.catch(async (e?) => {
						console.error(e);
						return false;
					})
					.finally(async (res) => {
						await client.release();
						return res;
					});
			});
	}

	public async set(key: string, val: any, setCache?: number) {
		const cache = Database.unixTime() + (setCache ?? 60);

		return Promise.resolve()
			.then(async () => {
				return await PostgresDatabase.db.connect();
			})
			.then(async (client) => {
				return await client
					.query({
						text: 'INSERT INTO "public"."dogelon" ("key", "jsonData", "cacheUntil") \
								VALUES ($1::text, $2::jsonb, $3::bigint) \
								ON CONFLICT ("key") DO \
								UPDATE SET "jsonData" = EXCLUDED."jsonData", "cacheUntil" = EXCLUDED."cacheUntil" \
								WHERE "public"."dogelon"."key" = EXCLUDED."key"',
						values: [key, val, cache],
					})
					.then(async (res) => {
						//console.log(res);
						if (res.rowCount == 0) return false;
						return res.rowCount;
					})
					.catch(async (e?) => {
						console.error(e);
						return false;
					})
					.finally(async (res) => {
						await client.release();
						return res;
					});
			});
	}

	public clean(): number {
		// TODO: convert to postgres
		return 1;
		return PostgresDatabase.db
			.prepare('DELETE FROM dogelon WHERE cacheUntil < ?')
			.run(Database.unixTime()).changes;
	}

	public constructor() {
		super();
	}
}
