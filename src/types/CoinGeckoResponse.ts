// To parse this data:
//
//   import { Convert, CoinGeckoResponse } from "./file";
//
//   const coinGeckoResponse = Convert.toCoinGeckoResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface CoinGeckoResponse {
	id: string;
	symbol: string;
	name: string;
	asset_platform_id: string;
	platforms: Platforms;
	block_time_in_minutes: number;
	hashing_algorithm: null;
	categories: string[];
	public_notice: null;
	additional_notices: any[];
	localization: Tion;
	description: Tion;
	links: Links;
	image: Image;
	country_origin: string;
	genesis_date: null;
	contract_address: string;
	sentiment_votes_up_percentage: number;
	sentiment_votes_down_percentage: number;
	market_cap_rank: number;
	coingecko_rank: number;
	coingecko_score: number;
	developer_score: number;
	community_score: number;
	liquidity_score: number;
	public_interest_score: number;
	market_data: MarketData;
	public_interest_stats: PublicInterestStats;
	status_updates: any[];
	last_updated: Date;
}

export interface Tion {
	en: string;
	de: string;
	es: string;
	fr: string;
	it: string;
	pl: string;
	ro: string;
	hu: string;
	nl: string;
	pt: string;
	sv: string;
	vi: string;
	tr: string;
	ru: string;
	ja: string;
	zh: string;
	"zh-tw": string;
	ko: string;
	ar: string;
	th: string;
	id: string;
}

export interface Image {
	thumb: string;
	small: string;
	large: string;
}

export interface Links {
	homepage: string[];
	blockchain_site: string[];
	official_forum_url: string[];
	chat_url: string[];
	announcement_url: string[];
	twitter_screen_name: string;
	facebook_username: string;
	bitcointalk_thread_identifier: null;
	telegram_channel_identifier: string;
	subreddit_url: null;
	repos_url: ReposURL;
}

export interface ReposURL {
	github: any[];
	bitbucket: any[];
}

export interface MarketData {
	current_price: { [key: string]: number };
	total_value_locked: null;
	mcap_to_tvl_ratio: null;
	fdv_to_tvl_ratio: null;
	roi: null;
	ath: { [key: string]: number };
	ath_change_percentage: { [key: string]: number };
	ath_date: { [key: string]: Date };
	atl: { [key: string]: number };
	atl_change_percentage: { [key: string]: number };
	atl_date: { [key: string]: Date };
	market_cap: { [key: string]: number };
	market_cap_rank: number;
	fully_diluted_valuation: { [key: string]: number };
	total_volume: { [key: string]: number };
	high_24h: { [key: string]: number };
	low_24h: { [key: string]: number };
	price_change_24h: number;
	price_change_percentage_24h: number;
	price_change_percentage_7d: number;
	price_change_percentage_14d: number;
	price_change_percentage_30d: number;
	price_change_percentage_60d: number;
	price_change_percentage_200d: number;
	price_change_percentage_1y: number;
	market_cap_change_24h: number;
	market_cap_change_percentage_24h: number;
	price_change_24h_in_currency: { [key: string]: number };
	price_change_percentage_1h_in_currency: { [key: string]: number };
	price_change_percentage_24h_in_currency: { [key: string]: number };
	price_change_percentage_7d_in_currency: { [key: string]: number };
	price_change_percentage_14d_in_currency: { [key: string]: number };
	price_change_percentage_30d_in_currency: { [key: string]: number };
	price_change_percentage_60d_in_currency: { [key: string]: number };
	price_change_percentage_200d_in_currency: { [key: string]: number };
	price_change_percentage_1y_in_currency: { [key: string]: number };
	market_cap_change_24h_in_currency: { [key: string]: number };
	market_cap_change_percentage_24h_in_currency: { [key: string]: number };
	total_supply: number;
	max_supply: number;
	circulating_supply: number;
	last_updated: Date;
}

export interface Platforms {
	ethereum: string;
	"binance-smart-chain": string;
}

export interface PublicInterestStats {
	alexa_rank: number;
	bing_matches: null;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
	public static toCoinGeckoResponse(json: string): CoinGeckoResponse {
		return cast(JSON.parse(json), r("CoinGeckoResponse"));
	}

