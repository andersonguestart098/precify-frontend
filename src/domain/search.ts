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
