import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, CircularProgress, Container,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, TextField,
  Tooltip, Typography
} from "@mui/material";
import type { Composition } from "../domain/composition";
import {
  createComposition, deleteComposition, listCompositions, removeCompositionItem,
  updateCompositionItemQuantity
} from "../services/api";
import { ProtectedImage } from "../components/ProtectedImage";
import { downloadCompositions } from "../domain/export";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export default function CompositionsPage() {
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const load = () => {
    const controller = new AbortController();
    setLoading(true); setError("");
    listCompositions(controller.signal)
      .then(setCompositions)
      .catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  };
  useEffect(load, []);
  useEffect(() => {
    const refresh = () => { void listCompositions().then(setCompositions).catch(() => undefined); };
    window.addEventListener("precify-compositions-updated", refresh);
    return () => window.removeEventListener("precify-compositions-updated", refresh);
  }, []);

  const grandTotal = useMemo(() => compositions.reduce((sum, composition) => sum + composition.total, 0), [compositions]);
  const itemCount = useMemo(() => compositions.reduce((sum, composition) => sum + composition.items.length, 0), [compositions]);

  const replace = (updated: Composition) =>
    setCompositions(current => current.map(composition => composition.id === updated.id ? updated : composition));

  const changeQuantity = async (compositionId: string, itemId: string, value: number) => {
    const quantity = Math.max(.01, value || 1);
    const key = `${compositionId}:${itemId}`;
    setBusy(key); setError("");
    try { replace(await updateCompositionItemQuantity(compositionId, itemId, quantity)); }
    catch (err) { setError(err instanceof Error ? err.message : "Não foi possível alterar a quantidade."); }
    finally { setBusy(""); }
  };

  const removeItem = async (compositionId: string, itemId: string) => {
    const key = `${compositionId}:${itemId}`;
    setBusy(key); setError("");
    try { replace(await removeCompositionItem(compositionId, itemId)); }
    catch (err) { setError(err instanceof Error ? err.message : "Não foi possível remover o item."); }
    finally { setBusy(""); }
  };

  const removeList = async (composition: Composition) => {
    if (!window.confirm(`Excluir a composição “${composition.name}”?`)) return;
    setBusy(composition.id); setError("");
    try {
      await deleteComposition(composition.id);
      setCompositions(current => current.filter(entry => entry.id !== composition.id));
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível excluir a composição."); }
    finally { setBusy(""); }
  };

  const create = async () => {
    const name = newName.trim();
    if (!name) { setError("Dê um nome para a composição."); return; }
    setBusy("new"); setError("");
    try {
      const created = await createComposition(name);
      setCompositions(current => [created, ...current]);
      setNewName(""); setCreateOpen(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível criar a composição."); }
    finally { setBusy(""); }
  };

  return <Container maxWidth="md" component="main" sx={{ py: { xs: 2.5, md: 5 } }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} gap={2}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={850}>Meu planejamento</Typography>
        <Typography component="h1" variant="h4" fontWeight={850}>Minhas composições</Typography>
        <Typography color="text.secondary" mt={.5}>Organize materiais como listas de compra e acompanhe o valor estimado.</Typography>
      </Box>
      <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)}
        sx={{ borderRadius: 999, px: 2.5, alignSelf: { xs: "stretch", sm: "auto" } }}>Nova composição</Button>
    </Stack>

    <Paper variant="outlined" sx={{ mt: 3, p: 2, borderRadius: 4, borderColor: "#d9eadf",
      background: "linear-gradient(135deg,#f9fcfa 0%,#edf8f1 58%,#f7fffa 100%)" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Stack direction="row" gap={1.25} alignItems="center">
          <Box sx={{ width: 42, height: 42, borderRadius: 3, display: "grid", placeItems: "center", color: "#fff",
            background: "linear-gradient(135deg,#13743d,#31c96e)" }}><PlaylistAddCheckRoundedIcon /></Box>
          <Box><Typography variant="caption" color="text.secondary">{compositions.length} composições · {itemCount} itens</Typography>
            <Typography fontWeight={800}>Total estimado</Typography></Box>
        </Stack>
        <Typography color="primary.dark" fontWeight={900} fontSize={{ xs: 20, sm: 26 }}>{currency.format(grandTotal)}</Typography>
      </Stack>
    </Paper>

    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    <Stack direction="row" gap={1} my={2}><Button component={RouterLink} to="/obras">Organizar por obra</Button><Button disabled={loading || !compositions.length} onClick={() => downloadCompositions(compositions)}>Exportar CSV</Button></Stack>
    {loading ? <Box minHeight={240} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box> :
      !compositions.length ? <Paper variant="outlined" sx={{ mt: 2, p: 4, borderRadius: 4, textAlign: "center", borderStyle: "dashed" }}>
        <PlaylistAddCheckRoundedIcon color="primary" sx={{ fontSize: 42 }} />
        <Typography variant="h6" fontWeight={800} mt={1}>Sua primeira lista começa aqui</Typography>
        <Typography color="text.secondary" variant="body2" mt={.5}>Crie uma composição ou use o botão + nos cards dos produtos.</Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)} sx={{ mt: 2, borderRadius: 999 }}>Criar composição</Button>
      </Paper> :
      <Stack gap={1.5} mt={2}>
        {compositions.map((composition, index) => <Accordion key={composition.id} defaultExpanded={index === 0}
          disableGutters elevation={0} sx={{ border: "1px solid #dce9e0", borderRadius: "18px !important", overflow: "hidden",
            "&::before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 1.5, sm: 2 }, py: .5, bgcolor: "#fbfdfb" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" minWidth={0} pr={1}>
              <Box minWidth={0}>
                <Typography fontWeight={800} noWrap>{composition.name}</Typography>
                <Typography variant="caption" color="text.secondary">{composition.items.length} {composition.items.length === 1 ? "item" : "itens"}</Typography>
              </Box>
              <Typography color="primary.dark" fontWeight={850} ml={2}>{currency.format(composition.total)}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1.25, sm: 2 }, pt: 0 }}>
            <Divider sx={{ mb: 1.25 }} />
            {!composition.items.length ? <Box textAlign="center" py={3}>
              <Inventory2OutlinedIcon color="disabled" />
              <Typography color="text.secondary" variant="body2">Nenhum material nesta composição.</Typography>
              <Button component={RouterLink} to="/produtos" size="small" sx={{ mt: 1 }}>Explorar produtos</Button>
            </Box> : <Stack divider={<Divider flexItem />}>
              {composition.items.map(item => {
                const key = `${composition.id}:${item.id}`;
                return <Stack key={item.id} direction="row" gap={1.25} py={1.25} alignItems="center">
                  <ProtectedImage src={item.imageUrl} alt="" sx={{ width: 52, height: 52, borderRadius: 2, flexShrink: 0, bgcolor: "#fff" }} />
                  <Box minWidth={0} flex={1}>
                    <Typography component={RouterLink} to={`/produtos/${encodeURIComponent(item.materialCode)}`}
                      color="text.primary" fontWeight={750} fontSize={13.5} lineHeight={1.2}
                      sx={{ textDecoration: "none", display: "block", "&:hover": { color: "primary.main" } }}>{item.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {item.supplier || "Sem fornecedor"} · {currency.format(item.unitPrice)}/{item.unit}
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mt={.75}>
                      <TextField key={item.quantity} type="number" size="small" defaultValue={item.quantity}
                        disabled={busy === key} aria-label={`Quantidade de ${item.name}`}
                        slotProps={{ htmlInput: { min: .01, step: .01 } }}
                        onBlur={event => { const value = Number(event.target.value); if (value !== item.quantity) void changeQuantity(composition.id, item.id, value); }}
                        onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }}
                        sx={{ width: 92, "& .MuiInputBase-input": { py: .65, fontSize: 13 } }} />
                      <Stack direction="row" alignItems="center" gap={.25}>
                        <Box textAlign="right"><Typography variant="caption" color="text.secondary">{number.format(item.quantity)} {item.unit}</Typography>
                          <Typography fontWeight={800} color="primary.dark" fontSize={14}>{currency.format(item.quantity * item.unitPrice)}</Typography></Box>
                        <Tooltip title="Remover item"><span><IconButton disabled={busy === key} aria-label={`Remover ${item.name}`}
                          onClick={() => void removeItem(composition.id, item.id)} size="small" sx={{ color: "#9d4b4b" }}>
                          {busy === key ? <CircularProgress size={16} /> : <DeleteOutlineRoundedIcon fontSize="small" />}
                        </IconButton></span></Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>;
              })}
            </Stack>}
            <Divider sx={{ mt: 1.25 }} />
            <Stack direction="row" alignItems="center" justifyContent="space-between" pt={1.5}>
              <Button component={RouterLink} to="/produtos" size="small" startIcon={<AddRoundedIcon />}>Adicionar materiais</Button>
              <Tooltip title="Excluir composição"><span><IconButton size="small" disabled={busy === composition.id}
                aria-label={`Excluir composição ${composition.name}`} onClick={() => void removeList(composition)} sx={{ color: "#9d4b4b" }}>
                {busy === composition.id ? <CircularProgress size={18} /> : <DeleteOutlineRoundedIcon />}
              </IconButton></span></Tooltip>
            </Stack>
          </AccordionDetails>
        </Accordion>)}
      </Stack>}

    <Dialog open={createOpen} onClose={busy === "new" ? undefined : () => setCreateOpen(false)} fullWidth maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
      <DialogTitle fontWeight={800}>Nova composição</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" variant="body2" mb={2}>Crie uma lista para uma obra, cômodo ou etapa do projeto.</Typography>
        <TextField autoFocus fullWidth label="Nome" placeholder="Ex.: Banheiro social" value={newName}
          onChange={event => setNewName(event.target.value)}
          onKeyDown={event => { if (event.key === "Enter") void create(); }} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={() => setCreateOpen(false)} disabled={busy === "new"}>Cancelar</Button>
        <Button variant="contained" onClick={create} disabled={busy === "new"}
          startIcon={busy === "new" ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon />}>Criar</Button>
      </DialogActions>
    </Dialog>
  </Container>;
}