	public static coinGeckoResponseToJson(value: CoinGeckoResponse): string {
		return JSON.stringify(uncast(value, r("CoinGeckoResponse")), null, 2);
	}
}

function invalidValue(typ: any, val: any, key: any = ''): never {
	if (key) {
		throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
	}
	throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`,);
}

function jsonToJSProps(typ: any): any {
	if (typ.jsonToJS === undefined) {
		const map: any = {};
		typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
		typ.jsonToJS = map;
	}
	return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
	if (typ.jsToJSON === undefined) {
		const map: any = {};
		typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
		typ.jsToJSON = map;
	}
	return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
	function transformPrimitive(typ: string, val: any): any {
		if (typeof typ === typeof val) return val;
		return invalidValue(typ, val, key);
	}

	function transformUnion(typs: any[], val: any): any {
		// val must validate against one typ in typs
		const l = typs.length;
		for (let i = 0; i < l; i++) {
			const typ = typs[i];
			try {
				return transform(val, typ, getProps);
			} catch (_) { }
		}
		return invalidValue(typs, val);
	}

	function transformEnum(cases: string[], val: any): any {
		if (cases.indexOf(val) !== -1) return val;
		return invalidValue(cases, val);
	}

	function transformArray(typ: any, val: any): any {
		// val must be an array with no invalid elements
		if (!Array.isArray(val)) return invalidValue("array", val);
		return val.map(el => transform(el, typ, getProps));
	}

	function transformDate(val: any): any {
		if (val === null) {
			return null;
		}
		const d = new Date(val);
		if (isNaN(d.valueOf())) {
			return invalidValue("Date", val);
		}
		return d;
	}

	function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
		if (val === null || typeof val !== "object" || Array.isArray(val)) {
			return invalidValue("object", val);
		}
		const result: any = {};
		Object.getOwnPropertyNames(props).forEach(key => {
			const prop = props[key];
			const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
			result[prop.key] = transform(v, prop.typ, getProps, prop.key);
		});
		Object.getOwnPropertyNames(val).forEach(key => {
			if (!Object.prototype.hasOwnProperty.call(props, key)) {
				result[key] = transform(val[key], additional, getProps, key);
			}
		});
		return result;
	}

	if (typ === "any") return val;
	if (typ === null) {
		if (val === null) return val;
		return invalidValue(typ, val);
	}
	if (typ === false) return invalidValue(typ, val);
	while (typeof typ === "object" && typ.ref !== undefined) {
		typ = typeMap[typ.ref];
	}
	if (Array.isArray(typ)) return transformEnum(typ, val);
	if (typeof typ === "object") {
		return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
			: typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
				: typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
					: invalidValue(typ, val);
	}
	// Numbers can be parsed by Date but shouldn't be.
	if (typ === Date && typeof val !== "number") return transformDate(val);
	return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
	return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
	return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
	return { arrayItems: typ };
}

function u(...typs: any[]) {
	return { unionMembers: typs };
}

function o(props: any[], additional: any) {
	return { props, additional };
}

function m(additional: any) {
	return { props: [], additional };
}

function r(name: string) {
	return { ref: name };
}

const typeMap: any = {
	"CoinGeckoResponse": o([
		{ json: "id", js: "id", typ: "" },
		{ json: "symbol", js: "symbol", typ: "" },
		{ json: "name", js: "name", typ: "" },
		{ json: "asset_platform_id", js: "asset_platform_id", typ: "" },
		{ json: "platforms", js: "platforms", typ: r("Platforms") },
		{ json: "block_time_in_minutes", js: "block_time_in_minutes", typ: 0 },
		{ json: "hashing_algorithm", js: "hashing_algorithm", typ: null },
		{ json: "categories", js: "categories", typ: a("") },
		{ json: "public_notice", js: "public_notice", typ: null },
		{ json: "additional_notices", js: "additional_notices", typ: a("any") },
		{ json: "localization", js: "localization", typ: r("Tion") },
		{ json: "description", js: "description", typ: r("Tion") },
		{ json: "links", js: "links", typ: r("Links") },
		{ json: "image", js: "image", typ: r("Image") },
		{ json: "country_origin", js: "country_origin", typ: "" },
		{ json: "genesis_date", js: "genesis_date", typ: null },
		{ json: "contract_address", js: "contract_address", typ: "" },
		{ json: "sentiment_votes_up_percentage", js: "sentiment_votes_up_percentage", typ: 3.14 },
		{ json: "sentiment_votes_down_percentage", js: "sentiment_votes_down_percentage", typ: 3.14 },
		{ json: "market_cap_rank", js: "market_cap_rank", typ: 0 },
		{ json: "coingecko_rank", js: "coingecko_rank", typ: 0 },
		{ json: "coingecko_score", js: "coingecko_score", typ: 3.14 },
		{ json: "developer_score", js: "developer_score", typ: 0 },
		{ json: "community_score", js: "community_score", typ: 3.14 },
		{ json: "liquidity_score", js: "liquidity_score", typ: 3.14 },
		{ json: "public_interest_score", js: "public_interest_score", typ: 0 },
		{ json: "market_data", js: "market_data", typ: r("MarketData") },
		{ json: "public_interest_stats", js: "public_interest_stats", typ: r("PublicInterestStats") },
		{ json: "status_updates", js: "status_updates", typ: a("any") },
		{ json: "last_updated", js: "last_updated", typ: Date },
	], false),
	"Tion": o([
		{ json: "en", js: "en", typ: "" },
		{ json: "de", js: "de", typ: "" },
		{ json: "es", js: "es", typ: "" },
		{ json: "fr", js: "fr", typ: "" },
		{ json: "it", js: "it", typ: "" },
		{ json: "pl", js: "pl", typ: "" },
		{ json: "ro", js: "ro", typ: "" },
		{ json: "hu", js: "hu", typ: "" },
		{ json: "nl", js: "nl", typ: "" },
		{ json: "pt", js: "pt", typ: "" },
		{ json: "sv", js: "sv", typ: "" },
		{ json: "vi", js: "vi", typ: "" },
		{ json: "tr", js: "tr", typ: "" },
		{ json: "ru", js: "ru", typ: "" },
		{ json: "ja", js: "ja", typ: "" },
		{ json: "zh", js: "zh", typ: "" },
		{ json: "zh-tw", js: "zh-tw", typ: "" },
		{ json: "ko", js: "ko", typ: "" },
		{ json: "ar", js: "ar", typ: "" },
		{ json: "th", js: "th", typ: "" },
		{ json: "id", js: "id", typ: "" },
	], false),
	"Image": o([
		{ json: "thumb", js: "thumb", typ: "" },
		{ json: "small", js: "small", typ: "" },
		{ json: "large", js: "large", typ: "" },
	], false),
	"Links": o([
		{ json: "homepage", js: "homepage", typ: a("") },
		{ json: "blockchain_site", js: "blockchain_site", typ: a("") },
		{ json: "official_forum_url", js: "official_forum_url", typ: a("") },
		{ json: "chat_url", js: "chat_url", typ: a("") },
		{ json: "announcement_url", js: "announcement_url", typ: a("") },
		{ json: "twitter_screen_name", js: "twitter_screen_name", typ: "" },
		{ json: "facebook_username", js: "facebook_username", typ: "" },
		{ json: "bitcointalk_thread_identifier", js: "bitcointalk_thread_identifier", typ: null },
		{ json: "telegram_channel_identifier", js: "telegram_channel_identifier", typ: "" },
		{ json: "subreddit_url", js: "subreddit_url", typ: null },
		{ json: "repos_url", js: "repos_url", typ: r("ReposURL") },
	], false),
	"ReposURL": o([
		{ json: "github", js: "github", typ: a("any") },
		{ json: "bitbucket", js: "bitbucket", typ: a("any") },
	], false),
	"MarketData": o([
		{ json: "current_price", js: "current_price", typ: m(3.14) },
		{ json: "total_value_locked", js: "total_value_locked", typ: null },
		{ json: "mcap_to_tvl_ratio", js: "mcap_to_tvl_ratio", typ: null },
		{ json: "fdv_to_tvl_ratio", js: "fdv_to_tvl_ratio", typ: null },
		{ json: "roi", js: "roi", typ: null },
		{ json: "ath", js: "ath", typ: m(3.14) },
		{ json: "ath_change_percentage", js: "ath_change_percentage", typ: m(3.14) },
		{ json: "ath_date", js: "ath_date", typ: m(Date) },
		{ json: "atl", js: "atl", typ: m(3.14) },
		{ json: "atl_change_percentage", js: "atl_change_percentage", typ: m(3.14) },
		{ json: "atl_date", js: "atl_date", typ: m(Date) },
		{ json: "market_cap", js: "market_cap", typ: m(3.14) },
		{ json: "market_cap_rank", js: "market_cap_rank", typ: 0 },
		{ json: "fully_diluted_valuation", js: "fully_diluted_valuation", typ: m(3.14) },
		{ json: "total_volume", js: "total_volume", typ: m(3.14) },
		{ json: "high_24h", js: "high_24h", typ: m(3.14) },
		{ json: "low_24h", js: "low_24h", typ: m(3.14) },
		{ json: "price_change_24h", js: "price_change_24h", typ: 3.14 },
		{ json: "price_change_percentage_24h", js: "price_change_percentage_24h", typ: 3.14 },
		{ json: "price_change_percentage_7d", js: "price_change_percentage_7d", typ: 3.14 },
		{ json: "price_change_percentage_14d", js: "price_change_percentage_14d", typ: 3.14 },
		{ json: "price_change_percentage_30d", js: "price_change_percentage_30d", typ: 3.14 },
		{ json: "price_change_percentage_60d", js: "price_change_percentage_60d", typ: 3.14 },
		{ json: "price_change_percentage_200d", js: "price_change_percentage_200d", typ: 3.14 },
		{ json: "price_change_percentage_1y", js: "price_change_percentage_1y", typ: 3.14 },
		{ json: "market_cap_change_24h", js: "market_cap_change_24h", typ: 0 },
		{ json: "market_cap_change_percentage_24h", js: "market_cap_change_percentage_24h", typ: 3.14 },
		{ json: "price_change_24h_in_currency", js: "price_change_24h_in_currency", typ: m(3.14) },
		{ json: "price_change_percentage_1h_in_currency", js: "price_change_percentage_1h_in_currency", typ: m(3.14) },
		{ json: "price_change_percentage_24h_in_currency", js: "price_change_percentage_24h_in_currency", typ: m(3.14) },
		{ json: "price_change_percentage_7d_in_currency", js: "price_change_percentage_7d_in_currency", typ: m(3.14) },
		{ json: "price_change_percentage_14d_in_currency", js: "price_change_percentage_14d_in_currency", typ: m(3.14) },
		{ json: "price_change_percentage_30d_in_currency", js: "price_change_percentage_30d_in_currency", typ: m(3.14) },
		{ json: "price_change_percentage_60d_in_currency", js: "price_change_percentage_60d_in_currency", typ: m(3.14) },
		{ json: "price_change_percentage_200d_in_currency", js: "price_change_percentage_200d_in_currency", typ: m(3.14) },
		{ json: "price_change_percentage_1y_in_currency", js: "price_change_percentage_1y_in_currency", typ: m(3.14) },
		{ json: "market_cap_change_24h_in_currency", js: "market_cap_change_24h_in_currency", typ: m(3.14) },
		{ json: "market_cap_change_percentage_24h_in_currency", js: "market_cap_change_percentage_24h_in_currency", typ: m(3.14) },
		{ json: "total_supply", js: "total_supply", typ: 3.14 },
		{ json: "max_supply", js: "max_supply", typ: 0 },
		{ json: "circulating_supply", js: "circulating_supply", typ: 3.14 },
		{ json: "last_updated", js: "last_updated", typ: Date },
	], false),
	"Platforms": o([
		{ json: "ethereum", js: "ethereum", typ: "" },
		{ json: "binance-smart-chain", js: "binance-smart-chain", typ: "" },
	], false),
	"PublicInterestStats": o([
		{ json: "alexa_rank", js: "alexa_rank", typ: 0 },
		{ json: "bing_matches", js: "bing_matches", typ: null },
	], false),
};
