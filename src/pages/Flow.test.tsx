import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import * as api from "../services/api";
import type { CatalogMaterial, Product } from "../domain/search";
vi.mock("../services/api", async importOriginal => {
  const actual = await importOriginal<typeof import("../services/api")>();
  return { ...actual, currentUser: vi.fn(), authenticate: vi.fn(), getCatalog: vi.fn(), searchProducts: vi.fn(),
    searchFavorites: vi.fn(), productDetail: vi.fn(), favoriteCodes: vi.fn(), saveFavorite: vi.fn(), listUsers: vi.fn() };
});
const account: api.Account = { id: "admin@example.test", email: "admin@example.test", name: "Anderson", role: "ADMIN" };
const material: CatalogMaterial = {
  materialCode: "1.1.1", segmentCode: "1", segmentName: "Agregados", familyCode: "1.1", familyName: "Areias",
  materialName: "Areia fina", status: "EM_REVISÃO", observation: "Material de construção",
  variations: [{ variationCode: "v1", name: "Unidade", type: "UNIDADE", requirement: "SIM", order: 1,
    options: [{ optionCode: "m3", name: "m³", order: 1, status: "" }, { optionCode: "kg", name: "kg", order: 2, status: "" }, { optionCode: "t", name: "t", order: 3, status: "" }] }],
};
function product(id: string, option: string, value: number): Product {
  return { id, name: "Areia por " + option, brand: "Marca " + option, model: "Modelo", materialCode: "1.1.1",
    material: "Areia", familyCode: "1.1", category: "Areias", segmentCode: "1", segment: "Agregados",
    description: "Descrição " + option, imageUrl: "https://example.test/" + option + ".png", supplierLogoUrl: "",
    attributes: { Unidade: option }, createdAt: "", updatedAt: "",
    variations: [{ variationCode: "v1", optionCode: option, label: option, quote: { value, supplier: "Fornecedor " + option, region: "RS", date: "2026-09-06" } }] };
}
function validSession() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { user: account, accessToken: "header." + btoa(JSON.stringify({ exp })) + ".signature", expiresAt: new Date(exp * 1000).toISOString() };
}
beforeEach(() => {
  sessionStorage.clear(); localStorage.clear(); window.history.replaceState(null, "", "/");
  window.scrollTo = vi.fn();
  vi.mocked(api.currentUser).mockResolvedValue(account);
  vi.mocked(api.authenticate).mockResolvedValue(validSession());
  vi.mocked(api.favoriteCodes).mockResolvedValue([]);
  vi.mocked(api.saveFavorite).mockResolvedValue({ favorite: true });
  vi.mocked(api.getCatalog).mockResolvedValue([material]);
  vi.mocked(api.searchProducts).mockResolvedValue({ content: [{ material, offers: [] }], page: 0, size: 10, totalElements: 1, totalPages: 1 });
  vi.mocked(api.searchFavorites).mockResolvedValue({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  vi.mocked(api.productDetail).mockResolvedValue({ material, products: [product("p1", "m3", 92), product("p2", "kg", 120)] });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe("Fluxo autenticado PRECIFY", () => {
  it("bloqueia link direto e retorna ao produto depois de autenticar", async () => {
    window.history.replaceState(null, "", "/produtos/1.1.1");
    render(<App />);
    await screen.findByRole("heading", { name: "Bem-vindo de volta" });
    expect(api.productDetail).not.toHaveBeenCalled();
    expect(screen.queryByText("Visitante")).toBeNull();
    fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: "admin@example.test" } });
    fireEvent.change(screen.getByLabelText(/^Senha/), { target: { value: "test-only-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await screen.findByRole("heading", { name: "Areia por m3" });
    expect(window.location.pathname).toBe("/produtos/1.1.1");
    expect(api.authenticate).toHaveBeenCalledWith("admin@example.test", "test-only-password");
  });
  it("troca variação, preço, fornecedor e imagem sem manter preço de opção sem cotação", async () => {
    sessionStorage.setItem("precify-token", validSession().accessToken);
    window.history.replaceState(null, "", "/produtos/1.1.1");
    render(<App />);
    await screen.findByRole("heading", { name: "Areia por m3" });
    fireEvent.click(screen.getByRole("button", { name: "kg" }));
    await screen.findByRole("heading", { name: "Areia por kg" });
    expect(screen.getByRole("status", { name: "Cotação atual" }).textContent).toContain("120,00");
    expect(screen.getByRole("img", { name: "Areia por kg" }).getAttribute("src")).toContain("/kg.png");
    expect(screen.getByText("Fornecedor kg")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "t" }));
    expect(screen.getByRole("status", { name: "Cotação atual" }).textContent).toContain("Cotação pendente");
    expect(screen.queryByText("Fornecedor kg")).toBeNull();
  });
  it("valida sessão no reload e redireciona ao login quando expira", async () => {
    sessionStorage.setItem("precify-token", validSession().accessToken);
    window.history.replaceState(null, "", "/produtos/1.1.1");
    render(<App />);
    await screen.findByRole("heading", { name: "Areia por m3" });
    expect(api.currentUser).toHaveBeenCalled();
    act(() => window.dispatchEvent(new Event("precify-session-expired")));
    await screen.findByRole("heading", { name: "Bem-vindo de volta" });
    expect(sessionStorage.getItem("precify-token")).toBeNull();
  });
  it("mantém favoritos nos filtros e abre detalhes por uma rota própria", async () => {
    sessionStorage.setItem("precify-token", validSession().accessToken);
    window.history.replaceState(null, "", "/busca");
    render(<App />);
    await screen.findByRole("link", { name: "Ver detalhes" });
    expect(screen.queryByRole("button", { name: "Todos" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Meus favoritos" })).toBeNull();
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Exibir" }));
    fireEvent.click(await screen.findByRole("option", { name: "Meus favoritos" }));
    await waitFor(() => expect(api.searchFavorites).toHaveBeenCalled());
    expect(window.location.search).toContain("scope=favorites");
  });
  it("favorita com estrela e não oferece administração para USER", async () => {
    vi.mocked(api.currentUser).mockResolvedValue({ ...account, role: "USER" });
    sessionStorage.setItem("precify-token", validSession().accessToken);
    window.history.replaceState(null, "", "/produtos/1.1.1");
    render(<App />);
    await screen.findByRole("heading", { name: "Areia por m3" });
    const star = screen.getByRole("button", { name: "Adicionar aos favoritos" });
    await waitFor(() => expect(star.hasAttribute("disabled")).toBe(false));
    fireEvent.click(star);
    await screen.findByRole("button", { name: "Remover dos favoritos" });
    expect(api.saveFavorite).toHaveBeenCalledWith("1.1.1", true);
    expect(screen.queryByRole("button", { name: /Editar fotos/ })).toBeNull();
  });
});
