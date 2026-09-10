import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { Alert, Box, Breadcrumbs, Button, Chip, CircularProgress, Container, Divider, IconButton, Link, Paper, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import { useAccount } from "../auth/session";
import { useFavorites } from "../hooks/useFavorites";
import { productDetail, type CatalogDetail } from "../services/api";
import { detailOffers, formatDate, matchesSelection, type VariationSelection } from "../domain/productDetails";
import type { CatalogOffer } from "../domain/search";
import { ProtectedImage } from "../components/ProtectedImage";
import { ProductImagesDialog } from "../components/ProductImagesDialog";
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export default function ProductPage() {
  const { code = "" } = useParams(); const location = useLocation();
  // Remount selection state when navigating directly between different products.
  return <ProductContent key={code} code={code} fromSearch={(location.state as { fromSearch?: string } | null)?.fromSearch} />;
}
function ProductContent({ code, fromSearch }: { code: string; fromSearch?: string }) {
  const user = useAccount(); const favorites = useFavorites();
  const [detail, setDetail] = useState<CatalogDetail | null>(null);
  const [selection, setSelection] = useState<VariationSelection | null>(null);
  const [offerKey, setOfferKey] = useState(""); const [imageOffer, setImageOffer] = useState<CatalogOffer | null>(null);
  const [revision, setRevision] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const back = fromSearch?.startsWith("/busca") ? fromSearch : "/busca";
  useEffect(() => {
    const c = new AbortController(); setLoading(true); setError("");
    productDetail(code, c.signal).then(data => { if (!c.signal.aborted) setDetail(data); })
      .catch(e => { if (!c.signal.aborted) setError(e.message); })
      .finally(() => { if (!c.signal.aborted) setLoading(false); });
    return () => c.abort();
  }, [code, revision]);
  if (loading) return <Box py={10} textAlign="center"><CircularProgress aria-label="Carregando produto" /></Box>;
  if (error || !detail) return <Container sx={{ py: 4 }}><Alert severity="error">{error || "Produto não encontrado."}</Alert><Button component={RouterLink} to={back}>Voltar à busca</Button></Container>;
  const { material, products } = detail;
  const offers = detailOffers(products, selection);
  const active = offers.find(offer => offer.key === offerKey) ?? offers[0];
  const product = active?.product ?? products.find(p => (p.variations ?? []).some(v => matchesSelection(v, selection)));
  const quote = active?.variation.quote;
  const select = (value: VariationSelection) => {
    setSelection(current => current?.variationCode === value.variationCode && current.optionCode === value.optionCode ? null : value);
    setOfferKey("");
  };
  const editImages = () => {
    if (!product) return;
    setImageOffer({ productId: product.id, name: product.name, brand: product.brand, model: product.model,
      imageUrl: product.imageUrl, supplierLogoUrl: product.supplierLogoUrl, label: active?.variation.label,
      optionCode: active?.variation.optionCode, quote: quote ?? { value: 0, supplier: "", region: "", date: "" } });
  };
  return <Container component="main" maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
    <Button component={RouterLink} to={back} startIcon={<ArrowBackIcon />} sx={{ mb: 1 }}>Voltar à busca</Button>
    <Breadcrumbs sx={{ mb: 3, fontSize: 13 }}><Link component={RouterLink} to="/busca" underline="hover">Produtos</Link><Typography variant="caption">{material.familyName}</Typography><Typography variant="caption">{material.materialName}</Typography></Breadcrumbs>
    {favorites.error && <Alert severity="error" sx={{ mb: 2 }}>{favorites.error}</Alert>}
    <Paper variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, borderColor: "#e1e7e3" }}>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1.1fr 1fr" }} gap={{ xs: 3, md: 5 }}>
        <Box minWidth={0}>
          <ProtectedImage src={product?.imageUrl || material.imageUrl} alt={product?.name ?? material.materialName} sx={{ width: "100%", height: { xs: 290, sm: 400 }, borderRadius: 3 }} />
          {user.role === "ADMIN" && product && <Button variant="outlined" fullWidth startIcon={<AddPhotoAlternateOutlinedIcon />} sx={{ mt: 2 }} onClick={editImages}>Editar fotos do produto e fornecedor</Button>}
          <Typography variant="caption" display="block" color="text.secondary" mt={1.5}>Código {material.materialCode}</Typography>
        </Box>
        <Box minWidth={0}>
          <Stack direction="row" justifyContent="space-between" alignItems="start" gap={1}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 26, md: 32 }, letterSpacing: "-.035em" }}>{product?.name ?? material.materialName}</Typography>
            <IconButton aria-label={favorites.codes.has(code) ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={favorites.codes.has(code)}
              loading={favorites.loading || favorites.busy.has(code)} disabled={favorites.loading || favorites.busy.has(code)} onClick={() => void favorites.toggle(code)}
              sx={{ color: favorites.codes.has(code) ? "#F4B400" : "#9CA3AF" }}><StarIcon /></IconButton>
          </Stack>
          <Typography color="text.secondary" mt={1}>{[product?.brand, product?.model].filter(Boolean).join(" · ") || material.familyName}</Typography>
          <Chip label={material.status.replaceAll("_", " ")} size="small" variant="outlined" sx={{ mt: 1.5 }} />
          <Box sx={{ py: 3 }} role="status" aria-label="Cotação atual" aria-live="polite">
            {quote ? <><Typography variant="caption" color="text.secondary">{offers.length > 1 && !offerKey ? "A partir de" : "Cotação selecionada"}</Typography>
              <Typography variant="h3" color="primary.dark" sx={{ fontSize: 36, fontWeight: 800 }}>{currency.format(quote.value)}</Typography>
              <Typography variant="body2" color="text.secondary">{active.variation.label} · {quote.region} · {formatDate(quote.date)}</Typography></> :
              <><Typography variant="h5" fontWeight={700}>Cotação pendente</Typography><Typography variant="body2" color="text.secondary">Não há cotação cadastrada para esta seleção.</Typography></>}
          </Box>
          <Divider />
          {material.variations.length > 0 && <Box component="section" aria-label="Características e opções" sx={{ my: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} color="primary.dark" mb={1.5}>Características e opções</Typography>
            <Box sx={{ border: "1px solid #e2ebe5", borderRadius: "18px", overflow: "hidden" }}>
              {material.variations.map(variation => <Box key={variation.variationCode} sx={{
                px: 2, py: 1.75, borderBottom: "1px solid #e8eee9", "&:last-child": { borderBottom: 0 },
                bgcolor: variation.options.length ? "#fff" : "#f8faf9"
              }}>
                {variation.options.length ? <>
                  <Typography variant="body2" fontWeight={600} color="#244f37" mb={1.25}>{variation.name}</Typography>
                  <Box role="group" aria-label={variation.name} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {variation.options.map(option => {
                      const selected = selection?.variationCode === variation.variationCode && selection.optionCode === option.optionCode;
                      return <Button key={option.optionCode} variant="outlined" aria-pressed={selected}
                        startIcon={selected ? <CheckRoundedIcon /> : undefined}
                        onClick={() => select({ variationCode: variation.variationCode, optionCode: option.optionCode })}
                        sx={{ borderRadius: "12px", minWidth: 64, minHeight: 44, px: 1.75, fontSize: 13,
                          fontWeight: selected ? 700 : 500, textTransform: "none",
                          color: selected ? "#176238" : "#53665b", bgcolor: selected ? "#eaf5ee" : "#fff",
                          borderColor: selected ? "#198a4a" : "#dce5df",
                          "&:hover": { bgcolor: "#f0f7f2", borderColor: "#198a4a" }
                        }}>{option.name}</Button>;
                    })}
                  </Box>
                </> : <Stack direction="row" alignItems="baseline" justifyContent="space-between" gap={2}>
                  <Typography variant="body2" fontWeight={600} color="#52665a">{variation.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: "right", flexShrink: 0 }}>Não informado</Typography>
                </Stack>}
              </Box>)}
            </Box>
            {selection && <Button size="small" startIcon={<RestartAltRoundedIcon />} sx={{ mt: 1, color: "#587062" }}
              onClick={() => { setSelection(null); setOfferKey(""); }}>Limpar seleção</Button>}
          </Box>}
          {!quote && material.supplierLogoUrl && <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 2, bgcolor: "#f0f7f2", borderRadius: 3 }}>
            <ProtectedImage src={material.supplierLogoUrl} alt="Logo cadastrada no material" sx={{ width: 64, height: 52, borderRadius: 2 }} />
            <Typography variant="body2" color="text.secondary">Fornecedor · cotação pendente</Typography>
          </Stack>}
          {quote && <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 2, bgcolor: "#f0f7f2", borderRadius: 3 }}>
            <ProtectedImage src={product?.supplierLogoUrl} alt={`Logo de ${quote.supplier}`} sx={{ width: 64, height: 52, borderRadius: 2, flexShrink: 0 }} />
            <Box><Typography variant="caption" color="text.secondary">Fornecedor</Typography><Typography fontWeight={700}>{quote.supplier}</Typography><Typography variant="caption">{quote.region}</Typography></Box>
          </Stack>}
        </Box>
      </Box>
      {offers.length > 1 && <Box mt={4}><Typography variant="h6" fontWeight={700} mb={1.5}>Ofertas para esta seleção</Typography><Stack gap={1}>
        {offers.map(offer => <Button key={offer.key} variant={active?.key === offer.key ? "contained" : "outlined"} aria-pressed={active?.key === offer.key}
          onClick={() => setOfferKey(offer.key)} sx={{ justifyContent: "space-between", textAlign: "left", gap: 2, p: 1.5, borderRadius: 2 }}>
          <Box>{offer.product.name}<Typography variant="caption" display="block">{offer.variation.quote.supplier} · {offer.variation.label} · {offer.variation.quote.region}</Typography></Box>
          <Typography fontWeight={800} whiteSpace="nowrap">{currency.format(offer.variation.quote.value)}</Typography>
        </Button>)}
      </Stack></Box>}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" fontWeight={700} mb={1.5}>Descrição</Typography>
      <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>{product?.description || material.observation || material.materialName}</Typography>
      <Typography variant="h6" fontWeight={700} mt={3} mb={1.5}>Informações do produto</Typography>
      <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" }, gap: 1 }}>
        {Object.entries({ Segmento: material.segmentName, Família: material.familyName, Material: material.materialName,
          ...(product ? { Marca: product.brand, Modelo: product.model, ...product.attributes } : {}) }).map(([label, value]) =>
          <Box key={label} sx={{ display: "contents" }}><Typography component="dt" variant="body2" fontWeight={700}>{label}</Typography><Typography component="dd" variant="body2" color="text.secondary" sx={{ m: 0, overflowWrap: "anywhere" }}>{value}</Typography></Box>)}
      </Box>
    </Paper>
    {imageOffer && <ProductImagesDialog key={imageOffer.productId} offer={imageOffer} onClose={() => setImageOffer(null)} onSaved={() => setRevision(n => n + 1)} />}
  </Container>;
}
