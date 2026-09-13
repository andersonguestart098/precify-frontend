import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import {
  Alert, Box, Breadcrumbs, Button, Chip, CircularProgress, Container, Divider, IconButton, Link,
  Paper, Stack, Typography
} from "@mui/material";
import { useAccount } from "../auth/session";
import { useFavorites } from "../hooks/useFavorites";
import { productDetail, type CatalogDetail } from "../services/api";
import { detailOffers, formatDate, matchesSelection, type VariationSelection } from "../domain/productDetails";
import type { CatalogOffer } from "../domain/search";
import { ProtectedImage } from "../components/ProtectedImage";
import { ProductImagesDialog } from "../components/ProductImagesDialog";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function ProductPage() {
  const { code = "" } = useParams();
  const location = useLocation();
  return <ProductContent key={code} code={code} fromSearch={(location.state as { fromSearch?: string } | null)?.fromSearch} />;
}

function ProductContent({ code, fromSearch }: { code: string; fromSearch?: string }) {
  const user = useAccount();
  const favorites = useFavorites();
  const [detail, setDetail] = useState<CatalogDetail | null>(null);
  const [selection, setSelection] = useState<VariationSelection | null>(null);
  const [offerKey, setOfferKey] = useState("");
  const [imageOffer, setImageOffer] = useState<CatalogOffer | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const back = fromSearch?.startsWith("/produtos") || fromSearch?.startsWith("/busca") ? fromSearch : "/produtos";

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    productDetail(code, controller.signal)
      .then(data => { if (!controller.signal.aborted) setDetail(data); })
      .catch(err => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [code, revision]);

  if (loading) return <Box py={10} textAlign="center"><CircularProgress aria-label="Carregando produto" /></Box>;
  if (error || !detail) return <Container sx={{ py: 4 }}><Alert severity="error">{error || "Produto não encontrado."}</Alert><Button component={RouterLink} to={back}>Voltar à busca</Button></Container>;

  const { material, products } = detail;
  const offers = detailOffers(products, selection);
  const active = offers.find(offer => offer.key === offerKey) ?? offers[0];
  const product = active?.product ?? products.find(item => (item.variations ?? []).some(variation => matchesSelection(variation, selection)));
  const quote = active?.variation.quote;
  const favorite = favorites.codes.has(code);

  const select = (value: VariationSelection) => {
    setSelection(current => current?.variationCode === value.variationCode && current.optionCode === value.optionCode ? null : value);
    setOfferKey("");
  };

  const editImages = () => {
    if (!product) return;
    setImageOffer({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      model: product.model,
      imageUrl: product.imageUrl,
      supplierLogoUrl: product.supplierLogoUrl,
      label: active?.variation.label,
      optionCode: active?.variation.optionCode,
      quote: quote ?? { value: 0, supplier: "", region: "", date: "" },
    });
  };

  return <Container component="main" maxWidth="lg" sx={{ py: { xs: 1.5, md: 4 }, px: { xs: 2, sm: 3 } }}>
    <Button component={RouterLink} to={back} startIcon={<ArrowBackIcon />} sx={{
      display: { xs: "none", md: "inline-flex" }, mb: 1.25, px: .5, textTransform: "none", fontWeight: 750,
    }}>Voltar à busca</Button>

    <Breadcrumbs sx={{ display: { xs: "none", sm: "flex" }, mb: { sm: 2.25, md: 3 }, fontSize: 13 }}>
      <Link component={RouterLink} to="/produtos" underline="hover">Produtos</Link>
      <Typography variant="caption">{material.familyName}</Typography>
      <Typography variant="caption">{material.materialName}</Typography>
    </Breadcrumbs>

    {favorites.error && <Alert severity="error" sx={{ mb: 2 }}>{favorites.error}</Alert>}

    <Paper variant="outlined" sx={{
      borderRadius: { xs: 0, sm: 4 },
      p: { xs: 0, sm: 2.5, md: 4 },
      borderColor: { xs: "transparent", sm: "#e1e7e5" },
      bgcolor: { xs: "transparent", sm: "#fff" },
      boxShadow: { xs: "none", sm: "0 10px 34px rgba(19,56,46,.045)" },
    }}>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "minmax(0,1.04fr) minmax(0,.96fr)" }} gap={{ xs: 2.25, md: 5 }}>
        <Box minWidth={0}>
          <Box sx={{
            bgcolor: "#f4f6f5",
            borderRadius: { xs: 3, sm: 3.5 },
            minHeight: { xs: 285, sm: 390, md: 440 },
            display: "grid",
            placeItems: "center",
            p: { xs: 2.25, sm: 3 },
            border: "1px solid #edf1ef",
          }}>
            <ProtectedImage
              src={product?.imageUrl || material.imageUrl}
              alt={product?.name ?? material.materialName}
              sx={{ width: "100%", height: { xs: 240, sm: 330, md: 380 }, borderRadius: 2.5, bgcolor: "transparent", border: 0 }}
            />
          </Box>

          {user.role === "ADMIN" && product && <Button
            variant="text"
            startIcon={<AddPhotoAlternateOutlinedIcon />}
            sx={{ mt: 1.25, px: .5, textTransform: "none", fontWeight: 700 }}
            onClick={editImages}
          >Editar fotos do produto e fornecedor</Button>}
        </Box>

        <Box minWidth={0} sx={{ pt: { md: .5 } }}>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>Código {material.materialCode}</Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="start" gap={1.25}>
            <Box minWidth={0}>
              <Typography component="h1" sx={{
                fontWeight: 900,
                fontSize: { xs: 28, sm: 32, md: 36 },
                letterSpacing: "-.04em",
                lineHeight: 1.08,
                background: "linear-gradient(112deg,#13382e,#006b4f 70%,#269b78)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{product?.name ?? material.materialName}</Typography>
              <Typography color="text.secondary" sx={{ mt: .85, fontSize: { xs: 14.5, md: 15.5 } }}>
                {[product?.brand, product?.model].filter(Boolean).join(" · ") || material.familyName}
              </Typography>
            </Box>

            <IconButton
              aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              aria-pressed={favorite}
              loading={favorites.loading || favorites.busy.has(code)}
              disabled={favorites.loading || favorites.busy.has(code)}
              onClick={() => void favorites.toggle(code)}
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
            <Chip label={material.status.replaceAll("_", " ")} size="small" variant="outlined" />
            <Chip label={material.familyName} size="small" sx={{ bgcolor: "#eef6f3", color: "#315c4d" }} />
          </Stack>

          <Box sx={{ py: { xs: 2.5, md: 3 } }} role="status" aria-label="Cotação atual" aria-live="polite">
            {quote ? <>
              <Typography variant="caption" color="text.secondary">{offers.length > 1 && !offerKey ? "A partir de" : "Cotação selecionada"}</Typography>
              <Typography color="primary.dark" sx={{ fontSize: { xs: 31, md: 36 }, lineHeight: 1.12, fontWeight: 900, letterSpacing: "-.035em" }}>
                {currency.format(quote.value)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={.45}>{active.variation.label} · {quote.region} · {formatDate(quote.date)}</Typography>
            </> : <>
              <Typography sx={{ fontSize: { xs: 22, md: 24 }, fontWeight: 850, color: "#173f33" }}>Cotação pendente</Typography>
              <Typography variant="body2" color="text.secondary" mt={.35}>Não há cotação cadastrada para esta seleção.</Typography>
            </>}
          </Box>

          {material.variations.length > 0 && <Box component="section" aria-label="Características e opções" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#70847d", mb: 1.15 }}>Escolha uma opção</Typography>
            <Stack gap={2}>
              {material.variations.map(variation => <Box key={variation.variationCode}>
                <Typography variant="body2" fontWeight={750} color="#244f41" mb={.9}>{variation.name}</Typography>
                {variation.options.length ? <Box role="group" aria-label={variation.name} sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", sm: "repeat(3,minmax(0,1fr))", md: "repeat(2,minmax(0,1fr))" }, gap: 1 }}>
                  {variation.options.map(option => {
                    const selected = selection?.variationCode === variation.variationCode && selection.optionCode === option.optionCode;
                    return <Button
                      key={option.optionCode}
                      variant="outlined"
                      aria-pressed={selected}
                      endIcon={selected ? <CheckRoundedIcon /> : undefined}
                      onClick={() => select({ variationCode: variation.variationCode, optionCode: option.optionCode })}
                      sx={{
                        minHeight: 46,
                        px: 1.25,
                        borderRadius: 2.25,
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
                    >{option.name}</Button>;
                  })}
                </Box> : <Box sx={{ py: 1.2, px: 1.4, border: "1px solid #e5ece9", borderRadius: 2.25, bgcolor: "#f8faf9" }}>
                  <Typography variant="body2" color="text.secondary">Não informado</Typography>
                </Box>}
              </Box>)}
            </Stack>

            {selection && <Button
              size="small"
              startIcon={<RestartAltRoundedIcon />}
              sx={{ mt: 1.2, px: .4, color: "#587068", textTransform: "none" }}
              onClick={() => { setSelection(null); setOfferKey(""); }}
            >Limpar seleção</Button>}
          </Box>}

          {!quote && material.supplierLogoUrl && <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 1.5, bgcolor: "#f2f7f5", borderRadius: 2.5 }}>
            <ProtectedImage src={material.supplierLogoUrl} alt="Logo cadastrada no material" sx={{ width: 58, height: 46, borderRadius: 1.5 }} />
            <Box><Typography variant="caption" color="text.secondary">Fornecedor</Typography><Typography variant="body2" fontWeight={750}>Cotação pendente</Typography></Box>
          </Stack>}

          {quote && <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 1.5, bgcolor: "#f2f7f5", borderRadius: 2.5 }}>
            <ProtectedImage src={product?.supplierLogoUrl} alt={`Logo de ${quote.supplier}`} sx={{ width: 58, height: 46, borderRadius: 1.5, flexShrink: 0 }} />
            <Box><Typography variant="caption" color="text.secondary">Fornecedor</Typography><Typography fontWeight={800}>{quote.supplier}</Typography><Typography variant="caption">{quote.region}</Typography></Box>
          </Stack>}
        </Box>
      </Box>

      {offers.length > 1 && <Box mt={{ xs: 3.5, md: 4.5 }}>
        <Typography variant="h6" fontWeight={850} mb={1.25} color="#173f33">Ofertas para esta seleção</Typography>
        <Stack gap={1}>
          {offers.map(offer => <Button
            key={offer.key}
            variant={active?.key === offer.key ? "contained" : "outlined"}
            aria-pressed={active?.key === offer.key}
            onClick={() => setOfferKey(offer.key)}
            sx={{ justifyContent: "space-between", textAlign: "left", gap: 2, p: 1.5, borderRadius: 2.25, textTransform: "none" }}
          >
            <Box minWidth={0}>{offer.product.name}<Typography variant="caption" display="block">{offer.variation.quote.supplier} · {offer.variation.label} · {offer.variation.quote.region}</Typography></Box>
            <Typography fontWeight={850} whiteSpace="nowrap">{currency.format(offer.variation.quote.value)}</Typography>
          </Button>)}
        </Stack>
      </Box>}

      <Divider sx={{ my: { xs: 3.5, md: 4.5 } }} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,.9fr) minmax(0,1.1fr)" }, gap: { xs: 3, md: 6 } }}>
        <Box>
          <Typography variant="h6" fontWeight={850} mb={1} color="#173f33">Descrição</Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{product?.description || material.observation || material.materialName}</Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={850} mb={1.25} color="#173f33">Informações do produto</Typography>
          <Box component="dl" sx={{ m: 0 }}>
            {Object.entries({
              Segmento: material.segmentName,
              Família: material.familyName,
              Material: material.materialName,
              ...(product ? { Marca: product.brand, Modelo: product.model, ...product.attributes } : {}),
            }).map(([label, value], index) => <Box key={label} sx={{
              display: "grid",
              gridTemplateColumns: "minmax(100px,.7fr) minmax(0,1.3fr)",
              gap: 2,
              py: 1.05,
              borderTop: index ? "1px solid #edf1ef" : 0,
            }}>
              <Typography component="dt" variant="body2" fontWeight={750} color="#294d41">{label}</Typography>
              <Typography component="dd" variant="body2" color="text.secondary" sx={{ m: 0, overflowWrap: "anywhere" }}>{value || "Não informado"}</Typography>
            </Box>)}
          </Box>
        </Box>
      </Box>
    </Paper>

    {imageOffer && <ProductImagesDialog
      key={imageOffer.productId}
      offer={imageOffer}
      onClose={() => setImageOffer(null)}
      onSaved={() => setRevision(value => value + 1)}
    />}
  </Container>;
}
