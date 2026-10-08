import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CatalogProductCard } from "./CatalogProductCard";
import { SearchableFilter } from "./SearchableFilter";
import { compareCodes, productHighlights } from "../data/catalogProduct";
import type { CatalogProduct, ProductSearchResult } from "../domain/search";

vi.mock("../auth/session", () => ({ useAccount: () => ({ id: "u1", name: "Usuário", email: "u1@precify.test", role: "USER", active: true }) }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const product: CatalogProduct = {
  productCode: "1.1.1.P0022", materialCode: "1.1.1", familyCode: "1.1", segmentCode: "1",
  name: "Areia fina natural de Jacareí", brand: "JRCAMPEÃO", documentalCoverage: "PARCIAL",
  skus: [{
    skuCode: "1.1.1.P0022.S0001", commercialUnit: "saco", presentation: "saco de 20 kg",
    values: [
      { variationCode: "1.1.1.V01", attribute: "Unidade de comercialização", value: "kg", unit: "kg" },
      { variationCode: "1.1.1.V02", attribute: "Formato de fornecimento", value: "Saco 20 kg" },
    ],
  }],
};
const result: ProductSearchResult & { product: CatalogProduct } = { type: "PRODUCT", product, materialName: "Areia fina natural", familyName: "Areias", segmentName: "Agregados" };

describe("Produtos do catálogo (último nível)", () => {
  it("mostra o produto com hierarquia, SKUs e link para o detalhe", () => {
    render(<MemoryRouter><CatalogProductCard result={result} layout="single" /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Areia fina natural de Jacareí" })).toBeTruthy();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "1.1.1.P0022 · Areia fina natural")).toBeTruthy();
    expect(screen.getByText("JRCAMPEÃO")).toBeTruthy();
    expect(screen.getByText("1 SKU")).toBeTruthy();
    expect(screen.getByText("Sem cotação")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Ver detalhes/ }).getAttribute("href")).toBe("/produto/1.1.1.P0022");
    expect(screen.getByText("Cotação pendente")).toBeTruthy();
  });

  it("não repete unidade quando o valor já é a própria unidade", () => {
    expect(productHighlights(product)).toEqual([
      { label: "Unidade de comercialização", value: "kg" },
      { label: "Formato de fornecimento", value: "Saco 20 kg" },
    ]);
  });

  it("filtra materiais por código ou nome, sem acento", () => {
    const onChange = vi.fn();
    render(<SearchableFilter label="Material" placeholder="Buscar" icon={null} value="" emptyText="Nada" onChange={onChange}
      options={[
        { code: "1.1.1", hint: "1.1.1", name: "Areia fina natural", count: 1 },
        { code: "1.1.2", hint: "1.1.2", name: "Areia média natural", count: 7 },
        { code: "30.1.1", hint: "30.1.1", name: "Cabo de rede", count: 0 },
      ]} />);
    const input = screen.getByRole("combobox", { name: "Material" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "media" } });
    const list = screen.getByRole("listbox");
    expect(within(list).getAllByRole("option")).toHaveLength(1);
    fireEvent.click(within(list).getByText("Areia média natural"));
    expect(onChange).toHaveBeenCalledWith("1.1.2");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "30.1" } });
    expect(within(screen.getByRole("listbox")).getByText("Cabo de rede")).toBeTruthy();
  });

  it("ordena códigos hierárquicos de forma natural", () => {
    expect(["1.1.10", "1.1.2", "1.1.1"].sort(compareCodes)).toEqual(["1.1.1", "1.1.2", "1.1.10"]);
  });
});
