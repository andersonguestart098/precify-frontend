import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import {
  Alert, Box, Breadcrumbs, Button, Chip, CircularProgress, Container, Divider, IconButton, Link,
  Paper, Stack, TextField, Typography
} from "@mui/material";
import { useAccount } from "../auth/session";
import { useFavorites } from "../hooks/useFavorites";
import { productDetail, updateProductBasic, type CatalogDetail } from "../services/api";
import { detailOffers, formatDate, matchesSelection, type VariationSelection } from "../domain/productDetails";
import type { CatalogOffer } from "../domain/search";
import { ProtectedImage } from "../components/ProtectedImage";
import { ProductImagesDialog } from "../components/ProductImagesDialog";
import { SegmentMaterialPlaceholder } from "../components/SegmentMaterialPlaceholder";

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
  const [editing, setEditing] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [brandDraft, setBrandDraft] = useState("");
  const [modelDraft, setModelDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [quoteDraft, setQuoteDraft] = useState("");
  const [supplierDraft, setSupplierDraft] = useState("");

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
  const editableVariation = active?.variation
    ?? product?.variations.find(variation => matchesSelection(variation, selection))
    ?? product?.variations[0];
  const editableQuote = editableVariation?.quote;
  const favorite = favorites.codes.has(code);

  const select = (value: VariationSelection) => {
    setSelection(current => current?.variationCode === value.variationCode && current.optionCode === value.optionCode ? null : value);
    setOfferKey("");
  };

  const startEditing = () => {
    if (!product || !editableVariation) return;
    setEditError("");
    setEditSuccess("");
    setNameDraft(product.name);
    setBrandDraft(product.brand);
    setModelDraft(product.model);
    setDescriptionDraft(product.description || material.observation || material.materialName);
    setQuoteDraft(editableQuote ? String(editableQuote.value).replace(".", ",") : "0,00");
    setSupplierDraft(editableQuote?.supplier?.toLocaleLowerCase("pt-BR").includes("a definir") ? "" : (editableQuote?.supplier ?? ""));
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditError("");
  };

  const saveBasicDetails = async () => {
    if (!product || !editableVariation) return;
    const quoteValue = Number((quoteDraft.trim() || "0").replace(",", "."));
    if (!nameDraft.trim()) {
      setEditError("Informe o nome do produto.");
      return;
    }
    if (!brandDraft.trim()) {
      setEditError("Informe a marca do produto.");
      return;
    }
    if (!modelDraft.trim()) {
      setEditError("Informe o modelo do produto.");
      return;
    }
    if (!descriptionDraft.trim()) {
      setEditError("Informe a descrição do produto.");
      return;
    }
    if (!Number.isFinite(quoteValue) || quoteValue < 0) {
      setEditError("Informe uma cotação válida.");
      return;
    }
    if (quoteValue > 0 && !supplierDraft.trim()) {
      setEditError("Informe o fornecedor para uma cotação com valor.");
      return;
    }

    setSavingDetails(true);
    setEditError("");
    setEditSuccess("");
    try {
      await updateProductBasic(product.id, {
        name: nameDraft.trim(),
        brand: brandDraft.trim(),
        model: modelDraft.trim(),
        description: descriptionDraft.trim(),
        quoteValue,
        supplier: supplierDraft.trim(),
        variationCode: editableVariation.variationCode ?? null,
        optionCode: editableVariation.optionCode ?? null,
      });
      setEditing(false);
      setEditSuccess("Dados do produto atualizados.");
      setRevision(value => value + 1);
    } catch (reason) {
      setEditError(reason instanceof Error ? reason.message : "Não foi possível atualizar os dados do produto.");
    } finally {
      setSavingDetails(false);
    }
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
      <Typography variant="caption">{material.familyName}</Typography>
      <Typography variant="caption">{material.materialName}</Typography>
    </Breadcrumbs>

    {favorites.error && <Alert severity="error" sx={{ mb: 2 }}>{favorites.error}</Alert>}
    {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
    {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>{editSuccess}</Alert>}

    <Paper variant="outlined" sx={{
      borderRadius: { xs: 0, sm: 4 },
      p: { xs: 0, sm: 2.5, md: 3, xl: 4 },
      borderColor: { xs: "transparent", sm: "#e1e7e5" },
      bgcolor: { xs: "transparent", sm: "#fff" },
      boxShadow: { xs: "none", sm: "0 10px 34px rgba(19,56,46,.045)" },
    }}>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "minmax(0,.98fr) minmax(0,1.02fr)" }}
        gap={{ xs: 2.25, md: 3, lg: 3.5, xl: 5 }}
      >
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
              src={product?.imageUrl || material.imageUrl}
              alt={product?.name ?? material.materialName}
              fallback={<SegmentMaterialPlaceholder segmentCode={material.segmentCode} label={material.materialName} variant="detail" />}
              sx={{ width: "100%", height: { xs: 240, sm: 300, md: 275, lg: 295, xl: 380 }, borderRadius: 2.5, bgcolor: "transparent", border: 0 }}
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
            <Box minWidth={0} flex={1}>
              {editing ? <Stack gap={1}>
                <TextField
                  label="Nome do produto"
                  value={nameDraft}
                  onChange={event => setNameDraft(event.target.value)}
                  size="small"
                  fullWidth
                  sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
                />
                <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                  <TextField
                    label="Marca"
                    value={brandDraft}
                    onChange={event => setBrandDraft(event.target.value)}
                    size="small"
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Modelo"
                    value={modelDraft}
                    onChange={event => setModelDraft(event.target.value)}
                    size="small"
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
                  />
                </Stack>
              </Stack> : <>
                <Typography component="h1" sx={{
                  fontWeight: 900,
                  fontSize: { xs: 28, sm: 32, md: 29, lg: 31, xl: 36 },
                  letterSpacing: "-.04em",
                  lineHeight: 1.08,
                  background: "linear-gradient(112deg,#13382e,#006b4f 70%,#269b78)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>{product?.name ?? material.materialName}</Typography>
                <Typography color="text.secondary" sx={{ mt: .85, fontSize: { xs: 14.5, md: 13.5, lg: 14, xl: 15.5 } }}>
                  {[product?.brand, product?.model].filter(Boolean).join(" · ") || material.familyName}
                </Typography>
              </>}
            </Box>

            <Stack direction="row" alignItems="center" gap={.65} flexShrink={0}>
              {user.role === "ADMIN" && product && editableVariation && (editing ? <>
                <IconButton
                  aria-label="Cancelar edição"
                  onClick={cancelEditing}
                  disabled={savingDetails}
                  sx={{
                    mt: -.5, width: 40, height: 40,
                    color: "#6d7f79", bgcolor: "#f4f7f6", border: "1px solid #dfe8e5",
                    "&:hover": { bgcolor: "#edf3f1" },
                  }}
                ><CloseRoundedIcon sx={{ fontSize: 20 }} /></IconButton>
                <IconButton
                  aria-label="Salvar dados do produto"
                  onClick={() => void saveBasicDetails()}
                  disabled={savingDetails}
                  sx={{
                    mt: -.5, width: 40, height: 40,
                    color: "#fff", bgcolor: "#087458", border: "1px solid #087458",
                    boxShadow: "0 5px 14px rgba(0,107,79,.16)",
                    "&:hover": { bgcolor: "#006b4f" },
                    "&.Mui-disabled": { bgcolor: "#b8cbc4", color: "#fff", borderColor: "#b8cbc4" },
                  }}
                >{savingDetails ? <CircularProgress size={18} sx={{ color: "inherit" }} /> : <SaveRoundedIcon sx={{ fontSize: 19 }} />}</IconButton>
              </> : <IconButton
                aria-label="Editar dados do produto"
                onClick={startEditing}
                sx={{
                  mt: -.5, width: 40, height: 40,
                  color: "#315e4e", bgcolor: "#eef6f3", border: "1px solid #d7e7e1",
                  "&:hover": { bgcolor: "#e4f1ec", borderColor: "#b9d7cc" },
                }}
              ><EditRoundedIcon sx={{ fontSize: 19 }} /></IconButton>)}

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
          </Stack>

          <Stack direction="row" gap={.75} flexWrap="wrap" mt={1.5}>
            <Chip label={material.status.replaceAll("_", " ")} size="small" variant="outlined" />
            <Chip label={material.familyName} size="small" sx={{ bgcolor: "#eef6f3", color: "#315c4d" }} />
          </Stack>

          <Box sx={{ py: { xs: 2.5, md: 2.25, xl: 3 } }} aria-label="Cotação atual">
            {editing ? <Stack gap={1.1}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 850, color: "#315e4e" }}>Editando dados básicos</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                <TextField
                  label="Cotação (R$)"
                  value={quoteDraft}
                  onChange={event => setQuoteDraft(event.target.value.replace(/[^0-9,\.]/g, ""))}
                  slotProps={{ htmlInput: { inputMode: "decimal" } }}
                  size="small"
                  fullWidth
                  placeholder="0,00"
                  helperText="Pode permanecer em R$ 0,00 enquanto a cotação estiver pendente."
                  sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
                />
                <TextField
                  label="Fornecedor"
                  value={supplierDraft}
                  onChange={event => setSupplierDraft(event.target.value)}
                  size="small"
                  fullWidth
                  placeholder="Nome do fornecedor"
                  helperText="Obrigatório quando a cotação for maior que zero."
                  sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {editableVariation?.label || "Opção selecionada"}
                {editableQuote?.region ? " · " + editableQuote.region : ""}
                {editableQuote?.date ? " · " + formatDate(editableQuote.date) : ""}
              </Typography>
            </Stack> : quote ? <>
              <Typography variant="caption" color="text.secondary">{offers.length > 1 && !offerKey ? "A partir de" : "Cotação selecionada"}</Typography>
              <Typography color="primary.dark" sx={{ fontSize: { xs: 31, md: 36 }, lineHeight: 1.12, fontWeight: 900, letterSpacing: "-.035em" }}>
                {currency.format(quote.value)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={.45}>{active.variation.label} · {quote.region} · {formatDate(quote.date)}</Typography>
            </> : <>
              <Typography sx={{ fontSize: { xs: 22, md: 24 }, fontWeight: 850, color: "#173f33" }}>Cotação pendente</Typography>
              <Typography variant="body2" color="text.secondary" mt={.35}>Não há cotação cadastrada para esta seleção.</Typography>
              {user.role === "ADMIN" && product && editableVariation && <Button
                size="small"
                startIcon={<EditRoundedIcon />}
                onClick={startEditing}
                sx={{ mt: 1.1, px: .4, textTransform: "none", fontWeight: 780, color: "#17664f" }}
              >
                Lançar cotação
              </Button>}
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
                      disabled={editing}
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
                    >{option.name}</Button>;
                  })}
                </Box> : <Box sx={{ py: 1.2, px: 1.4, border: "1px solid #e5ece9", borderRadius: 1.25, bgcolor: "#f8faf9" }}>
                  <Typography variant="body2" color="text.secondary">Não informado</Typography>
                </Box>}
              </Box>)}
            </Stack>

            {selection && <Button
              size="small"
              startIcon={<RestartAltRoundedIcon />}
              sx={{ mt: 1.2, px: .4, color: "#587068", textTransform: "none" }}
              disabled={editing}
              onClick={() => { setSelection(null); setOfferKey(""); }}
            >Limpar seleção</Button>}
          </Box>}

          {!editing && !quote && material.supplierLogoUrl && <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 1.5, bgcolor: "#f2f7f5", borderRadius: 2.5 }}>
            <ProtectedImage src={material.supplierLogoUrl} alt="Logo cadastrada no material" sx={{ width: 58, height: 46, borderRadius: 1.5 }} />
            <Box><Typography variant="caption" color="text.secondary">Fornecedor</Typography><Typography variant="body2" fontWeight={750}>Cotação pendente</Typography></Box>
          </Stack>}

          {!editing && quote && <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 1.5, bgcolor: "#f2f7f5", borderRadius: 2.5 }}>
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
            disabled={editing}
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
          {editing ? <TextField
            value={descriptionDraft}
            onChange={event => setDescriptionDraft(event.target.value)}
            multiline
            minRows={4}
            fullWidth
            placeholder="Descrição do produto"
            sx={{ "& .MuiInputBase-root": { borderRadius: 2.25, bgcolor: "#fff" } }}
          /> : <Typography color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
            {product?.description || material.observation || material.materialName}
          </Typography>}
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