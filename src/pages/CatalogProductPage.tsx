import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Alert, Box, Breadcrumbs, Button, Chip, Container, Link, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { catalogProduct } from "../services/api";
import { loadCatalogCached, getCachedCatalog } from "../services/appWarmCache";
import { useWorkspaceFavorites } from "../hooks/useWorkspaceFavorites";
import { coverageLabel, formatSkuValue, productSubtitle } from "../data/catalogProduct";
import { AddToCompositionDialog } from "../components/AddToCompositionDialog";
import { ProtectedImage } from "../components/ProtectedImage";
import { SegmentMaterialPlaceholder } from "../components/SegmentMaterialPlaceholder";
import type { CatalogMaterial, CatalogProduct, CatalogSku } from "../domain/search";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const formatDate = (value?: string | null) => value ? dateFormat.format(new Date(`${value}T00:00:00Z`)) : null;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <Box minWidth={0}>
    <Typography sx={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "#7e8f89" }}>{label}</Typography>
    <Typography component="div" sx={{ fontSize: 13.5, color: "#1f3d33", mt: .2, overflowWrap: "anywhere" }}>{children}</Typography>
  </Box>;
}

function SkuCard({ sku }: { sku: CatalogSku }) {
  return <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, borderColor: "#e4ece9" }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
      <Box minWidth={0}>
        <Typography color="primary" sx={{ fontSize: 11.5, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{sku.skuCode}</Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#173f33", mt: .2, whiteSpace: "pre-line" }}>
          {sku.presentation || sku.commercialUnitDetail || sku.commercialUnit || "Apresentação não informada"}
        </Typography>
      </Box>
      {sku.commercialUnit && <Chip size="small" label={sku.commercialUnit} sx={{ alignSelf: "flex-start", bgcolor: "#eef7f4", color: "#2c6652", fontWeight: 700 }} />}
    </Stack>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, minmax(0,1fr))" }, gap: 1.5, mt: 1.5 }}>
      <Field label="SKU do fabricante">{sku.manufacturerSku || "—"}</Field>
      <Field label="GTIN/EAN">{sku.gtin || "—"}</Field>
      <Field label="Unidade comercial">{sku.commercialUnitDetail || sku.commercialUnit || "—"}</Field>
      <Field label="Consultado em">{formatDate(sku.consultedAt) || "—"}</Field>
    </Box>
    {Boolean(sku.values?.length) && <Box component="dl" sx={{
      m: 0, mt: 1.75, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(160px,.8fr) minmax(0,1.2fr)" },
      columnGap: 2, rowGap: .6, p: 1.25, bgcolor: "#f7faf9", border: "1px solid #e7efec", borderRadius: 2,
    }}>
      {sku.values!.map(value => <Box key={value.variationCode} sx={{ display: "contents" }}>
        <Typography component="dt" sx={{ fontSize: 12.5, color: "#6c7f78" }}>{value.attribute}</Typography>
        <Typography component="dd" sx={{ m: 0, fontSize: 13, fontWeight: 700, color: "#1f3d33" }}>
          {formatSkuValue(value)}{value.qualifier ? <Box component="span" sx={{ fontWeight: 400, color: "#6c7f78" }}> · {value.qualifier}</Box> : null}
        </Typography>
      </Box>)}
    </Box>}
    <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" mt={1.25}>
      {Boolean(sku.pendingVariationCodes?.length) && <Typography sx={{ fontSize: 11.5, color: "#8a6d1f" }}>
        {sku.pendingVariationCodes!.length} campo{sku.pendingVariationCodes!.length > 1 ? "s" : ""} técnico{sku.pendingVariationCodes!.length > 1 ? "s" : ""} ainda sem documentação
      </Typography>}
      {sku.sourceUrl && <Link href={sku.sourceUrl} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: .4 }}>
        Fonte do SKU <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
      </Link>}
    </Stack>
  </Paper>;
}

