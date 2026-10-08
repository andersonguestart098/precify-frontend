import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Alert, Box, Breadcrumbs, Button, Chip, CircularProgress, Container, Divider, IconButton, Link, Paper, Stack, Typography } from "@mui/material";
import { catalogProduct } from "../services/api";
import { loadCatalogCached, getCachedCatalog } from "../services/appWarmCache";
import { useWorkspaceFavorites } from "../hooks/useWorkspaceFavorites";
import { formatSkuValue, productSubtitle, skuSummary } from "../data/catalogProduct";
import { AddToCompositionDialog } from "../components/AddToCompositionDialog";
import { ProtectedImage } from "../components/ProtectedImage";
import { SegmentMaterialPlaceholder } from "../components/SegmentMaterialPlaceholder";
import type { CatalogMaterial, CatalogProduct } from "../domain/search";

type InfoRow = [string, string | null | undefined];

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return <Typography id={id} variant="h6" fontWeight={850} mb={1.5} color="#173f33">{children}</Typography>;
}

function InfoList({ id, title, rows, footer }: { id: string; title: string; rows: InfoRow[]; footer?: React.ReactNode }) {
  return <Box component="section" aria-labelledby={id} minWidth={0}>
    <SectionTitle id={id}>{title}</SectionTitle>
    <Box component="dl" sx={{ m: 0 }}>
      {rows.map(([label, value], index) => <Box key={label} sx={{
        display: "grid",
        gridTemplateColumns: "minmax(110px,.75fr) minmax(0,1.25fr)",
        gap: 2,
        py: 1.05,
        borderTop: index ? "1px solid #edf1ef" : 0,
      }}>
        <Typography component="dt" variant="body2" fontWeight={750} color="#294d41">{label}</Typography>
        <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: "anywhere", color: value ? "text.secondary" : "#a3b0ab" }}>
          {value || "Não informado"}
        </Typography>
      </Box>)}
    </Box>
    {footer}
  </Box>;
}

