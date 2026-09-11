import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { type FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, Box, Breadcrumbs, Button, CircularProgress, Container, Divider, FormControl, IconButton, InputLabel, Link, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { uniqueBy } from "../data/familyConfig";
import type { CatalogMaterial } from "../domain/search";
import { ImageUpload } from "../components/ImageUpload";
import { createProduct, getCatalog } from "../services/api";

interface QuoteRow { variationCode: string; optionCode: string; value: string; supplier: string; date: string; region: string; }
interface FormState { name: string; brand: string; model: string; segmentCode: string; familyCode: string; materialCode: string; description: string; imageUrl: string; supplierLogoUrl: string; quotes: QuoteRow[]; }
const today = () => new Date().toISOString().slice(0, 10);
const emptyQuote = (): QuoteRow => ({ variationCode: "", optionCode: "", value: "", supplier: "", date: today(), region: "RS" });
const initialForm = (): FormState => ({ name: "", brand: "", model: "", segmentCode: "", familyCode: "", materialCode: "", description: "", imageUrl: "", supplierLogoUrl: "", quotes: [emptyQuote()] });

export default function ProductRegistrationPage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<CatalogMaterial[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [uploads, setUploads] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const c = new AbortController();
    getCatalog(c.signal).then(setCatalog).catch(e => { if (!c.signal.aborted) setCatalogError(e.message); })
      .finally(() => { if (!c.signal.aborted) setCatalogLoading(false); });
    return () => c.abort();
  }, []);

  const segments = uniqueBy(catalog, (item) => item.segmentCode);
  const families = uniqueBy(catalog.filter((item) => !form.segmentCode || item.segmentCode === form.segmentCode), (item) => item.familyCode);
  const materials = catalog.filter((item) => !form.familyCode || item.familyCode === form.familyCode);
  const selectedMaterial = catalog.find((item) => item.materialCode === form.materialCode);
  const updateQuote = (index: number, update: Partial<QuoteRow>) => setForm((current) => ({ ...current, quotes: current.quotes.map((row, position) => position === index ? { ...row, ...update } : row) }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedMaterial) return;
    setSaving(true); setError(null);
    try {
      await createProduct({
        name: form.name, brand: form.brand, model: form.model,
        segmentCode: selectedMaterial.segmentCode, segment: selectedMaterial.segmentName,
        familyCode: selectedMaterial.familyCode, category: selectedMaterial.familyName,
        materialCode: selectedMaterial.materialCode, material: selectedMaterial.materialName,
        description: form.description, imageUrl: form.imageUrl.trim() || null,
        supplierLogoUrl: form.supplierLogoUrl.trim() || null,
        attributes: { catalogMaterialCode: selectedMaterial.materialCode },
        variations: form.quotes.map((row) => {
          const variation = selectedMaterial.variations.find((item) => item.variationCode === row.variationCode);
          const option = variation?.options.find((item) => item.optionCode === row.optionCode);
          return { variationCode: row.variationCode, optionCode: row.optionCode || null, label: option?.name ?? variation?.name ?? null, quote: { value: Number(row.value.replace(",", ".")), supplier: row.supplier, date: row.date, region: row.region } };
        }),
      });
      navigate(`/produtos/${encodeURIComponent(selectedMaterial.materialCode)}`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível cadastrar o produto."); }
    finally { setSaving(false); }
  };

  if (catalogLoading) return <Box py={10} textAlign="center"><CircularProgress aria-label="Carregando catálogo" /></Box>;

  return <Container component="main" maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
    <Button component={RouterLink} to="/busca" startIcon={<ArrowBackIcon />} sx={{ mb: 1 }}>Voltar à busca</Button>
    <Breadcrumbs sx={{ mb: 3, fontSize: 13 }}><Link component={RouterLink} to="/busca" underline="hover">Produtos</Link><Typography variant="caption">Cadastrar produto</Typography></Breadcrumbs>
    {(error || catalogError) && <Alert severity="error" sx={{ mb: 2 }}>{error || catalogError}</Alert>}
    <Paper component="form" onSubmit={submit} variant="outlined" sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, borderColor: "#e1e7e5" }}>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1.1fr 1fr" }} gap={{ xs: 3, md: 5 }}>
        <Box minWidth={0}>
          <ImageUpload label="Foto do produto" value={form.imageUrl} onChange={url => setForm(current => ({ ...current, imageUrl: url }))} onBusy={busy => setUploads(n => n + (busy ? 1 : -1))} />
          <Box mt={2.5}><ImageUpload label="Logo do fornecedor" value={form.supplierLogoUrl} onChange={url => setForm(current => ({ ...current, supplierLogoUrl: url }))} onBusy={busy => setUploads(n => n + (busy ? 1 : -1))} /></Box>
        </Box>
        <Box minWidth={0}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 26, md: 32 }, letterSpacing: "-.035em", mb: 2.5 }}>Cadastrar produto</Typography>
          <Stack gap={2}>
            <TextField required fullWidth label="Nome do produto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }} gap={2}>
              <FormControl required><InputLabel>Segmento</InputLabel><Select value={form.segmentCode} label="Segmento" onChange={(e) => setForm({ ...form, segmentCode: e.target.value, familyCode: "", materialCode: "" })}>{segments.map((item) => <MenuItem key={item.segmentCode} value={item.segmentCode}>{item.segmentName}</MenuItem>)}</Select></FormControl>
              <FormControl required><InputLabel>Família</InputLabel><Select value={form.familyCode} label="Família" onChange={(e) => setForm({ ...form, familyCode: e.target.value, materialCode: "" })}>{families.map((item) => <MenuItem key={item.familyCode} value={item.familyCode}>{item.familyName}</MenuItem>)}</Select></FormControl>
              <FormControl required><InputLabel>Material</InputLabel><Select value={form.materialCode} label="Material" onChange={(e) => setForm({ ...form, materialCode: e.target.value, quotes: [emptyQuote()] })}>{materials.map((item) => <MenuItem key={item.materialCode} value={item.materialCode}>{item.materialName}</MenuItem>)}</Select></FormControl>
              <TextField required label="Marca" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              <TextField required label="Modelo" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </Box>
            <TextField required multiline minRows={2} label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} color="primary.dark">Especificações e cotações</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setForm({ ...form, quotes: [...form.quotes, emptyQuote()] })}>Adicionar</Button>
          </Stack>
          <Stack gap={2} mt={1.5}>{form.quotes.map((row, index) => {
            const variation = selectedMaterial?.variations.find((item) => item.variationCode === row.variationCode);
            return <Box key={index} sx={{ p: 2, border: "1px solid #e2ebe8", borderRadius: 3 }}>
              <Stack direction="row" justifyContent="flex-end">{form.quotes.length > 1 ? <IconButton size="small" onClick={() => setForm({ ...form, quotes: form.quotes.filter((_, position) => position !== index) })}><DeleteOutlineIcon fontSize="small" /></IconButton> : null}</Stack>
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }} gap={2}>
                <FormControl required><InputLabel>Variação</InputLabel><Select value={row.variationCode} label="Variação" onChange={(e) => updateQuote(index, { variationCode: e.target.value, optionCode: "" })}>{selectedMaterial?.variations.map((item) => <MenuItem key={item.variationCode} value={item.variationCode}>{item.name}</MenuItem>)}</Select></FormControl>
                <FormControl disabled={!variation?.options.length}><InputLabel>Opção</InputLabel><Select value={row.optionCode} label="Opção" onChange={(e) => updateQuote(index, { optionCode: e.target.value })}>{variation?.options.map((item) => <MenuItem key={item.optionCode} value={item.optionCode}>{item.name}{item.symbol && item.symbol !== item.name ? ` (${item.symbol})` : ""}</MenuItem>)}</Select></FormControl>
                <TextField required label="Fornecedor" value={row.supplier} onChange={(e) => updateQuote(index, { supplier: e.target.value })} />
                <TextField required type="number" label="Valor" value={row.value} onChange={(e) => updateQuote(index, { value: e.target.value })} inputProps={{ min: 0, step: ".01" }} />
                <TextField required type="date" label="Data" value={row.date} onChange={(e) => updateQuote(index, { date: e.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField required label="UF" value={row.region} onChange={(e) => updateQuote(index, { region: e.target.value.toUpperCase() })} inputProps={{ maxLength: 2 }} />
              </Box>
            </Box>;
          })}</Stack>
        </Box>
      </Box>
      <Divider sx={{ my: 4 }} />
      <Stack direction="row" justifyContent="flex-end" gap={2}>
        <Button component={RouterLink} to="/busca" disabled={saving || uploads > 0}>Cancelar</Button>
        <Button type="submit" variant="contained" loading={saving} loadingPosition="start" startIcon={<Inventory2OutlinedIcon />} disabled={saving || uploads > 0 || !catalog.length}>Cadastrar produto</Button>
      </Stack>
    </Paper>
  </Container>;
}
