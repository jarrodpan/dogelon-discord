namespace APIResponse {
	export interface CoinGeckoCoins {
		coins: CoinDetails[];
	}

	export namespace CoinGeckoCoins {
		export interface CoinDetails {
			id?: string;
			symbol?: string;
			name?: string;
		}
	}
}
