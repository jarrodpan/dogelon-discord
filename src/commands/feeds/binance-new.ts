import Database from '../../types/Database';
import { Feed } from '../../types/Feed';

export default class binanceNew implements Feed {
	private db: Database;
	constructor(db: Database) {
		this.db = db;
	}
}
