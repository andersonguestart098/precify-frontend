import type { Product, ProductVariation } from "./search";
export interface VariationSelection { variationCode: string; optionCode?: string; }
export function matchesSelection(variation: ProductVariation, selection: VariationSelection | null) {
  return !selection || (variation.variationCode === selection.variationCode && (!selection.optionCode || variation.optionCode === selection.optionCode));
}
export function detailOffers(products: Product[], selection: VariationSelection | null) {
  return products.flatMap(product => (product.variations ?? []).flatMap((variation, index) => {
    const q = variation.quote;
    return matchesSelection(variation, selection) && q && Number.isFinite(q.value) && q.value > 0 && q.supplier?.trim()
      && !q.supplier.toLocaleLowerCase("pt-BR").includes("a definir")
      ? [{ key: `${product.id}:${index}`, product, variation }] : [];
  })).sort((a, b) => a.variation.quote.value - b.variation.quote.value);
}
export function formatDate(date?: string | null) {
  if (!date) return "Não informada";
  const parts = date.slice(0, 10).split("-");
  return parts.length === 3 ? parts.reverse().join("/") : "Não informada";
}
