export default abstract class Database {
	public abstract connect(uname?: string, pword?: string, host?: string | 'localhost', port?: string | 1433);
	public abstract get(key: string, callingFunction? : string | 'undefined'): any;
	public abstract set(key: string, ...arg0: any): void;
}