import Database from '../../types/Database';
import { Feed } from '../../types/Feed';

export default class binanceNew implements Feed {
	private db: Database;
	public readonly feedName = 'binance-new';

	constructor(db: Database) {
		this.db = db;
	}
}
