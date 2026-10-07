export type CriterionMode = "REQUIRED" | "PREFERRED";
export type CriterionOperator = "EXACT" | "MINIMUM" | "MAXIMUM";

export interface TechnicalCriterion { key: string; label: string; value: string; mode: CriterionMode; operator: CriterionOperator; weight: number; }
export interface Quote { value: number; supplier: string; date: string; region: string; }
export interface ProductVariation { variationCode: string; optionCode?: string | null; label?: string | null; quote: Quote; }
export interface Product {
  id: string; name: string; brand: string; model: string;
  segmentCode: string; segment: string; familyCode: string; category: string;
  materialCode: string; material: string; description: string;
  imageUrl?: string | null; supplierLogoUrl?: string | null;
  attributes: Record<string, string>; variations: ProductVariation[];
  createdAt: string; updatedAt: string;
}
export interface CatalogOption { optionCode: string; name: string; symbol?: string | null; order: number; status: string; }
export interface CatalogVariation { variationCode: string; name: string; type: string; requirement: string; order: number; options: CatalogOption[]; }
export interface CatalogMaterial {
  materialCode: string; segmentCode: string; segmentName: string; familyCode: string;
  familyName: string; materialName: string; status: string; observation: string;
  variations: CatalogVariation[]; imageUrl?: string | null; supplierLogoUrl?: string | null;
}
export interface CriterionComparison { key: string; label: string; expectedValue: string; actualValue: string; mode: CriterionMode; operator: CriterionOperator; weight: number; matched: boolean; }
export interface RankedProduct { product: Product; compatible: boolean; compatibility: number; matches: CriterionComparison[]; differences: CriterionComparison[]; }
export interface SearchRequest { familyCode: string; query: string; criteria: TechnicalCriterion[]; includeAlternatives: boolean; }
export interface SearchPageResponse { content: RankedProduct[]; page: number; size: number; totalElements: number; totalCompatibleElements: number; totalAlternativeElements: number; totalPages: number; numberOfElements: number; first: boolean; last: boolean; hasNext: boolean; hasPrevious: boolean; }
export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string };
export interface CatalogOffer {
  productId: string; name: string; brand: string; model: string;
  imageUrl?: string | null; supplierLogoUrl?: string | null; label?: string | null; optionCode?: string | null; quote: Quote;
}
export interface CatalogResult { material: CatalogMaterial; offers: CatalogOffer[]; featured?: boolean; imageUrl?: string | null; supplierLogoUrl?: string | null; }
export interface CatalogSearchPage {
  content: CatalogResult[]; page: number; size: number; totalElements: number; totalPages: number;
}

/** Catalog product (last level: Segmento > Família > Material > Produto > SKU). Documented data, no quotes. */
export interface CatalogSkuValue {
  variationCode: string; attribute: string; value?: string | null; numericValue?: number | null;
  dimensions?: number[] | null; unit?: string | null; optionCode?: string | null; qualifier?: string | null;
  originalValue?: string | null; sourceUrl?: string | null;
}
export interface CatalogSku {
  skuCode: string; sourceCode?: string | null; manufacturerSku?: string | null; gtin?: string | null;
  commercialUnit?: string | null; commercialUnitDetail?: string | null; presentation?: string | null;
  sourceUrl?: string | null; consultedAt?: string | null; pendingVariationCodes?: string[] | null;
  values?: CatalogSkuValue[] | null;
}
export interface CatalogProduct {
  productCode: string; sourceCode?: string | null; materialCode: string; familyCode: string; segmentCode: string;
  name: string; brand?: string | null; manufacturer?: string | null; model?: string | null;
  sourceUrl?: string | null; documentalCoverage?: string | null; consultedAt?: string | null;
  skus: CatalogSku[]; imageUrl?: string | null; active?: boolean | null;
}
export interface ProductSearchRequest {
  query?: string; segmentCode?: string; familyCode?: string; materialCode?: string; brand?: string; onlyFavorites?: boolean;
}
export interface ProductSearchResult {
  product: CatalogProduct; segmentName?: string | null; familyName?: string | null; materialName?: string | null;
  materialImageUrl?: string | null;
}
export interface ProductFacet { name: string; count: number; }
export interface ProductSearchPage {
  content: ProductSearchResult[]; page: number; size: number; totalElements: number; totalPages: number;
  brands: ProductFacet[]; materialCounts: Record<string, number>;
}
