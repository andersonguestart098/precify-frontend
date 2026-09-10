import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Stack, TextField, Typography
} from "@mui/material";
import type { CatalogResult } from "../domain/search";
import type { Composition } from "../domain/composition";
import { addCompositionItem, createComposition, listCompositions } from "../services/api";
import { ProtectedImage } from "./ProtectedImage";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const units = ["un", "m²", "m", "kg", "L", "saco", "caixa"];

export function AddToCompositionDialog({ open, result, onClose }: {
  open: boolean;
  result: CatalogResult;
  onClose: () => void;
}) {
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("un");
  const [error, setError] = useState("");
  const [savedName, setSavedName] = useState("");

  const featured = useMemo(() => [...result.offers].sort((a, b) =>
    a.quote.value - b.quote.value || a.productId.localeCompare(b.productId))[0], [result.offers]);
  const photo = result.imageUrl || featured?.imageUrl || result.material.imageUrl;

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true); setError(""); setSavedName(""); setCreating(false); setNewName("");
    listCompositions(controller.signal)
      .then(setCompositions)
      .catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [open]);

  const itemPayload = () => ({
    materialCode: result.material.materialCode,
    productId: featured?.productId ?? null,
    name: result.material.materialName,
    imageUrl: photo ?? null,
    supplier: featured?.quote.supplier ?? null,
    unit,
    quantity: Math.max(.01, Number(quantity) || 1),
    unitPrice: featured?.quote.value ?? 0,
  });

  const addTo = async (composition: Composition) => {
    setSavingId(composition.id); setError("");
    try {
      const updated = await addCompositionItem(composition.id, itemPayload());
      setCompositions(current => current.map(entry => entry.id === updated.id ? updated : entry));
      setSavedName(updated.name);
      window.dispatchEvent(new Event("precify-compositions-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível adicionar o material.");
    } finally { setSavingId(null); }
  };

  const createAndAdd = async () => {
    const name = newName.trim();
    if (!name) { setError("Dê um nome para a nova composição."); return; }
    setSavingId("new"); setError("");
    try {
      const created = await createComposition(name);
      const updated = await addCompositionItem(created.id, itemPayload());
      setCompositions(current => [updated, ...current]);
      setSavedName(updated.name); setCreating(false); setNewName("");
      window.dispatchEvent(new Event("precify-compositions-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a composição.");
    } finally { setSavingId(null); }
  };

  return <Dialog open={open} onClose={savingId ? undefined : onClose} fullWidth maxWidth="xs"
    slotProps={{ paper: { sx: { borderRadius: { xs: "24px 24px 0 0", sm: 4 }, m: { xs: 0, sm: 2 }, position: { xs: "fixed", sm: "relative" }, bottom: { xs: 0, sm: "auto" } } } }}>
    <DialogTitle sx={{ pb: 1 }}>
      <Typography variant="overline" color="primary" fontWeight={800}>Lista de compra</Typography>
      <Typography component="div" variant="h6" fontWeight={800}>Adicionar à composição</Typography>
    </DialogTitle>
    <DialogContent>
      <Stack direction="row" gap={1.25} alignItems="center" sx={{ p: 1.25, bgcolor: "#f5faf6", border: "1px solid #dcebe1", borderRadius: 3 }}>
        <ProtectedImage src={photo} alt="" sx={{ width: 54, height: 54, borderRadius: 2, bgcolor: "#fff", flexShrink: 0 }} />
        <Box minWidth={0} flex={1}>
          <Typography fontWeight={750} fontSize={14} lineHeight={1.2}>{result.material.materialName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {featured ? `${featured.quote.supplier} · ${currency.format(featured.quote.value)}` : "Sem cotação disponível"}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" gap={1} mt={2}>
        <TextField label="Quantidade" type="number" value={quantity} onChange={event => setQuantity(event.target.value)}
          fullWidth size="small" slotProps={{ htmlInput: { min: .01, step: .01 } }} />
        <TextField label="Unidade" select value={unit} onChange={event => setUnit(event.target.value)}
          size="small" sx={{ width: 120 }}>{units.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
      {savedName && <Alert icon={<CheckCircleRoundedIcon />} severity="success" sx={{ mt: 1.5 }}>
        Adicionado em <strong>{savedName}</strong>.
      </Alert>}

      <Divider sx={{ my: 2 }} />
      {loading ? <Box display="grid" sx={{ placeItems: "center", minHeight: 110 }}><CircularProgress size={28} /></Box> :
        <List disablePadding sx={{ display: "grid", gap: .75 }}>
          {compositions.map(composition => <ListItemButton key={composition.id} disabled={Boolean(savingId)}
            onClick={() => addTo(composition)} sx={{ border: "1px solid #e0ebe4", borderRadius: 2.5, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 38, color: "primary.main" }}>
              {savingId === composition.id ? <CircularProgress size={21} /> : <PlaylistAddRoundedIcon />}
            </ListItemIcon>
            <ListItemText primary={composition.name}
              secondary={`${composition.items.length} ${composition.items.length === 1 ? "item" : "itens"} · ${currency.format(composition.total)}`}
              primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }} />
            <AddRoundedIcon color="primary" />
          </ListItemButton>)}
          {!compositions.length && !creating && <Typography color="text.secondary" variant="body2" textAlign="center" py={1}>
            Você ainda não criou nenhuma composição.
          </Typography>}
        </List>}

      {creating ? <Stack gap={1} mt={1.25}>
        <TextField autoFocus size="small" label="Nome da composição" placeholder="Ex.: Reforma da cozinha"
          value={newName} onChange={event => setNewName(event.target.value)}
          onKeyDown={event => { if (event.key === "Enter") void createAndAdd(); }} />
        <Stack direction="row" gap={1}>
          <Button fullWidth onClick={() => setCreating(false)} disabled={Boolean(savingId)}>Cancelar</Button>
          <Button fullWidth variant="contained" onClick={createAndAdd} disabled={Boolean(savingId)}
            startIcon={savingId === "new" ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon />}>Criar e adicionar</Button>
        </Stack>
      </Stack> : <Button fullWidth variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}
        sx={{ mt: 1.25, borderRadius: 999, fontWeight: 700 }}>Nova composição</Button>}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={onClose} disabled={Boolean(savingId)}>Concluir</Button></DialogActions>
  </Dialog>;
}
