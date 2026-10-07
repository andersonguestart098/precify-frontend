import type { CatalogMaterial, CatalogProduct, CatalogSku, CatalogSkuValue } from "../domain/search";

/** Accent and case insensitive text used by the searchable filters. */
export function foldText(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");
}

/** Natural order for hierarchical codes: 1.1.2 before 1.1.10, P0009 before P0010. */
export function compareCodes(a: string, b: string) {
  return a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" });
}

export function sortMaterials(materials: CatalogMaterial[]) {
  return [...materials].sort((a, b) => compareCodes(a.materialCode, b.materialCode));
}

export function formatSkuValue(value: CatalogSkuValue) {
  const text = value.value ?? "";
  if (!value.unit || text.toLocaleLowerCase("pt-BR") === value.unit.toLocaleLowerCase("pt-BR")) return text;
  return `${text} ${value.unit}`;
}

/** Up to {@code limit} attribute chips from the product's SKUs, without repeating the same attribute/value. */
export function productHighlights(product: CatalogProduct, limit = 4) {
  const seen = new Set<string>();
  const result: { label: string; value: string }[] = [];
  for (const sku of product.skus) {
    for (const value of sku.values ?? []) {
      const display = formatSkuValue(value);
      const key = `${value.attribute}:${display}`;
      if (!display || seen.has(key)) continue;
      seen.add(key);
      result.push({ label: value.attribute, value: display });
      if (result.length >= limit) return result;
    }
  }
  return result;
}

export function skuSummary(sku: CatalogSku) {
  return sku.presentation || sku.commercialUnitDetail || sku.commercialUnit || "";
}

export function productUnits(product: CatalogProduct) {
  return [...new Set(product.skus.map(sku => sku.commercialUnit).filter((unit): unit is string => Boolean(unit)))];
}

export function coverageLabel(coverage?: string | null) {
  if (!coverage) return null;
  const upper = coverage.toLocaleUpperCase("pt-BR");
  if (upper.startsWith("COMPLETA") || upper.startsWith("INTEGRAL")) return "Documentação completa";
  if (upper === "PARCIAL") return "Documentação parcial";
  return coverage.charAt(0) + coverage.slice(1).toLocaleLowerCase("pt-BR");
}

export function productSubtitle(product: CatalogProduct) {
  return [product.brand, product.model].filter(Boolean).join(" · ");
}