export default function CatalogProductPage() {
  const { code = "" } = useParams();
  const location = useLocation();
  const backTo = (location.state as { fromSearch?: string } | null)?.fromSearch ?? "/produtos";
  const favorites = useWorkspaceFavorites();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [catalog, setCatalog] = useState<CatalogMaterial[]>(() => getCachedCatalog() ?? []);
  const [error, setError] = useState("");
  const [compositionOpen, setCompositionOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setProduct(null); setError("");
    catalogProduct(code, controller.signal).then(setProduct)
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    loadCatalogCached().then(setCatalog).catch(() => undefined);
    return () => controller.abort();
  }, [code]);

  const material = useMemo(() => catalog.find(item => item.materialCode === product?.materialCode), [catalog, product?.materialCode]);
  const favorite = favorites.favorites.PRODUCT.has(code);

  if (error) return <Container maxWidth="lg" sx={{ py: 4 }}>
    <Alert severity="error" action={<Button component={RouterLink} to={backTo}>Voltar</Button>}>{error}</Alert>
  </Container>;
  if (!product) return <Container maxWidth="lg" sx={{ py: 4 }}>
    <Skeleton variant="text" width={240} /><Skeleton variant="text" width="60%" height={48} /><Skeleton variant="rounded" height={220} sx={{ mt: 2 }} />
  </Container>;

  const coverage = coverageLabel(product.documentalCoverage);
  const photo = product.imageUrl || material?.imageUrl;
  return <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3.5 }, px: { xs: 2, sm: 3 } }}>
    <Button component={RouterLink} to={backTo} startIcon={<ArrowBackRoundedIcon />} sx={{ textTransform: "none", mb: 1.5, color: "#2f5c4c" }}>
      Voltar aos resultados
    </Button>
    <Breadcrumbs sx={{ fontSize: 12.5, "& .MuiBreadcrumbs-li": { minWidth: 0 } }}>
      {material && <Typography sx={{ fontSize: 12.5, color: "#6c7f78" }}>{material.segmentName}</Typography>}
      {material && <Typography sx={{ fontSize: 12.5, color: "#6c7f78" }}>{material.familyName}</Typography>}
      <Link component={RouterLink} to={`/produtos/${encodeURIComponent(product.materialCode)}`} sx={{ fontSize: 12.5, fontWeight: 700 }}>
        {product.materialCode}{material ? ` · ${material.materialName}` : ""}
      </Link>
    </Breadcrumbs>

    <Paper variant="outlined" sx={{ mt: 1.5, p: { xs: 1.75, md: 2.5 }, borderRadius: 4, borderColor: "#e4ece9" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0,1fr)", md: "220px minmax(0,1fr)" }, gap: { xs: 1.75, md: 2.5 } }}>
        <Box sx={{ height: { xs: 170, sm: 180, md: 220 }, borderRadius: 3, bgcolor: "#f6f8f7", border: "1px solid #edf1ef", display: "grid", placeItems: "center", overflow: "hidden" }}>
          <ProtectedImage src={photo} alt={product.name}
            fallback={<SegmentMaterialPlaceholder segmentCode={product.segmentCode} label={material?.materialName ?? product.name} />}
            sx={{ width: "100%", height: "100%", bgcolor: "transparent", border: 0, p: 1, "& img": { objectFit: "contain" } }} />
        </Box>
        <Stack gap={1.25} minWidth={0}>
          <Box>
            <Typography color="primary" sx={{ fontSize: 12, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{product.productCode}</Typography>
            <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, lineHeight: 1.15, fontWeight: 850, letterSpacing: "-.02em", color: "#173f33", mt: .3 }}>
              {product.name}
            </Typography>
            {productSubtitle(product) && <Typography color="text.secondary" sx={{ mt: .5, fontSize: 14.5 }}>{productSubtitle(product)}</Typography>}
          </Box>
          <Stack direction="row" gap={.6} flexWrap="wrap">
            <Chip size="small" label={`${product.skus.length} SKU${product.skus.length > 1 ? "s" : ""}`} sx={{ bgcolor: "#eef7f4", color: "#2c6652", fontWeight: 700 }} />
            {coverage && <Chip size="small" variant="outlined" label={coverage} sx={{ borderColor: "#dce6e2", color: "#526861" }} />}
            <Chip size="small" label="Sem cotação" sx={{ bgcolor: "#f4f6f5", color: "#6d7f78" }} />
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, minmax(0,1fr))" }, gap: 1.5 }}>
            <Field label="Marca">{product.brand || "—"}</Field>
            <Field label="Fabricante">{product.manufacturer || "—"}</Field>
            <Field label="Linha / modelo">{product.model || "—"}</Field>
            <Field label="Consultado em">{formatDate(product.consultedAt) || "—"}</Field>
            {product.sourceUrl && <Field label="Fonte"><Link href={product.sourceUrl} target="_blank" rel="noopener noreferrer"
              sx={{ display: "inline-flex", alignItems: "center", gap: .4 }}>Abrir fonte <OpenInNewRoundedIcon sx={{ fontSize: 14 }} /></Link></Field>}
          </Box>
          <Stack direction="row" gap={1} flexWrap="wrap" mt={.5}>
            <Button variant="contained" disableElevation startIcon={<PlaylistAddRoundedIcon />} disabled={!material} onClick={() => setCompositionOpen(true)}
              sx={{ borderRadius: 999, textTransform: "none", fontWeight: 850, background: "linear-gradient(105deg,#087458 0%,#078b67 100%)" }}>
              Adicionar à composição
            </Button>
            <Button startIcon={favorite ? <StarRoundedIcon /> : <StarBorderRoundedIcon />} aria-pressed={favorite}
              disabled={favorites.loading || favorites.isBusy("PRODUCT", product.productCode)}
              onClick={() => { void favorites.toggle("PRODUCT", product.productCode); }}
              sx={{ borderRadius: 999, textTransform: "none", fontWeight: 800, color: favorite ? "#a97000" : "#1f5544", bgcolor: favorite ? "#fff6d6" : "#f1f7f5" }}>
              {favorite ? "Favorito" : "Favoritar"}
            </Button>
          </Stack>
          {favorites.error && <Alert severity="error">{favorites.error}</Alert>}
        </Stack>
      </Box>
    </Paper>

    <Typography component="h2" sx={{ mt: 3, mb: 1.25, fontSize: { xs: 17, md: 19 }, fontWeight: 850, color: "#173f33" }}>
      SKUs ({product.skus.length})
    </Typography>
    <Stack gap={1.25}>{product.skus.map(sku => <SkuCard key={sku.skuCode} sku={sku} />)}</Stack>

    {material && <AddToCompositionDialog open={compositionOpen} onClose={() => setCompositionOpen(false)}
      result={{ material, offers: [] }}
      product={{ productCode: product.productCode, name: product.name, unit: product.skus[0]?.commercialUnit, imageUrl: photo }} />}
  </Container>;
}
