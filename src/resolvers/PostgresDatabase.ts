// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import Database from '../types/Database';
import { Pool, Client } from 'pg';
import { client } from '../app';
import { reduceEachTrailingCommentRange, resolveModuleName } from 'typescript';
import { PartialGroupDMChannel } from 'discord.js';

export default class PostgresDatabase extends Database {
	private static db: any;

	public connect(
		uname?: string,
		pword?: string,
		host?: string,
		port?: string
	) {
		//if (PostgresDatabase.db) return true;

		let pgConfig;

		if (process.env.DATABASE_URL) {
			console.log('DATABASE_URL present');
			//const url = process.env.DATABASE_URL + '?sslmode=require';
			pgConfig = {
				connectionString: process.env.DATABASE_URL,
				ssl: {
					rejectUnauthorized: false,
				},
			};
		} else
			pgConfig = {
				user: uname || process.env.PGUSER,
				host: host || process.env.PGHOST,
				database: process.env.PGDATABASE || 'dogelon',
				password: pword || process.env.PGPASSWORD,
				port: Number.parseInt(process.env.PGPORT || port || '5432'),
			};

		// new postgres pool
		PostgresDatabase.db = pgConfig;

		const client = new Client(PostgresDatabase.db);

		Promise.resolve()
			.then(() => {
				client.connect();
			})
			.then(() => {
				let q = '';
				//if (process.env.NODE_ENV === 'development') q += 'drop table if exists "dogelon";';
				q +=
					'CREATE TABLE IF NOT EXISTS "dogelon" ("key" TEXT PRIMARY KEY, "jsonData" JSONB not null, "cacheUntil" BIGINT not null)';
				return client.query(q);
			})
			.catch((e?) => {
				console.error(e);
				return false;
			})
			.finally(() => {
				client.end();
			});

		//PostgresDatabase.db = pool;

		// create table
		//this.db.prepare('CREATE TABLE IF NOT EXISTS dogelon(key TEXT PRIMARY KEY, jsonData TEXT, cacheUntil INTEGER)').run();
		return true;
	}

	public get(key: string) {
		if (process.env.NODE_ENV === 'development') key = 'dev-' + key;
		return Promise.resolve()
			.then(async () => {
				const client = new Client(PostgresDatabase.db);
				await client.connect();
				return client;
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
					.finally(async () => {
						await client.end();
						//return res;
					});
			});
	}

	public async set(key: string, val: any, setCache?: number) {
		if (process.env.NODE_ENV === 'development') key = 'dev-' + key;
		const cache = Database.unixTime() + (setCache ?? 60);

		return Promise.resolve()
			.then(async () => {
				const client = new Client(PostgresDatabase.db);
				await client.connect();
				return client;
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
					.finally(async () => {
						await client.end();
						//return res;
					});
			});
	}

	public async clean() {
		return Promise.resolve()
			.then(async () => {
				const client = new Client(PostgresDatabase.db);
				await client.connect();
				return client;
			})
			.then(async (client) => {
				let dev = '';
				if (process.env.NODE_ENV === 'production')
					dev = 'OR ("public"."dogelon"."key" LIKE \'dev-%\')';
				const q =
					'DELETE FROM "public"."dogelon" WHERE ("cacheUntil" < $1)' +
					dev;
				return await client
					.query({
						text: q,
						values: [Database.unixTime()],
					})
					.then(async (res) => {
						//console.log(res);
						return res.rowCount;
					})
					.catch(async (e?) => {
						console.error(e);
						return -1;
					})
					.finally(async () => {
						await client.end();
						console.log('PostgresDatabase: cache cleaned');
						//return res;
					});
			});
	}

	public constructor() {
		super();
		//this.connect();
	}
}