export default function CatalogProductPage() {
  const { code = "" } = useParams();
  const location = useLocation();
  const fromSearch = (location.state as { fromSearch?: string } | null)?.fromSearch;
  const back = fromSearch?.startsWith("/produtos") ? fromSearch : "/produtos";
  const favorites = useWorkspaceFavorites();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [catalog, setCatalog] = useState<CatalogMaterial[]>(() => getCachedCatalog() ?? []);
  const [error, setError] = useState("");
  const [skuCode, setSkuCode] = useState("");
  const [compositionOpen, setCompositionOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setProduct(null); setError(""); setSkuCode("");
    catalogProduct(code, controller.signal).then(setProduct)
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    loadCatalogCached().then(setCatalog).catch(() => undefined);
    return () => controller.abort();
  }, [code]);

  const material = useMemo(() => catalog.find(item => item.materialCode === product?.materialCode), [catalog, product?.materialCode]);

  if (error) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert><Button component={RouterLink} to={back}>Voltar à busca</Button></Container>;
  if (!product) return <Box py={10} textAlign="center"><CircularProgress aria-label="Carregando produto" /></Box>;

  const sku = product.skus.find(item => item.skuCode === skuCode) ?? product.skus[0];
  const photo = product.imageUrl || material?.imageUrl;
  const favorite = favorites.favorites.PRODUCT.has(product.productCode);
  const favoriteBusy = favorites.loading || favorites.isBusy("PRODUCT", product.productCode);
  const specs = sku?.values ?? [];
  const identification: InfoRow[] = sku ? [
    ["SKU", sku.skuCode],
    ["SKU do fabricante", sku.manufacturerSku],
    ["GTIN/EAN", sku.gtin],
    ["Unidade comercial", sku.commercialUnitDetail || sku.commercialUnit],
  ] : [];
  const origin: InfoRow[] = [
    ["Marca", product.brand],
    ["Fabricante", product.manufacturer],
    ["Linha / modelo", product.model],
    ["Classificação", [material?.segmentName, material?.familyName, material?.materialName].filter(Boolean).join(" › ")],
  ];

  return <Container component="main" maxWidth={false} sx={{
    width: "100%",
    maxWidth: { xs: "100%", md: 980, lg: 1060, xl: 1200 },
    mx: "auto",
    py: { xs: 1.5, md: 3, xl: 4 },
    px: { xs: 2, sm: 3, md: 2.5, xl: 3 },
  }}>
    <Button component={RouterLink} to={back} startIcon={<ArrowBackIcon />} sx={{
      display: { xs: "none", md: "inline-flex" }, mb: 1.25, px: .5, textTransform: "none", fontWeight: 750,
    }}>Voltar à busca</Button>

    <Breadcrumbs sx={{ display: { xs: "none", sm: "flex" }, mb: { sm: 2.25, md: 3 }, fontSize: 13 }}>
      <Link component={RouterLink} to="/produtos" underline="hover">Produtos</Link>
      {material && <Typography variant="caption">{material.familyName}</Typography>}
      <Link component={RouterLink} to={`/produtos/${encodeURIComponent(product.materialCode)}`} underline="hover" variant="caption">
        {material?.materialName ?? product.materialCode}
      </Link>
    </Breadcrumbs>

    {favorites.error && <Alert severity="error" sx={{ mb: 2 }}>{favorites.error}</Alert>}

    <Paper variant="outlined" sx={{
      borderRadius: { xs: 0, sm: 4 },
      p: { xs: 0, sm: 2.5, md: 3, xl: 4 },
      borderColor: { xs: "transparent", sm: "#e1e7e5" },
      bgcolor: { xs: "transparent", sm: "#fff" },
      boxShadow: { xs: "none", sm: "0 10px 34px rgba(19,56,46,.045)" },
    }}>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "minmax(0,.98fr) minmax(0,1.02fr)" }} gap={{ xs: 2.25, md: 3, lg: 3.5, xl: 5 }}>
        <Box minWidth={0}>
          <Box sx={{
            bgcolor: "#f4f6f5",
            borderRadius: { xs: 3, sm: 3.5 },
            minHeight: { xs: 285, sm: 360, md: 330, lg: 350, xl: 440 },
            display: "grid",
            placeItems: "center",
            p: { xs: 2.25, sm: 3 },
            border: "1px solid #edf1ef",
          }}>
            <ProtectedImage
              src={photo}
              alt={product.name}
              fallback={<SegmentMaterialPlaceholder segmentCode={product.segmentCode} label={material?.materialName ?? product.name} variant="detail" />}
              sx={{ width: "100%", height: { xs: 240, sm: 300, md: 275, lg: 295, xl: 380 }, borderRadius: 2.5, bgcolor: "transparent", border: 0 }}
            />
          </Box>
        </Box>

        <Box minWidth={0} sx={{ pt: { md: .5 } }}>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>Código {product.productCode}</Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="start" gap={1.25}>
            <Box minWidth={0} flex={1}>
              <Typography component="h1" sx={{
                fontWeight: 900,
                fontSize: { xs: 28, sm: 32, md: 29, lg: 31, xl: 36 },
                letterSpacing: "-.04em",
                lineHeight: 1.08,
                background: "linear-gradient(112deg,#13382e,#006b4f 70%,#269b78)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{product.name}</Typography>
              <Typography color="text.secondary" sx={{ mt: .85, fontSize: { xs: 14.5, md: 13.5, lg: 14, xl: 15.5 } }}>
                {productSubtitle(product) || material?.materialName}
              </Typography>
            </Box>

            <IconButton
              aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              aria-pressed={favorite}
              loading={favoriteBusy}
              disabled={favoriteBusy}
              onClick={() => void favorites.toggle("PRODUCT", product.productCode)}
              sx={{
                mt: -.5,
                width: 42,
                height: 42,
                flexShrink: 0,
                color: favorite ? "#b77b00" : "#60756d",
                bgcolor: favorite ? "#fff6d7" : "#f3f7f5",
                border: "1px solid",
                borderColor: favorite ? "#ead07d" : "#dfe9e5",
                "&:hover": { bgcolor: favorite ? "#ffefb3" : "#eaf3f0" },
              }}
            >{favorite ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}</IconButton>
          </Stack>

          <Stack direction="row" gap={.75} flexWrap="wrap" mt={1.5}>
            <Chip label={`${product.skus.length} SKU${product.skus.length > 1 ? "s" : ""}`} size="small" variant="outlined" />
            {material && <Chip label={material.materialName} size="small" sx={{ bgcolor: "#eef6f3", color: "#315c4d" }} />}
          </Stack>

          <Box sx={{ py: { xs: 2.5, md: 2.25, xl: 3 } }} aria-label="Cotação atual">
            <Typography sx={{ fontSize: { xs: 22, md: 24 }, fontWeight: 850, color: "#173f33" }}>Cotação pendente</Typography>
            <Typography variant="body2" color="text.secondary" mt={.35}>Não há cotação cadastrada para este produto.</Typography>
          </Box>

          {product.skus.length > 1 && <Box component="section" aria-label="SKUs do produto" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#70847d", mb: 1.15 }}>Escolha um SKU</Typography>
            <Box role="group" aria-label="SKUs" sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", sm: "repeat(3,minmax(0,1fr))", md: "repeat(2,minmax(0,1fr))" }, gap: 1 }}>
              {product.skus.map(item => {
                const selected = item.skuCode === sku?.skuCode;
                return <Button
                  key={item.skuCode}
                  variant="outlined"
                  aria-pressed={selected}
                  endIcon={selected ? <CheckRoundedIcon /> : undefined}
                  onClick={() => setSkuCode(item.skuCode)}
                  sx={{
                    minHeight: { xs: 46, md: 40, xl: 46 },
                    px: 1.25,
                    borderRadius: { xs: 1.15, md: 1.25 },
                    justifyContent: "center",
                    fontSize: 12.5,
                    fontWeight: selected ? 800 : 600,
                    textTransform: "none",
                    color: selected ? "#fff" : "#405d53",
                    bgcolor: selected ? "#006b4f" : "#fff",
                    borderColor: selected ? "#006b4f" : "#d8e4e0",
                    boxShadow: selected ? "0 5px 14px rgba(0,107,79,.16)" : "none",
                    "&:hover": { bgcolor: selected ? "#075c47" : "#f2f7f5", borderColor: "#006b4f" },
                  }}
                >{item.commercialUnitDetail || item.commercialUnit || item.skuCode}</Button>;
              })}
            </Box>
          </Box>}

          <Button
            onClick={() => setCompositionOpen(true)}
            disabled={!material}
            startIcon={<PlaylistAddRoundedIcon />}
            variant="contained"
            disableElevation
            sx={{
              minHeight: 42, px: 2, borderRadius: 999, textTransform: "none", fontWeight: 850,
              background: "linear-gradient(105deg,#087458 0%,#078b67 100%)",
              boxShadow: "0 4px 11px rgba(0,107,79,.18)",
              "&:hover": { background: "linear-gradient(105deg,#075f49 0%,#087b5d 100%)" },
            }}
          >Adicionar à composição</Button>
        </Box>
      </Box>

      <Divider sx={{ my: { xs: 3.5, md: 4.5 } }} />

      <Box component="section" aria-labelledby="specs-title">
        <SectionTitle id="specs-title">Especificações técnicas</SectionTitle>
        {specs.length ? <Box component="dl" sx={{
          m: 0,
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", sm: "repeat(3,minmax(0,1fr))", lg: "repeat(4,minmax(0,1fr))" },
          gap: { xs: 1, md: 1.25 },
        }}>
          {specs.map(value => <Box key={value.variationCode} sx={{
            p: { xs: 1.5, md: 1.75 }, borderRadius: 2.5, bgcolor: "#f6f9f8", border: "1px solid #e7efec", minWidth: 0,
          }}>
            <Typography component="dt" sx={{ fontSize: 11, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "#7e8f89" }}>
              {value.attribute}
            </Typography>
            <Typography component="dd" sx={{ m: 0, mt: .4, fontSize: { xs: 15.5, md: 16.5 }, fontWeight: 800, color: "#173f33", overflowWrap: "anywhere" }}>
              {formatSkuValue(value)}
              {value.qualifier && <Box component="span" sx={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6c7f78" }}>{value.qualifier}</Box>}
            </Typography>
          </Box>)}
        </Box> : <Typography color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
          {(sku && skuSummary(sku)) || "Especificações ainda não documentadas para este produto."}
        </Typography>}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,minmax(0,1fr))" }, gap: { xs: 3.5, md: 5 }, mt: { xs: 4, md: 5 } }}>
        <InfoList id="origin-title" title="Marca e classificação" rows={origin} />
        {sku && <InfoList id="identification-title" title="Identificação" rows={identification} footer={sku.sourceUrl &&
          <Link href={sku.sourceUrl} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: .5, mt: 1.25 }}>
            Ver fonte do fabricante <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
          </Link>} />}
      </Box>

      {material?.observation && <Box component="section" aria-labelledby="notes-title" sx={{ mt: { xs: 4, md: 5 } }}>
        <SectionTitle id="notes-title">Observações</SectionTitle>
        <Typography color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{material.observation}</Typography>
      </Box>}
    </Paper>

    {material && <AddToCompositionDialog open={compositionOpen} onClose={() => setCompositionOpen(false)}
      result={{ material, offers: [] }}
      product={{ productCode: product.productCode, name: product.name, unit: sku?.commercialUnit, imageUrl: photo }} />}
  </Container>;
}
