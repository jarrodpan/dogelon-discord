export interface Feed {
	/**
	 * The command to call the feed from discord.
	 */
	readonly feedName: string;
	/**
	 * How frequently to check for updates on feed in milliseconds
	 */
	readonly updateTime: number;
	/**
	 * Callback which defines the update checking logic for the feed.
	 */
	public readonly updateFeed(): void;
}
