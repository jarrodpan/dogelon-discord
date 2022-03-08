export default interface Database {
	get(key:string ): any,
	set(key: string, ...arg0: any): void,
	connect(uname: string, pword: string, host: string, port: string),
}