export default abstract class Database {
	public abstract connect(uname?: string, pword?: string, host?: string | 'localhost', port?: string | 1433);
	public abstract get(key: string): any;
	public abstract set(key: string, val: any, cache?: number): any;
	
	protected static unixTime() { return Math.ceil(Date.now() / 1000); }
}