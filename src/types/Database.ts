export default interface Database {
	connect(uname: string, pword: string, host: string, port: string),
	get(key:string ): any,
	set(key: string, ...arg0: any): void,
}