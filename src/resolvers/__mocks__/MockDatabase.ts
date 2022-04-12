import Database from '../../types/Database';

type MockData = { data: any; expiry: number };

export default class MockDatabase extends Database {
	/**
	 * helper map to simulate a datastore
	 */
	private mockData = new Map<string, MockData>();

	/**
	 * Connect to a database.
	 * @param uname Username if required
	 * @param pword Password if required
	 * @param host Hostname if required
	 * @param port Port number if required
	 */
	public connect = (
		uname?: string,
		pword?: string,
		host?: string | 'localhost',
		port?: string | 1433
	) => {
		return true;
	};
	/**
	 * Gets a cached object
	 * @returns The cached object if found and not expired, false otherwise
	 * @param key Cache key to query for
	 */
	public get = (key: string) => {
		if (this.mockData.has(key)) {
			const entry = this.mockData.get(key)!;
			if (entry.expiry > Database.unixTime())
				return Promise.resolve(entry.data);
		}
		return false;
	};
	/**
	 * Sets or updates the cached object at the specified key.
	 * @returns 1 if the row is updated, false if an error occurs.
	 * @param key Key to set or update
	 * @param val JSON object to set
	 * @param cache Optional. Set expiry time of the cache value.
	 */
	public set = (key: string, val: any, cache?: number) => {
		const cacheTime = Database.unixTime() + (cache ?? 60);
		this.mockData.set(key, { data: val, expiry: cacheTime });
		return Promise.resolve(1);
	}; //number | false;
	/**
	 * Removes all expired cache entries from the database.
	 * @returns number of rows deleted
	 */
	public clean = () => {
		let x = 0;
		this.mockData.forEach((_, k) => {
			if (this.mockData.get(k)!.expiry < Database.unixTime())
				this.mockData.delete(k) && x++;
		});
		return x;
	};
}
