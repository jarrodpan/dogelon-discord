export default abstract class Database {
	/**
	 * Connect to a database.
	 * @param uname Username if required
	 * @param pword Password if required
	 * @param host Hostname if required
	 * @param port Port number if required
	 */
	public abstract connect(uname?: string, pword?: string, host?: string | 'localhost', port?: string | 1433);
	/**
	 * Gets a cached object
	 * @returns The cached object if found and not expired, false otherwise
	 * @param key Cache key to query for
	 */
	public abstract get(key: string): object | false;
	/**
	 * Sets or updates the cached object at the specified key.
	 * @returns 1 if the row is updated, false if an error occurs.
	 * @param key Key to set or update
	 * @param val JSON object to set
	 * @param cache Optional. Set expiry time of the cache value.
	 */
	public abstract set(key: string, val: any, cache?: number): number | false;
	
	public static unixTime() { return Math.ceil(Date.now() / 1000); }
}