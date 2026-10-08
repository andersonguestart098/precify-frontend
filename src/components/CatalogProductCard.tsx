import { CatalogResultCard } from "./CatalogResultCard";
import type { CatalogMaterial, CatalogProduct, ProductSearchResult } from "../domain/search";

/** Result card for a catalog product (last level of the hierarchy), in the same layout as the material card. */
export function CatalogProductCard({ result, material, layout = "single", favorite = false, favoriteBusy = false, onFavorite }: {
  result: ProductSearchResult & { product: CatalogProduct };
  material?: CatalogMaterial;
  layout?: "single" | "mosaic" | "list";
  favorite?: boolean;
  favoriteBusy?: boolean;
  onFavorite?: () => void;
}) {
  const { product } = result;
  // The search already brings the hierarchy names, so the card renders before the catalog finishes loading.
  const parent: CatalogMaterial = material ?? {
    materialCode: product.materialCode, segmentCode: product.segmentCode, familyCode: product.familyCode,
    segmentName: result.segmentName ?? "", familyName: result.familyName ?? "", materialName: result.materialName ?? "",
    status: "", observation: "", variations: [], imageUrl: result.materialImageUrl,
  };
  return <CatalogResultCard result={{ material: parent, offers: [] }} product={product} layout={layout}
    favorite={favorite} favoriteBusy={favoriteBusy} onFavorite={onFavorite} />;
}
