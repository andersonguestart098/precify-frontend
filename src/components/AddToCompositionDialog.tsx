import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Stack, TextField, Typography
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
  const [compositionQuery, setCompositionQuery] = useState("");

  const featured = useMemo(() => [...result.offers].sort((a, b) =>
    a.quote.value - b.quote.value || a.productId.localeCompare(b.productId))[0], [result.offers]);
  const photo = result.imageUrl || featured?.imageUrl || result.material.imageUrl;
  const filteredCompositions = useMemo(() => {
    const query = compositionQuery.trim().toLocaleLowerCase("pt-BR");
    if (!query) return compositions;
    return compositions.filter(composition => composition.name.toLocaleLowerCase("pt-BR").includes(query));
  }, [compositions, compositionQuery]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true); setError(""); setSavedName(""); setCreating(false); setNewName(""); setCompositionQuery("");
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
      setSavedName(updated.name); setCreating(false); setNewName(""); setCompositionQuery("");
      window.dispatchEvent(new Event("precify-compositions-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a composição.");
    } finally { setSavingId(null); }
  };

  return <Dialog open={open} onClose={savingId ? undefined : onClose} fullWidth maxWidth="xs"
    slotProps={{ paper: { sx: { borderRadius: { xs: "26px 26px 0 0", sm: 4.5 }, m: { xs: 0, sm: 2 }, position: { xs: "fixed", sm: "relative" },
      bottom: { xs: 0, sm: "auto" }, overflow: "hidden", boxShadow: "0 26px 70px rgba(16,42,33,.24)" } } }}>
    <DialogTitle sx={{ px: { xs: 2.5, sm: 3 }, pt: 2.5, pb: 1.2 }}>
      <Typography variant="overline" color="primary" fontWeight={850} letterSpacing={1.15}>Lista de compra</Typography>
      <Typography component="div" sx={{ mt: .15, fontSize: { xs: 22, sm: 24 }, lineHeight: 1.12, fontWeight: 900, letterSpacing: "-.025em",
        background: "linear-gradient(112deg,#13382e,#006b4f 70%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Adicionar à composição
      </Typography>
      <Typography color="text.secondary" fontSize={12.5} mt={.65}>Escolha uma lista existente ou crie uma nova sem sair da busca.</Typography>
    </DialogTitle>

    <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pb: 1.5 }}>
      <Stack direction="row" gap={1.25} alignItems="center" sx={{ p: 1.25, bgcolor: "#f5faf8", border: "1px solid #dcebe6", borderRadius: 3.25 }}>
        <ProtectedImage src={photo} alt="" sx={{ width: 54, height: 54, borderRadius: 2.25, bgcolor: "#fff", flexShrink: 0, border: "1px solid #e8efec" }} />
        <Box minWidth={0} flex={1}>
          <Typography fontWeight={800} fontSize={14} lineHeight={1.2}>{result.material.materialName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {featured ? `${featured.quote.supplier} · ${currency.format(featured.quote.value)}` : "Sem cotação disponível"}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" gap={1} mt={1.75}>
        <TextField label="Quantidade" type="number" value={quantity} onChange={event => setQuantity(event.target.value)}
          fullWidth size="small" slotProps={{ htmlInput: { min: .01, step: .01 } }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
        <TextField label="Unidade" select value={unit} onChange={event => setUnit(event.target.value)}
          size="small" sx={{ width: 120, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}>
          {units.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2.5 }}>{error}</Alert>}
      {savedName && <Alert icon={<CheckCircleRoundedIcon />} severity="success" sx={{ mt: 1.5, borderRadius: 2.5, bgcolor: "#edf8ef" }}>
        Adicionado em <strong>{savedName}</strong>.
      </Alert>}

      <Divider sx={{ my: 1.8 }} />
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Box>
          <Typography fontWeight={850} color="#284d40" fontSize={13.5}>Suas composições</Typography>
          <Typography color="text.secondary" fontSize={11.5}>{compositions.length} {compositions.length === 1 ? "lista disponível" : "listas disponíveis"}</Typography>
        </Box>
      </Stack>

      {!loading && compositions.length > 0 && <TextField
        fullWidth
        size="small"
        value={compositionQuery}
        onChange={event => setCompositionQuery(event.target.value)}
        placeholder="Buscar composição..."
        aria-label="Buscar composição"
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 19, color: "#5f776f" }} /></InputAdornment> } }}
        sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: 999, bgcolor: "#f8faf9", "& fieldset": { borderColor: "#dfe8e5" } } }}
      />}

      {loading ? <Box display="grid" sx={{ placeItems: "center", minHeight: 130 }}><CircularProgress size={28} /></Box> :
        <Box sx={{ border: compositions.length ? "1px solid #e1ebe7" : 0, borderRadius: 3, overflow: "hidden", bgcolor: "#fff" }}>
          <List disablePadding sx={{ maxHeight: 250, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#b9cbc5 transparent" }}>
            {filteredCompositions.map((composition, index) => {
              const saved = savedName === composition.name;
              return <ListItemButton key={composition.id} disabled={Boolean(savingId)} onClick={() => addTo(composition)}
                sx={{ minHeight: 62, px: 1.25, py: .8, borderTop: index ? "1px solid #edf2f0" : 0,
                  bgcolor: saved ? "#f1faf5" : "#fff", transition: "background-color 160ms ease",
                  "&:hover": { bgcolor: saved ? "#ebf7f0" : "#f7faf9" } }}>
                <ListItemIcon sx={{ minWidth: 40, color: saved ? "#2d8a55" : "primary.main" }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2.25, display: "grid", placeItems: "center", bgcolor: saved ? "#e0f2e6" : "#edf6f3" }}>
                    {savingId === composition.id ? <CircularProgress size={18} /> : saved ? <CheckCircleRoundedIcon sx={{ fontSize: 19 }} /> : <PlaylistAddRoundedIcon sx={{ fontSize: 19 }} />}
                  </Box>
                </ListItemIcon>
                <ListItemText primary={composition.name}
                  secondary={`${composition.items.length} ${composition.items.length === 1 ? "item" : "itens"} · ${currency.format(composition.total)}`}
                  primaryTypographyProps={{ fontWeight: 800, fontSize: 13.5, color: "#21483b" }}
                  secondaryTypographyProps={{ fontSize: 11.5 }} />
                <Box sx={{ width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center",
                  bgcolor: saved ? "#dff2e6" : "#f1f7f5", color: saved ? "#2d8a55" : "#006b4f" }}>
                  {saved ? <CheckCircleRoundedIcon sx={{ fontSize: 17 }} /> : <AddRoundedIcon sx={{ fontSize: 19 }} />}
                </Box>
              </ListItemButton>;
            })}
            {!compositions.length && !creating && <Box sx={{ py: 2.5, textAlign: "center" }}>
              <Typography fontWeight={750} color="#34574b" fontSize={14}>Nenhuma composição criada ainda.</Typography>
              <Typography color="text.secondary" fontSize={12.5} mt={.25}>Crie sua primeira lista abaixo.</Typography>
            </Box>}
            {compositions.length > 0 && !filteredCompositions.length && <Box sx={{ py: 2.5, textAlign: "center" }}>
              <Typography fontWeight={750} color="#34574b" fontSize={14}>Nenhuma composição encontrada.</Typography>
              <Typography color="text.secondary" fontSize={12.5} mt={.25}>Tente buscar por outro nome.</Typography>
            </Box>}
          </List>
        </Box>}

      {creating ? <Box sx={{ mt: 1.25, p: 1.5, borderRadius: 3, bgcolor: "#f6faf8", border: "1px solid #dfeae6" }}>
        <Typography fontWeight={850} color="#284d40" fontSize={13.5} mb={1}>Nova composição</Typography>
        <TextField autoFocus fullWidth size="small" label="Nome da composição" placeholder="Ex.: Reforma da cozinha"
          value={newName} onChange={event => setNewName(event.target.value)}
          onKeyDown={event => { if (event.key === "Enter") void createAndAdd(); }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#fff" } }} />
        <Stack direction="row" gap={1} mt={1.1}>
          <Button fullWidth onClick={() => setCreating(false)} disabled={Boolean(savingId)} sx={{ borderRadius: 999, textTransform: "none" }}>Cancelar</Button>
          <Button fullWidth variant="contained" onClick={createAndAdd} disabled={Boolean(savingId)}
            startIcon={savingId === "new" ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon />}
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 800 }}>Criar e adicionar</Button>
        </Stack>
      </Box> : <Button fullWidth startIcon={<PlaylistAddRoundedIcon />} onClick={() => setCreating(true)}
        sx={{ mt: 1.25, minHeight: 42, borderRadius: 999, textTransform: "none", fontWeight: 800, color: "#006b4f",
          bgcolor: "#edf6f3", border: "1px solid #d5e8e1", "&:hover": { bgcolor: "#e4f1ed", borderColor: "#bcd8cf" } }}>
        Criar nova composição
      </Button>}
    </DialogContent>
    <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, pt: .25, pb: 2.25 }}>
      <Button onClick={onClose} disabled={Boolean(savingId)} sx={{ borderRadius: 999, px: 2.1, textTransform: "none", fontWeight: 800 }}>Concluir</Button>
    </DialogActions>
  </Dialog>;
}
