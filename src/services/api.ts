import type { CatalogMaterial, Product, ProductInput, CatalogSearchPage, SearchRequest } from "../domain/search";
import type { Composition, CompositionItemInput } from "../domain/composition";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080/api").replace(/\/$/, "");

export interface Project { id: string; name: string; compositionIds: string[]; }
export interface SearchHistory { id: string; query: string; createdAt: string; }
export const listProjects = () => apiRequest<Project[]>("/planning/projects");
export const saveProject = (project: Omit<Project, "id">, id?: string) => apiRequest<Project>(`/planning/projects${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(project) });
export const deleteProject = async (id: string) => { await apiResponse(`/planning/projects/${id}`, { method: "DELETE" }); };
export const listHistory = () => apiRequest<SearchHistory[]>("/planning/history");
export const rememberSearch = (query: string) => apiRequest<SearchHistory>("/planning/history", { method: "POST", body: JSON.stringify({ query }) });
export const clearHistory = async () => { await apiResponse("/planning/history", { method: "DELETE" }); };

async function apiResponse(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const token = sessionStorage.getItem("precify-token");
  if (token && path !== "/auth/login") headers.set("Authorization", `Bearer ${token}`);
  const hostname = new URL(API_URL, window.location.origin).hostname;
  if (hostname.endsWith(".ngrok-free.app") || hostname.endsWith(".ngrok.app") || hostname.endsWith(".ngrok.io")) {
    headers.set("ngrok-skip-browser-warning", "true");
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/login")) {
      sessionStorage.removeItem("precify-token");
      window.dispatchEvent(new Event("precify-session-expired"));
    }
    const problem = await response.json().catch(() => null) as { detail?: string; message?: string } | null;
    throw new Error(problem?.detail ?? problem?.message ?? (response.status === 401 ? (path === "/auth/login" ? "E-mail ou senha inválidos." : "Sua sessão expirou. Entre novamente.") : response.status === 403 ? "Esta ação exige uma conta ADMIN." : `Erro HTTP ${response.status}`));
  }
  return response;
}
async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  return (await apiResponse(path, init)).json() as Promise<T>;
}

export function getCatalog(signal?: AbortSignal) {
  return apiRequest<CatalogMaterial[]>("/catalog", { signal });
}

export function searchProducts(request: SearchRequest, page = 0, size = 10, signal?: AbortSignal) {
  const payload = {
    ...request,
    criteria: request.criteria.filter((criterion) => criterion.value.trim() !== ""),
  };
  return apiRequest<CatalogSearchPage>(`/catalog/search?page=${page}&size=${size}`, {
    method: "POST", body: JSON.stringify(payload), signal,
  });
}

export function getProducts(signal?: AbortSignal) { return apiRequest<Product[]>("/products", { signal }); }
export function createProduct(product: ProductInput) {
  return apiRequest<Product>("/products", { method: "POST", body: JSON.stringify(product) });
}

export interface Account { id: string; name: string; email: string; role: "USER" | "ADMIN"; avatarUrl?: string; }
export interface AuthSession { accessToken: string; expiresAt: string; user: Account; }
export function authenticate(email: string, password: string) {
  return apiRequest<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}
export const currentUser = (signal?: AbortSignal) => apiRequest<Account>("/auth/me", { signal });
export const favoriteCodes = () => apiRequest<string[]>("/favorites");
export const saveFavorite = (code: string, favorite: boolean) =>
  apiRequest<{ favorite: boolean }>(`/favorites/${encodeURIComponent(code)}`, { method: "PUT", body: JSON.stringify({ favorite }) });
export function searchFavorites(request: SearchRequest, page: number, size: number, signal?: AbortSignal) {
  return apiRequest<CatalogSearchPage>(`/favorites/search?page=${page}&size=${size}`, {
    method: "POST", body: JSON.stringify({ ...request, criteria: request.criteria.filter(c => c.value.trim() !== "") }), signal,
  });
}
export async function uploadImage(file: File) {
  if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 5 * 1024 * 1024)
    throw new Error("Envie PNG ou JPEG de até 5 MB.");
  const body = new FormData(); body.append("file", file);
  return apiRequest<{ url: string }>("/media", { method: "POST", body });
}
export const updateProductImages = (id: string, images: { imageUrl?: string; supplierLogoUrl?: string }) =>
  apiRequest<Product>(`/products/${encodeURIComponent(id)}/images`, { method: "PATCH", body: JSON.stringify(images) });
export function imageAddress(src?: string | null) {
  if (!src) return undefined;
  if (src.startsWith("/api/media/")) return new URL(src, new URL(API_URL, window.location.origin)).href;
  return src;
}

export interface CatalogDetail { material: CatalogMaterial; products: Product[]; }
export const productDetail = (code: string, signal?: AbortSignal) =>
  apiRequest<CatalogDetail>(`/catalog/${encodeURIComponent(code)}/details`, { signal });
export const listUsers = (signal?: AbortSignal) => apiRequest<Account[]>("/users", { signal });
export const createUser = (user: { name: string; email: string; password: string; role: Account["role"]; avatarUrl?: string }) =>
  apiRequest<Account>("/users", { method: "POST", body: JSON.stringify(user) });
export function internalImagePath(src: string) {
  const base = new URL(API_URL, window.location.origin);
  const image = new URL(src, base);
  return image.origin === base.origin && image.pathname.startsWith("/api/media/") ? image.pathname.slice(4) : null;
}
export const imageBlob = async (path: string, signal: AbortSignal) => (await apiResponse(path, { signal })).blob();

export const updateUserAvatar = (id: string, avatarUrl: string) =>
  apiRequest<Account>(`/users/${encodeURIComponent(id)}/avatar`, { method: "PATCH", body: JSON.stringify({ avatarUrl }) });

export const listCompositions = (signal?: AbortSignal) =>
  apiRequest<Composition[]>("/compositions", { signal });
export const createComposition = (name: string) =>
  apiRequest<Composition>("/compositions", { method: "POST", body: JSON.stringify({ name }) });
export const renameComposition = (id: string, name: string) =>
  apiRequest<Composition>(`/compositions/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ name }) });
export const addCompositionItem = (compositionId: string, item: CompositionItemInput) =>
  apiRequest<Composition>(`/compositions/${encodeURIComponent(compositionId)}/items`, { method: "POST", body: JSON.stringify(item) });
export const updateCompositionItemQuantity = (compositionId: string, itemId: string, quantity: number) =>
  apiRequest<Composition>(`/compositions/${encodeURIComponent(compositionId)}/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH", body: JSON.stringify({ quantity }),
  });
export const removeCompositionItem = (compositionId: string, itemId: string) =>
  apiRequest<Composition>(`/compositions/${encodeURIComponent(compositionId)}/items/${encodeURIComponent(itemId)}`, { method: "DELETE" });
export const deleteComposition = async (id: string) => {
  await apiResponse(`/compositions/${encodeURIComponent(id)}`, { method: "DELETE" });
};
