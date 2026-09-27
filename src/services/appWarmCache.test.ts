import { describe, expect, it, vi } from "vitest";
import * as api from "./api";
import { warmAppCache } from "./appWarmCache";

vi.mock("./api", () => ({
  getCatalog: vi.fn(), searchProducts: vi.fn(), listProjects: vi.fn(),
  listCompositions: vi.fn(), favoriteCodes: vi.fn(),
}));

describe("aquecimento da navegação", () => {
  it("abre o início após carregar o catálogo sem esperar os dados das outras telas", async () => {
    let catalogReady!: (value: Awaited<ReturnType<typeof api.getCatalog>>) => void;
    const catalog = new Promise<Awaited<ReturnType<typeof api.getCatalog>>>(resolve => { catalogReady = resolve; });
    vi.mocked(api.getCatalog).mockReturnValue(catalog);
    vi.mocked(api.searchProducts).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.listProjects).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.listCompositions).mockImplementation(() => new Promise(() => {}));
    vi.mocked(api.favoriteCodes).mockImplementation(() => new Promise(() => {}));

    const ready = warmAppCache("warm-cache-test", "/inicio");
    expect(api.listProjects).not.toHaveBeenCalled();
    catalogReady([]);
    await ready;

    expect(api.listProjects).toHaveBeenCalledOnce();
    expect(api.listCompositions).toHaveBeenCalledOnce();
    expect(api.searchProducts).toHaveBeenCalledOnce();
  });
});
