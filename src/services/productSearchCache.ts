import { searchCatalogProducts } from "./api";
import type { ProductSearchPage } from "../domain/search";

export interface ProductSearchKey {
  query: string; familyCode: string; segmentCode: string; materialCode: string;
  brand: string; page: number; onlyFavorites: boolean; revision: number;
}

export const PRODUCT_PAGE_SIZE = 10;

/** In-memory results per search, so returning to the Produtos tab paints instantly. */
export const productResponseCache = new Map<string, ProductSearchPage>();

export const productSearchKey = (key: ProductSearchKey) => JSON.stringify(key);

const DEFAULT_KEY = productSearchKey({
  query: "", familyCode: "", segmentCode: "", materialCode: "", brand: "", page: 0, onlyFavorites: false, revision: 0,
});

let defaultPrefetch: Promise<void> | null = null;

/** Loads the unfiltered first page in the background, ahead of the first visit to Produtos. */
export function prefetchDefaultProducts() {
  if (productResponseCache.has(DEFAULT_KEY) || defaultPrefetch) return;
  defaultPrefetch = searchCatalogProducts({}, 0, PRODUCT_PAGE_SIZE)
    .then(data => { if (!productResponseCache.has(DEFAULT_KEY)) productResponseCache.set(DEFAULT_KEY, data); })
    .catch(() => undefined)
    .finally(() => { defaultPrefetch = null; });
}
