import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, CircularProgress, Container,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, TextField,
  Tooltip, Typography
} from "@mui/material";
import type { Composition } from "../domain/composition";
import {
  createComposition, deleteComposition, listCompositions, listProjects, removeCompositionItem, saveProject,
  updateCompositionItemQuantity, type Project
} from "../services/api";
import { ProtectedImage } from "../components/ProtectedImage";
import { downloadCompositions } from "../domain/export";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const UNASSIGNED = "__unassigned__";

type ProjectOption = { id: string; label: string };

export default function CompositionsPage() {
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    Promise.all([listCompositions(controller.signal), listProjects()])
      .then(([lists, works]) => { if (!controller.signal.aborted) { setCompositions(lists); setProjects(works); } })
      .catch(err => { if (!controller.signal.aborted && err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const refresh = () => { void listCompositions().then(setCompositions).catch(() => undefined); };
    window.addEventListener("precify-compositions-updated", refresh);
    return () => window.removeEventListener("precify-compositions-updated", refresh);
  }, []);

  const assignedIds = useMemo(() => new Set(projects.flatMap(project => project.compositionIds)), [projects]);
  const projectOptions = useMemo<ProjectOption[]>(() => [
    { id: "", label: "Todas as obras" },
    ...projects.map(project => ({ id: project.id, label: project.name })),
    { id: UNASSIGNED, label: "Sem obra vinculada" },
  ], [projects]);

  const visibleCompositions = useMemo(() => {
    if (!projectFilter) return compositions;
    if (projectFilter === UNASSIGNED) return compositions.filter(composition => !assignedIds.has(composition.id));
    const project = projects.find(item => item.id === projectFilter);
    return project ? compositions.filter(composition => project.compositionIds.includes(composition.id)) : compositions;
  }, [compositions, projects, projectFilter, assignedIds]);
  const grandTotal = useMemo(() => visibleCompositions.reduce((sum, composition) => sum + composition.total, 0), [visibleCompositions]);
  const itemCount = useMemo(() => visibleCompositions.reduce((sum, composition) => sum + composition.items.length, 0), [visibleCompositions]);

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

  const setLinkedProjects = async (compositionId: string, projectIds: string[]) => {
    const key = `project:${compositionId}`;
    const selected = new Set(projectIds);
    setBusy(key); setError("");
    try {
      const changed = projects.filter(project => project.compositionIds.includes(compositionId) !== selected.has(project.id));
      const saved = await Promise.all(changed.map(project => saveProject({
        name: project.name,
        compositionIds: selected.has(project.id)
          ? [...new Set([...project.compositionIds, compositionId])]
          : project.compositionIds.filter(id => id !== compositionId),
      }, project.id)));
      setProjects(current => current.map(project => saved.find(item => item.id === project.id) ?? project));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar as obras vinculadas.");
    } finally { setBusy(""); }
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

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, md: 5 } }}>
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} gap={2}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={850}>Meu planejamento</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 32, md: 42 }, fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.05,
            background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Minhas composições</Typography>
          <Typography color="text.secondary" mt={.5}>Organize materiais como listas de compra e acompanhe o valor estimado.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 999, px: 2.5, alignSelf: { xs: "stretch", sm: "auto" } }}>Nova composição</Button>
      </Stack>

      <Paper variant="outlined" sx={{ mt: 3, p: { xs: 1.75, sm: 2 }, borderRadius: 4, borderColor: "#d9eae4",
        background: "linear-gradient(135deg,#f9fcfb 0%,#edf8f4 58%,#f7fffc 100%)" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
          <Stack direction="row" gap={1.25} alignItems="center">
            <Box sx={{ width: 42, height: 42, borderRadius: 3, display: "grid", placeItems: "center", color: "#fff",
              background: "linear-gradient(135deg,#185a44,#379e7b)" }}><PlaylistAddCheckRoundedIcon /></Box>
            <Box><Typography variant="caption" color="text.secondary">{visibleCompositions.length} composições · {itemCount} itens</Typography>
              <Typography fontWeight={800}>Total estimado</Typography></Box>
          </Stack>
          <Typography color="primary.dark" fontWeight={900} fontSize={{ xs: 20, sm: 26 }}>{currency.format(grandTotal)}</Typography>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Stack direction={{ xs: "column", sm: "row" }} gap={1.25} my={2.25} alignItems={{ sm: "center" }}>
        <Autocomplete
          size="small"
          disableClearable
          options={projectOptions}
          value={projectOptions.find(option => option.id === projectFilter) ?? projectOptions[0]}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_, option) => setProjectFilter(option.id)}
          noOptionsText="Nenhuma obra encontrada"
          slotProps={{ listbox: { sx: { maxHeight: 240, overflowY: "auto" } } }}
          renderInput={params => <TextField {...params} label="Filtrar por obra" placeholder="Digite para buscar" />}
          sx={{ width: { xs: "100%", sm: 290 }, "& .MuiOutlinedInput-root": { borderRadius: 999, bgcolor: "#fbfcfc" } }}
        />
        <Button component={RouterLink} to="/obras" sx={{ textTransform: "none", fontWeight: 700 }}>Gerenciar obras</Button>
        <Button disabled={loading || !visibleCompositions.length} onClick={() => downloadCompositions(visibleCompositions)} sx={{ ml: { sm: "auto" }, textTransform: "none", fontWeight: 700 }}>Exportar CSV</Button>
      </Stack>

      {loading ? <Box minHeight={240} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box> :
        !compositions.length ? <Paper variant="outlined" sx={{ mt: 2, p: 4, borderRadius: 4, textAlign: "center", borderStyle: "dashed" }}>
          <PlaylistAddCheckRoundedIcon color="primary" sx={{ fontSize: 42 }} />
          <Typography variant="h6" fontWeight={800} mt={1}>Sua primeira lista começa aqui</Typography>
          <Typography color="text.secondary" variant="body2" mt={.5}>Crie uma composição ou use o botão de adicionar nos materiais.</Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)} sx={{ mt: 2, borderRadius: 999 }}>Criar composição</Button>
        </Paper> : !visibleCompositions.length ? <Box sx={{ py: 5, textAlign: "center", borderTop: "1px solid #e6eeeb", borderBottom: "1px solid #e6eeeb" }}>
          <Typography fontWeight={800} color="#294d41">Nenhuma composição nessa obra.</Typography>
          <Typography color="text.secondary" fontSize={14} mt={.5}>Altere o filtro ou vincule uma composição a esta obra.</Typography>
        </Box> :
        <Stack gap={1.15} mt={1}>
          {visibleCompositions.map(composition => {
            const linkedProjects = projects.filter(project => project.compositionIds.includes(composition.id));
            const projectBusy = busy === `project:${composition.id}`;
            const linkedLabel = linkedProjects.length === 0
              ? "Sem obra"
              : linkedProjects.length === 1
                ? linkedProjects[0].name
                : `${linkedProjects[0].name} +${linkedProjects.length - 1} ${linkedProjects.length === 2 ? "obra" : "obras"}`;
            return <Accordion key={composition.id}
              disableGutters elevation={0} sx={{ border: "1px solid #dce9e5", borderRadius: "14px !important", overflow: "hidden",
                "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 1.5, sm: 2 }, minHeight: 62, bgcolor: "#fbfdfc", "& .MuiAccordionSummary-content": { my: 1 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" minWidth={0} pr={1}>
                  <Box minWidth={0}>
                    <Typography fontWeight={800} noWrap>{composition.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {linkedLabel} · {composition.items.length} {composition.items.length === 1 ? "item" : "itens"}
                    </Typography>
                  </Box>
                  <Typography color="primary.dark" fontWeight={850} ml={2}>{currency.format(composition.total)}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 1.25, sm: 2 }, pt: 0 }}>
                <Divider sx={{ mb: 1.25 }} />

                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} gap={1.25}
                  sx={{ py: 1, mb: 1.25, px: .25 }}>
                  <Box sx={{ pt: .6 }}>
                    <Typography fontWeight={800} fontSize={13.5} color="#294d41">Obras vinculadas</Typography>
                    <Typography variant="caption" color="text.secondary">Uma composição pode ser utilizada em várias obras.</Typography>
                  </Box>
                  {projects.length ? <Autocomplete
                    multiple
                    size="small"
                    disabled={projectBusy}
                    options={projects}
                    value={linkedProjects}
                    getOptionLabel={option => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, selected) => void setLinkedProjects(composition.id, selected.map(project => project.id))}
                    noOptionsText="Nenhuma obra encontrada"
                    limitTags={2}
                    slotProps={{ listbox: { sx: { maxHeight: 240, overflowY: "auto" } } }}
                    renderInput={params => <TextField {...params} placeholder={linkedProjects.length ? "Buscar outra obra" : "Buscar e vincular obras"} aria-label={`Obras da composição ${composition.name}`} />}
                    sx={{ width: { xs: "100%", sm: 390 },
                      "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#fbfcfc", minHeight: 42 },
                      "& .MuiChip-root": { bgcolor: "#eaf5f1", color: "#245342", borderRadius: 2, fontWeight: 700 } }}
                  /> : <Button component={RouterLink} to="/obras" size="small" variant="outlined" sx={{ borderRadius: 999, textTransform: "none" }}>
                    Criar uma obra
                  </Button>}
                </Stack>

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
            </Accordion>;
          })}
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
    </Box>
  </Container>;
}
