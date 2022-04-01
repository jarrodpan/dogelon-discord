import Database from '../../types/Database';
import { Feed } from '../../types/Feed';

export default class binanceNew implements Feed {
	private db: Database;
	public readonly feedName = 'binance-new';
	public readonly updateTime: number = 600000;

	constructor(db: Database) {
		this.db = db;
	}

	public intervalFunction(): void {
		throw new Error('Method not implemented.');
	}
}
