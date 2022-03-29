export namespace APIResponses {
	export interface BinanceNewCryptocurrency {
		code?: string;
		message?: null;
		messageDetail?: null;
		data?: Data;
		success?: boolean;
	}

	export namespace BinanceNewCryptocurrency {
		export interface Data {
			catalogs?: Catalog[];
		}

		export namespace Data {
			export interface Catalog {
				catalogId?: number;
				parentCatalogId?: null;
				icon?: string;
				catalogName?: string;
				description?: null;
				catalogType?: number;
				total?: number;
				articles?: Article[];
				catalogs?: any[];
			}
			export namespace Catalog {
				export interface Article {
					id?: number;
					code?: string;
					title?: string;
					type?: number;
					releaseDate?: number;
				}
			}
		}
	}
}
