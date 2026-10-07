import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Chip, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { ProtectedImage } from "./ProtectedImage";
import { AddToCompositionDialog } from "./AddToCompositionDialog";
import { SegmentMaterialPlaceholder } from "./SegmentMaterialPlaceholder";
import { coverageLabel, productHighlights, productSubtitle, productUnits, skuSummary } from "../data/catalogProduct";
import type { CatalogMaterial, CatalogProduct, ProductSearchResult } from "../domain/search";

const chipSx = { height: { xs: 19, md: 20, xl: 22 }, fontSize: { xs: 8.8, md: 9.5, xl: 10 } } as const;

/** Result card for a catalog product (last level of the hierarchy). */
export function CatalogProductCard({ result, material, layout = "single", favorite = false, favoriteBusy = false, onFavorite }: {
  result: ProductSearchResult & { product: CatalogProduct };
  material?: CatalogMaterial;
  layout?: "single" | "mosaic" | "list";
  favorite?: boolean;
  favoriteBusy?: boolean;
  onFavorite?: () => void;
}) {
  const location = useLocation();
  const [compositionOpen, setCompositionOpen] = useState(false);
  const { product } = result;
  const photo = product.imageUrl || result.materialImageUrl;
  const subtitle = productSubtitle(product);
  const highlights = productHighlights(product, layout === "single" ? 4 : 2);
  const units = productUnits(product);
  const coverage = coverageLabel(product.documentalCoverage);
  const firstSku = product.skus[0];
  const detailsTo = `/produto/${encodeURIComponent(product.productCode)}`;
  const linkState = { fromSearch: location.pathname + location.search };
  const breadcrumb = `${product.materialCode} · ${result.materialName ?? ""}`;

  const favoriteButton = <Tooltip title={favorite ? "Remover dos favoritos" : "Favoritar produto"}>
    <span>
      <IconButton aria-label={favorite ? "Remover produto dos favoritos" : "Favoritar produto"} aria-pressed={favorite}
        disabled={favoriteBusy || !onFavorite} onClick={onFavorite} size="small"
        sx={{
          width: 32, height: 32, bgcolor: favorite ? "#fff6d6" : "rgba(255,255,255,.94)", color: favorite ? "#b07800" : "#6f837c",
          border: "1px solid rgba(19,56,46,.08)", boxShadow: "0 2px 8px rgba(16,42,33,.08)",
          "&:hover": { bgcolor: favorite ? "#fff0bb" : "#fff", color: favorite ? "#a97000" : "#006b4f" },
        }}>
        {favorite ? <StarRoundedIcon fontSize="small" /> : <StarBorderRoundedIcon fontSize="small" />}
      </IconButton>
    </span>
  </Tooltip>;

  const image = (size: object) => <Box sx={{
    position: "relative", display: "grid", placeItems: "center", bgcolor: "#f6f8f7", borderRadius: "10px",
    border: "1px solid #edf1ef", overflow: "hidden", ...size,
  }}>
    <ProtectedImage src={photo} alt={product.name}
      fallback={<SegmentMaterialPlaceholder segmentCode={product.segmentCode} label={result.materialName ?? product.name} />}
      sx={{ width: "100%", height: "100%", bgcolor: "transparent", border: 0, p: .5, "& img": { objectFit: "contain" } }} />
  </Box>;

  const actions = <Stack direction="row" gap={.6} alignItems="center" flexWrap="wrap">
    <Button onClick={() => setCompositionOpen(true)} disabled={!material} startIcon={<PlaylistAddRoundedIcon />}
      variant="contained" disableElevation sx={{
        minHeight: { xs: 32, md: 30, xl: 34 }, px: { xs: 1, md: 1.1, xl: 1.3 }, borderRadius: 999, textTransform: "none",
        fontWeight: 850, fontSize: { xs: 10, md: 10, xl: 11.25 }, whiteSpace: "nowrap",
        background: "linear-gradient(105deg,#087458 0%,#078b67 100%)", boxShadow: "0 4px 11px rgba(0,107,79,.18)",
        "&:hover": { background: "linear-gradient(105deg,#075f49 0%,#087b5d 100%)" },
      }}>
      <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>Adicionar</Box>
      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Adicionar à composição</Box>
    </Button>
    <Button component={RouterLink} to={detailsTo} state={linkState} startIcon={<VisibilityOutlinedIcon />} sx={{
      minHeight: { xs: 32, md: 30, xl: 34 }, px: { xs: .9, md: .9, xl: 1.2 }, borderRadius: 999, textTransform: "none",
      fontWeight: 800, fontSize: { xs: 10, md: 10, xl: 11.25 }, color: "#1f5544", bgcolor: "#f1f7f5",
      border: "1px solid #dcebe6", whiteSpace: "nowrap", "&:hover": { bgcolor: "#e6f2ee" },
    }}>Ver detalhes</Button>
  </Stack>;

  const dialog = material && <AddToCompositionDialog open={compositionOpen} onClose={() => setCompositionOpen(false)}
    result={{ material, offers: [] }}
    product={{ productCode: product.productCode, name: product.name, unit: firstSku?.commercialUnit, imageUrl: photo }} />;

  if (layout === "list") return <>
    <Paper variant="outlined" sx={{ borderRadius: "10px", borderColor: "#e4ece9", px: { xs: .75, md: 1.2 }, py: .7 }}>
      <Box sx={{
        display: "grid", alignItems: "center", gap: { xs: .8, md: 1.2 },
        gridTemplateColumns: { xs: "46px minmax(0,1fr) auto", md: "52px minmax(0,2fr) minmax(0,1.1fr) 80px auto" },
      }}>
        {image({ width: { xs: 46, md: 52 }, height: { xs: 46, md: 52 } })}
        <Box minWidth={0}>
          <Typography color="primary" noWrap sx={{ fontSize: 10.5, fontWeight: 800 }}>{breadcrumb}</Typography>
          <Typography component="h2" noWrap sx={{ fontSize: { xs: 13, md: 14 }, fontWeight: 800, color: "#173f33" }}>{product.name}</Typography>
          <Typography noWrap color="text.secondary" sx={{ display: { md: "none" }, fontSize: 11 }}>{subtitle}</Typography>
        </Box>
        <Typography noWrap color="text.secondary" sx={{ display: { xs: "none", md: "block" }, fontSize: 12.5 }}>{subtitle || "—"}</Typography>
        <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: 12, fontWeight: 700, color: "#2c6652" }}>
          {product.skus.length} SKU{product.skus.length > 1 ? "s" : ""}
        </Typography>
        <Stack direction="row" gap={.4} alignItems="center">
          {favoriteButton}
          <IconButton component={RouterLink} to={detailsTo} state={linkState} aria-label={`Ver detalhes de ${product.name}`} size="small"
            sx={{ color: "#1f5544", bgcolor: "#f1f7f5", border: "1px solid #dcebe6" }}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
    {dialog}
  </>;

  const mosaic = layout === "mosaic";
  return <>
    <Paper variant="outlined" sx={{
      display: "grid", overflow: "hidden", borderRadius: { xs: "12px", md: "14px", xl: "18px" }, borderColor: "#e4ece9",
      gridTemplateColumns: mosaic ? "1fr" : { xs: "112px minmax(0,1fr)", sm: "160px minmax(0,1fr)", md: "150px minmax(0,1fr)", xl: "190px minmax(0,1fr)" },
      boxShadow: "0 1px 4px rgba(19,56,46,.025)", height: "100%",
    }}>
      <Box sx={{ position: "relative", p: { xs: .8, md: 1, xl: 1.4 }, borderRight: mosaic ? 0 : "1px solid #edf1ef", borderBottom: mosaic ? "1px solid #edf1ef" : 0 }}>
        {image({ width: "100%", height: mosaic ? { xs: 110, sm: 140, md: 160, xl: 190 } : { xs: 104, sm: 140, md: 128, xl: 160 } })}
        <Box sx={{ position: "absolute", left: { xs: 6, md: 8 }, bottom: { xs: 6, md: 8 } }}>{favoriteButton}</Box>
      </Box>
      <Stack justifyContent="space-between" gap={{ xs: .8, md: .8, xl: 1.1 }} sx={{ minWidth: 0, p: { xs: 1.05, md: 1.25, xl: 1.7 } }}>
        <Box minWidth={0}>
          <Typography color="primary" noWrap title={`${result.segmentName ?? ""} › ${result.familyName ?? ""} › ${result.materialName ?? ""}`}
            sx={{ fontSize: { xs: 9.8, md: 10.5, xl: 11.5 }, fontWeight: 800, letterSpacing: ".01em" }}>
            {breadcrumb}
          </Typography>
          <Typography component="h2" sx={{
            mt: .2, fontSize: mosaic ? { xs: 12.5, sm: 14, md: 15, xl: 17 } : { xs: 14.2, sm: 16.5, md: 15.5, xl: 18 },
            lineHeight: 1.2, fontWeight: 800, letterSpacing: "-.015em", color: "#173f33",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{product.name}</Typography>
          {subtitle && <Typography color="text.secondary" noWrap sx={{ mt: .3, fontSize: { xs: 10.5, md: 11.5, xl: 12.5 } }}>{subtitle}</Typography>}
          <Stack direction="row" gap={.4} flexWrap="wrap" mt={{ xs: .6, md: .6, xl: .85 }}>
            <Chip size="small" label={`${product.skus.length} SKU${product.skus.length > 1 ? "s" : ""}`} sx={{ ...chipSx, bgcolor: "#eef7f4", color: "#2c6652", fontWeight: 700 }} />
            {units.slice(0, 2).map(unit => <Chip key={unit} size="small" variant="outlined" label={unit} sx={{ ...chipSx, borderColor: "#dce6e2", color: "#526861" }} />)}
            {coverage && !mosaic && <Chip size="small" variant="outlined" label={coverage} sx={{ ...chipSx, borderColor: "#dce6e2", color: "#526861" }} />}
            <Chip size="small" label="Sem cotação" sx={{ ...chipSx, bgcolor: "#f4f6f5", color: "#6d7f78" }} />
          </Stack>
          {highlights.length > 0 && <Stack component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: { xs: .7, md: .8 } }} gap={.25}>
            {highlights.map(item => <Typography component="li" key={`${item.label}:${item.value}`} noWrap sx={{ fontSize: { xs: 10.5, md: 11.5, xl: 12.5 }, color: "#3f5a51" }}>
              <Box component="span" sx={{ color: "#7c8f88" }}>{item.label}: </Box>{item.value}
            </Typography>)}
          </Stack>}
          {!mosaic && firstSku && skuSummary(firstSku) && <Typography color="text.secondary" sx={{
            mt: .6, fontSize: { xs: 10.5, md: 11, xl: 12 }, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{skuSummary(firstSku)}</Typography>}
        </Box>
        {actions}
      </Stack>
    </Paper>
    {dialog}
  </>;
}
