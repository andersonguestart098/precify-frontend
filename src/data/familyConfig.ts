import type { CatalogMaterial, TechnicalCriterion } from "../domain/search";

export const stateOptions = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;
export const priceOptions = ["Até R$ 100", "R$ 100 a R$ 150", "R$ 150 a R$ 200", "Acima de R$ 200"] as const;

export function createCatalogCriteria(segmentCode = ""): TechnicalCriterion[] {
  return [
    { key: "segmentCode", label: "Segmento", value: segmentCode, mode: "REQUIRED", operator: "EXACT", weight: 1 },
    { key: "materialCode", label: "Material", value: "", mode: "REQUIRED", operator: "EXACT", weight: 1 },
    { key: "optionCode", label: "Opção", value: "", mode: "REQUIRED", operator: "EXACT", weight: 1 },
    { key: "price", label: "Preço", value: "", mode: "REQUIRED", operator: "EXACT", weight: 1 },
    { key: "state", label: "Estado", value: "", mode: "REQUIRED", operator: "EXACT", weight: 1 },
  ];
}

export function uniqueBy<T>(items: T[], key: (item: T) => string) {
  return [...new Map(items.map((item) => [key(item), item])).values()];
}

export function materialByCode(catalog: CatalogMaterial[], code: string) {
  return catalog.find((material) => material.materialCode === code);
}
