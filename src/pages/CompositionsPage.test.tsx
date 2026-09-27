import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CompositionsPage from "./CompositionsPage";
import { SessionContext } from "../auth/session";
import type { Composition } from "../domain/composition";
import type { CatalogResult } from "../domain/search";
import * as api from "../services/api";

vi.mock("../services/api", async importOriginal => {
  const actual = await importOriginal<typeof import("../services/api")>();
  return { ...actual, listCompositions: vi.fn(), listProjects: vi.fn(), searchProducts: vi.fn(),
    addCompositionItem: vi.fn(), saveProject: vi.fn(), workspaceFavorites: vi.fn() };
});

const composition: Composition = { id: "c1", name: "Materiais cozinha", total: 0, items: [], createdAt: "", updatedAt: "" };
const result: CatalogResult = {
  material: { materialCode: "1.1.1", segmentCode: "1", segmentName: "Agregados", familyCode: "1.1",
    familyName: "Areias", materialName: "Areia fina natural", status: "ACTIVE", observation: "", variations: [] },
  offers: [{ productId: "pr1", name: "Areia fina natural", brand: "Marca A", model: "Fina",
    quote: { value: 25, supplier: "Fornecedor A", region: "RS", date: "" } }],
};

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Adicionar produtos à composição", () => {
  it("busca e inclui o produto sem sair da composição da obra", async () => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.mocked(api.listProjects).mockResolvedValue([{ id: "p1", name: "Obra Anderson", compositionIds: ["c1"] }]);
    vi.mocked(api.listCompositions).mockResolvedValue([composition]);
    vi.mocked(api.workspaceFavorites).mockResolvedValue({ WORK: [], LABOR: [], COMPOSITION: [] });
    vi.mocked(api.searchProducts).mockResolvedValue({ content: [result], page: 0, size: 8, totalElements: 1, totalPages: 1 });
    vi.mocked(api.addCompositionItem).mockResolvedValue({ ...composition, total: 25,
      items: [{ id: "i1", materialCode: "1.1.1", productId: "pr1", name: "Areia fina natural",
        supplier: "Fornecedor A", unit: "un", quantity: 1, unitPrice: 25 }] });

    render(<SessionContext.Provider value={{
      user: { id: "composition-test", name: "Anderson", email: "demo@example.test", role: "ADMIN" },
      checking: false, error: null, signIn: vi.fn(), signOut: vi.fn(), retry: vi.fn(),
    }}><MemoryRouter initialEntries={["/composicoes?obra=p1&adicionar=1"]}>
      <Routes><Route path="/composicoes" element={<CompositionsPage />} /></Routes>
    </MemoryRouter></SessionContext.Provider>);

    await screen.findByText("Materiais cozinha");
    await screen.findByRole("textbox", { name: "Buscar produtos para esta composição" });
    await screen.findByRole("button", { name: "Adicionar Areia fina natural à composição" });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar Areia fina natural à composição" }));
    await waitFor(() => expect(api.addCompositionItem).toHaveBeenCalledWith("c1", expect.objectContaining({
      productId: "pr1", materialCode: "1.1.1", quantity: 1, unitPrice: 25,
    })));
    expect(await screen.findByRole("link", { name: "Areia fina natural" })).toBeTruthy();
    expect(screen.getByText("“Areia fina natural” adicionado à composição.")).toBeTruthy();
  });
});

describe("Vincular composição a obras", () => {
  it("adiciona e remove uma obra pelo mostruário sem sair da composição", async () => {
    vi.mocked(api.listProjects).mockResolvedValue([
      { id: "p1", name: "Obra Anderson", compositionIds: ["c1"] },
      { id: "p2", name: "Nova obra", compositionIds: [] },
    ]);
    vi.mocked(api.listCompositions).mockResolvedValue([composition]);
    vi.mocked(api.workspaceFavorites).mockResolvedValue({ WORK: [], LABOR: [], COMPOSITION: [] });
    vi.mocked(api.saveProject)
      .mockResolvedValueOnce({ id: "p2", name: "Nova obra", compositionIds: ["c1"] })
      .mockResolvedValueOnce({ id: "p2", name: "Nova obra", compositionIds: [] });

    render(<SessionContext.Provider value={{
      user: { id: "composition-work-test", name: "Anderson", email: "demo@example.test", role: "ADMIN" },
      checking: false, error: null, signIn: vi.fn(), signOut: vi.fn(), retry: vi.fn(),
    }}><MemoryRouter initialEntries={["/composicoes?obra=p1"]}>
      <Routes><Route path="/composicoes" element={<CompositionsPage />} /></Routes>
    </MemoryRouter></SessionContext.Provider>);

    fireEvent.click(await screen.findByText("Materiais cozinha"));
    fireEvent.click(await screen.findByRole("button", { name: "Adicionar composições a obras (1)" }));
    await screen.findByRole("textbox", { name: "Buscar obras para Materiais cozinha" });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar Materiais cozinha à obra Nova obra" }));
    await waitFor(() => expect(api.saveProject).toHaveBeenCalledWith(expect.objectContaining({ compositionIds: ["c1"] }), "p2"));
    fireEvent.click(await screen.findByRole("button", { name: "Remover Materiais cozinha da obra Nova obra" }));
    await waitFor(() => expect(api.saveProject).toHaveBeenCalledWith(expect.objectContaining({ compositionIds: [] }), "p2"));
  });
});
