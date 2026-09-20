import { createCatalogCriteria } from "../data/familyConfig";
import type { Composition } from "../domain/composition";
import type { CatalogMaterial, CatalogSearchPage } from "../domain/search";
import {
  favoriteCodes, getCatalog, getLaborPlan, listCompositions, listProjects, searchProducts,
  type LaborPlan, type Project,
} from "./api";

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

const projectsMemory = new Map<string, Project[]>();
const compositionsMemory = new Map<string, Composition[]>();
const favoritesMemory = new Map<string, string[]>();
const projectsRequests = new Map<string, Promise<Project[]>>();
const compositionsRequests = new Map<string, Promise<Composition[]>>();
const favoritesRequests = new Map<string, Promise<string[]>>();
const laborMemory = new Map<string, LaborPlan>();
const laborRequests = new Map<string, Promise<LaborPlan>>();

function userKey(userId: string, bucket: string) {
  return `precify-cache:user:${userId}:${bucket}:v1`;
}

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

function removeCache(key: string) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
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

export function loadCatalogCached(force = false) {
  if (!force) {
    const cached = getCachedCatalog();
    if (cached) return Promise.resolve(cached);
  }
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

export function loadInitialSearchCached(force = false) {
  if (!force) {
    const cached = getCachedInitialSearch();
    if (cached) return Promise.resolve(cached);
  }
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

export function getCachedProjects(userId: string) {
  if (!projectsMemory.has(userId)) {
    const cached = readCache<Project[]>(userKey(userId, "projects"));
    if (cached) projectsMemory.set(userId, cached);
  }
  return projectsMemory.get(userId) ?? null;
}

export function saveCachedProjects(userId: string, data: Project[]) {
  projectsMemory.set(userId, data);
  writeCache(userKey(userId, "projects"), data);
  return data;
}

export function loadProjectsCached(userId: string, force = false) {
  if (!force) {
    const cached = getCachedProjects(userId);
    if (cached) return Promise.resolve(cached);
  }
  const pending = projectsRequests.get(userId);
  if (pending) return pending;
  const request = listProjects()
    .then(data => saveCachedProjects(userId, data))
    .finally(() => { projectsRequests.delete(userId); });
  projectsRequests.set(userId, request);
  return request;
}

export function getCachedCompositions(userId: string) {
  if (!compositionsMemory.has(userId)) {
    const cached = readCache<Composition[]>(userKey(userId, "compositions"));
    if (cached) compositionsMemory.set(userId, cached);
  }
  return compositionsMemory.get(userId) ?? null;
}

export function saveCachedCompositions(userId: string, data: Composition[]) {
  compositionsMemory.set(userId, data);
  writeCache(userKey(userId, "compositions"), data);
  return data;
}

export function loadCompositionsCached(userId: string, force = false) {
  if (!force) {
    const cached = getCachedCompositions(userId);
    if (cached) return Promise.resolve(cached);
  }
  const pending = compositionsRequests.get(userId);
  if (pending) return pending;
  const request = listCompositions()
    .then(data => saveCachedCompositions(userId, data))
    .finally(() => { compositionsRequests.delete(userId); });
  compositionsRequests.set(userId, request);
  return request;
}

function laborKey(userId: string, projectId: string) {
  return userKey(userId, `labor:${projectId}`);
}

function laborMemoryKey(userId: string, projectId: string) {
  return `${userId}:${projectId}`;
}

export function getCachedLaborPlan(userId: string, projectId: string) {
  const memoryKey = laborMemoryKey(userId, projectId);
  if (!laborMemory.has(memoryKey)) {
    const cached = readCache<LaborPlan>(laborKey(userId, projectId));
    if (cached) laborMemory.set(memoryKey, cached);
  }
  return laborMemory.get(memoryKey) ?? null;
}

export function saveCachedLaborPlan(userId: string, projectId: string, data: LaborPlan) {
  const memoryKey = laborMemoryKey(userId, projectId);
  laborMemory.set(memoryKey, data);
  writeCache(laborKey(userId, projectId), data);
  return data;
}

export function loadLaborPlanCached(userId: string, projectId: string, force = false) {
  if (!force) {
    const cached = getCachedLaborPlan(userId, projectId);
    if (cached) return Promise.resolve(cached);
  }
  const memoryKey = laborMemoryKey(userId, projectId);
  const pending = laborRequests.get(memoryKey);
  if (pending) return pending;
  const request = getLaborPlan(projectId)
    .then(data => saveCachedLaborPlan(userId, projectId, data))
    .finally(() => { laborRequests.delete(memoryKey); });
  laborRequests.set(memoryKey, request);
  return request;
}

export function clearCachedLaborPlan(userId: string, projectId: string) {
  laborMemory.delete(laborMemoryKey(userId, projectId));
  removeCache(laborKey(userId, projectId));
}

export function getCachedFavoriteCodes(userId: string) {
  if (!favoritesMemory.has(userId)) {
    const cached = readCache<string[]>(userKey(userId, "favorites"));
    if (cached) favoritesMemory.set(userId, cached);
  }
  return favoritesMemory.get(userId) ?? null;
}

export function saveCachedFavoriteCodes(userId: string, data: string[]) {
  favoritesMemory.set(userId, data);
  writeCache(userKey(userId, "favorites"), data);
  return data;
}

export function loadFavoriteCodesCached(userId: string, force = false) {
  if (!force) {
    const cached = getCachedFavoriteCodes(userId);
    if (cached) return Promise.resolve(cached);
  }
  const pending = favoritesRequests.get(userId);
  if (pending) return pending;
  const request = favoriteCodes()
    .then(data => saveCachedFavoriteCodes(userId, data))
    .finally(() => { favoritesRequests.delete(userId); });
  favoritesRequests.set(userId, request);
  return request;
}

export async function warmAppCache(userId: string) {
  await Promise.allSettled([
    loadCatalogCached(),
    loadInitialSearchCached(),
    loadProjectsCached(userId),
    loadCompositionsCached(userId),
    loadFavoriteCodesCached(userId),
  ]);
}

export async function refreshAppCache(userId: string) {
  await Promise.allSettled([
    loadCatalogCached(true),
    loadInitialSearchCached(true),
    loadProjectsCached(userId, true),
    loadCompositionsCached(userId, true),
    loadFavoriteCodesCached(userId, true),
  ]);
  window.dispatchEvent(new CustomEvent("precify-app-data-refreshed", { detail: { userId, refreshedAt: Date.now() } }));
}

export function clearUserWarmCache(userId: string) {
  projectsMemory.delete(userId);
  compositionsMemory.delete(userId);
  favoritesMemory.delete(userId);
  for (const key of [...laborMemory.keys()]) {
    if (key.startsWith(`${userId}:`)) laborMemory.delete(key);
  }
  removeCache(userKey(userId, "projects"));
  removeCache(userKey(userId, "compositions"));
  removeCache(userKey(userId, "favorites"));
}
