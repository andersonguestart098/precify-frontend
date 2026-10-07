import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Alert, Box, ButtonBase, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { materialProducts } from "../services/api";
import { productSubtitle, skuSummary } from "../data/catalogProduct";
import type { CatalogProduct } from "../domain/search";

/** Children of a material (catalog products, last level), shown on the material page. */
export function MaterialProductsSection({ materialCode }: { materialCode: string }) {
  const location = useLocation();
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setProducts(null); setError("");
    materialProducts(materialCode, controller.signal).then(setProducts)
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [materialCode]);

  const skuCount = products?.reduce((total, item) => total + item.skus.length, 0) ?? 0;
  return <Paper component="section" variant="outlined" aria-labelledby="material-products-title"
    sx={{ mt: { xs: 2, md: 2.5 }, p: { xs: 1.5, md: 2.25 }, borderRadius: { xs: 3, md: 4 }, borderColor: "#e4ece9" }}>
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1} mb={1.25}>
      <Typography id="material-products-title" component="h2" sx={{ fontSize: { xs: 16, md: 18 }, fontWeight: 850, color: "#173f33" }}>
        Produtos deste material
      </Typography>
      {products && <Typography sx={{ fontSize: 12.5, color: "#6c7f78" }}>
        {products.length} produto{products.length === 1 ? "" : "s"} · {skuCount} SKU{skuCount === 1 ? "" : "s"}
      </Typography>}
    </Stack>
    {error && <Alert severity="error">{error}</Alert>}
    {!products && !error && <Stack gap={1}>{[0, 1, 2].map(index => <Skeleton key={index} variant="rounded" height={56} />)}</Stack>}
    {products && !products.length && <Typography sx={{ fontSize: 13.5, color: "#6c7f78" }}>
      Nenhum produto documentado para este material ainda.
    </Typography>}
    {products && products.length > 0 && <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, border: "1px solid #edf1ef", borderRadius: 2.5, overflow: "hidden" }}>
      {products.map((product, index) => <Box component="li" key={product.productCode} sx={{ borderTop: index ? "1px solid #edf1ef" : 0 }}>
        <ButtonBase component={RouterLink} to={`/produto/${encodeURIComponent(product.productCode)}`}
          state={{ fromSearch: location.pathname + location.search }}
          sx={{ width: "100%", justifyContent: "space-between", textAlign: "left", gap: 1.5, px: { xs: 1.25, md: 1.75 }, py: 1.1, "&:hover": { bgcolor: "#f6faf8" } }}>
          <Box minWidth={0}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#1d7a5e", fontVariantNumeric: "tabular-nums" }}>{product.productCode}</Typography>
            <Typography noWrap sx={{ fontSize: 14, fontWeight: 800, color: "#173f33" }}>{product.name}</Typography>
            <Typography noWrap sx={{ fontSize: 12, color: "#6c7f78" }}>
              {[productSubtitle(product), product.skus[0] ? skuSummary(product.skus[0]) : ""].filter(Boolean).join(" · ")}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" gap={.5} flexShrink={0}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#2c6652" }}>{product.skus.length} SKU{product.skus.length > 1 ? "s" : ""}</Typography>
            <ChevronRightRoundedIcon sx={{ color: "#8aa198" }} />
          </Stack>
        </ButtonBase>
      </Box>)}
    </Box>}
  </Paper>;
}
