import * as fs from 'fs';
import Database from '../../types/Database';

const loadAllFeeds = async (db: Database) => {
	const feeds = new Map<string, Feed>();

	await fs
		.readdirSync('./src/commands/feeds')
		.forEach(async (command: string) => {
			const [feedName, ts] = command.split('.');
			if (
				// knockout junk files
				ts !== 'ts' // not typescript
			)
				return;

			// import code
			const feedFunction: Feed = new (
				await import(`./${feedName}`)
			).default(db);
			console.debug('new feed:', feedName);

			// add command to command map
			feeds.set(feedName, feedFunction);
		});
	return feeds;
};

export default loadAllFeeds;
