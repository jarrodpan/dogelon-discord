namespace APIResponse {
	export interface BinanceNewCryptocurrency {
		code?: string;
		message?: null;
		messageDetail?: null;
		data?: Data;
		success?: boolean;
	}

	namespace BinanceNewCryptocurrency {
		export interface Data {
			catalogs?: Catalog[];
		}

		namespace Data {
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
			namespace Catalog {
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
