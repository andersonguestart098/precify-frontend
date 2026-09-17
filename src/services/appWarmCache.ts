import { createCatalogCriteria } from "../data/familyConfig";
import type { CatalogMaterial, CatalogSearchPage } from "../domain/search";
import { getCatalog, searchProducts } from "./api";

type CacheEnvelope<T> = {
  savedAt: number;
  data: T;
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const CATALOG_CACHE_KEY = "precify-cache:catalog:v1";
const INITIAL_SEARCH_CACHE_KEY = "precify-cache:search:initial:v1";

let catalogMemory: CatalogMaterial[] | null = null;
let initialSearchMemory: CatalogSearchPage | null = null;
let catalogRequest: Promise<CatalogMaterial[]> | null = null;
let initialSearchRequest: Promise<CatalogSearchPage> | null = null;

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data } satisfies CacheEnvelope<T>));
  } catch {
    // Cache is an optimization only. Quota/privacy errors must not block the app.
  }
}

export function getCachedCatalog() {
  if (!catalogMemory) catalogMemory = readCache<CatalogMaterial[]>(CATALOG_CACHE_KEY);
  return catalogMemory;
}

export function saveCachedCatalog(data: CatalogMaterial[]) {
  catalogMemory = data;
  writeCache(CATALOG_CACHE_KEY, data);
  return data;
}

export function loadCatalogCached() {
  const cached = getCachedCatalog();
  if (cached) return Promise.resolve(cached);
  if (!catalogRequest) {
    catalogRequest = getCatalog()
      .then(saveCachedCatalog)
      .finally(() => { catalogRequest = null; });
  }
  return catalogRequest;
}

export function getCachedInitialSearch() {
  if (!initialSearchMemory) initialSearchMemory = readCache<CatalogSearchPage>(INITIAL_SEARCH_CACHE_KEY);
  return initialSearchMemory;
}

export function saveCachedInitialSearch(data: CatalogSearchPage) {
  initialSearchMemory = data;
  writeCache(INITIAL_SEARCH_CACHE_KEY, data);
  return data;
}

export function loadInitialSearchCached() {
  const cached = getCachedInitialSearch();
  if (cached) return Promise.resolve(cached);
  if (!initialSearchRequest) {
    initialSearchRequest = searchProducts({
      familyCode: "",
      query: "",
      criteria: createCatalogCriteria(""),
      includeAlternatives: false,
    }, 0, 10)
      .then(saveCachedInitialSearch)
      .finally(() => { initialSearchRequest = null; });
  }
  return initialSearchRequest;
}

export async function warmAppCache() {
  await Promise.allSettled([
    loadCatalogCached(),
    loadInitialSearchCached(),
  ]);
}
