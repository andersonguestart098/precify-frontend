import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, ButtonBase, CircularProgress, Container,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, TextField,
  Tooltip, Typography
} from "@mui/material";
import type { Composition } from "../domain/composition";
import type { CatalogOffer, CatalogResult, CatalogSearchPage } from "../domain/search";
import {
  addCompositionItem, createComposition, deleteComposition, removeCompositionItem, saveProject, searchProducts,
  updateCompositionItemQuantity, type Project
} from "../services/api";
import { ProtectedImage } from "../components/ProtectedImage";
import { useAccount } from "../auth/session";
import {
  getCachedCompositions, getCachedProjects, loadCompositionsCached, loadProjectsCached,
  saveCachedCompositions, saveCachedProjects,
} from "../services/appWarmCache";
import { downloadCompositions } from "../domain/export";
import { useWorkspaceFavorites } from "../hooks/useWorkspaceFavorites";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const UNASSIGNED = "__unassigned__";

type ProjectOption = { id: string; label: string };

function CompositionProductPicker({ composition, onAdded, onClose }: {
  composition: Composition;
  onAdded: (updated: Composition) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSearchPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState("");
  const [error, setError] = useState("");
  const [addedName, setAddedName] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      searchProducts({ familyCode: "", query: query.trim(), criteria: [], includeAlternatives: false }, 0, 8, controller.signal)
        .then(data => setResults(data))
        .catch(reason => { if (!controller.signal.aborted) { setResults(null); setError(reason instanceof Error ? reason.message : "Não foi possível buscar produtos."); } })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, query ? 250 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const addProduct = async (result: CatalogResult, offer?: CatalogOffer) => {
    const key = `${result.material.materialCode}:${offer?.productId ?? "catalog"}:${offer?.optionCode ?? ""}`;
    setBusyCode(key); setError(""); setAddedName("");
    try {
      const updated = await addCompositionItem(composition.id, {
        materialCode: result.material.materialCode,
        productId: offer?.productId ?? null,
        name: offer?.name ?? result.material.materialName,
        imageUrl: offer?.imageUrl ?? result.imageUrl ?? result.material.imageUrl ?? null,
        supplier: offer?.quote.supplier ?? null,
        unit: "un",
        quantity: 1,
        unitPrice: offer?.quote.value ?? 0,
      });
      onAdded(updated);
      setAddedName(offer?.name ?? result.material.materialName);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível adicionar o produto.");
    } finally { setBusyCode(""); }
  };

  return <Box sx={{ mt: 1.5, p: { xs: 1.25, sm: 1.75 }, border: "1px solid #c9e2d7", borderRadius: 3, bgcolor: "#f7fcf9" }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mb={1}>
      <Box minWidth={0}>
        <Typography fontWeight={850} color="#21483b" fontSize={14}>Adicionar produtos</Typography>
        <Typography color="text.secondary" fontSize={11}>Busque e selecione sem sair da composição.</Typography>
      </Box>
      <Button size="small" onClick={onClose} sx={{ textTransform: "none", flexShrink: 0 }}>Fechar</Button>
    </Stack>
    <TextField autoFocus fullWidth size="small" value={query} onChange={event => setQuery(event.target.value)}
      placeholder="Buscar produto ou especificação"
      slotProps={{ input: { startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 19, color: "#698c7b" }} /> },
        htmlInput: { "aria-label": "Buscar produtos para esta composição" } }}
      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 3 } }} />
    {addedName && <Alert severity="success" sx={{ mt: 1, py: 0 }}>“{addedName}” adicionado à composição.</Alert>}
    {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    <Box aria-busy={loading} sx={{ position: "relative", mt: 1.25, height: { xs: 136, sm: 184 }, minWidth: 0 }}>
      <Box sx={{ height: "100%", overflowY: "auto", scrollbarWidth: "thin", opacity: loading ? .4 : 1, pointerEvents: loading ? "none" : "auto" }}>
        {results?.content.length ? <Stack gap={.75}>
          {results.content.flatMap(result => (result.offers.length ? result.offers : [undefined]).map((offer, index) => {
            const key = `${result.material.materialCode}:${offer?.productId ?? "catalog"}:${offer?.optionCode ?? ""}`;
            return <Stack key={`${key}:${index}`} direction="row" alignItems="center" gap={1} sx={{
              p: 1, minWidth: 0, borderRadius: 2.5, bgcolor: "#fff", border: "1px solid #e1ece7",
            }}>
              <ProtectedImage src={offer?.imageUrl ?? result.imageUrl ?? result.material.imageUrl} alt=""
                sx={{ width: 42, height: 42, borderRadius: 2, flexShrink: 0 }} />
              <Box minWidth={0} flex={1}>
                <Typography fontWeight={800} color="#254b3e" fontSize={12} sx={{ overflowWrap: "anywhere" }}>
                  {offer?.name ?? result.material.materialName}
                </Typography>
                <Typography color="text.secondary" fontSize={10.5}>
                  {result.material.materialCode}{offer?.quote.supplier ? ` · ${offer.quote.supplier}` : " · Sem cotação"}
                </Typography>
                {offer && <Typography fontWeight={800} color="#176047" fontSize={11}>{currency.format(offer.quote.value)}/un</Typography>}
              </Box>
              <IconButton aria-label={`Adicionar ${offer?.name ?? result.material.materialName} à composição`}
                disabled={Boolean(busyCode)} onClick={() => void addProduct(result, offer)} sx={{
                  flexShrink: 0, width: 38, height: 38, color: "#17664f", bgcolor: "#e7f4ed",
                  "&:hover": { bgcolor: "#d7eddf" },
                }}>
                {busyCode === key ? <CircularProgress size={18} /> : <AddRoundedIcon />}
              </IconButton>
            </Stack>;
          }))}
        </Stack> : !loading && !error ? <Typography color="text.secondary" fontSize={12} py={2} textAlign="center">
          Nenhum produto encontrado. Tente outra especificação.
        </Typography> : null}
      </Box>
      {loading && <Box role="status" aria-label="Buscando produtos" sx={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        bgcolor: "rgba(247,252,249,.68)", borderRadius: 2,
      }}><CircularProgress size={22} /></Box>}
    </Box>
  </Box>;
}

export default function CompositionsPage() {
  const user = useAccount();
  const [params, setParams] = useSearchParams();
  const workspaceFavorites = useWorkspaceFavorites();
  const [compositions, setCompositions] = useState<Composition[]>(() => getCachedCompositions(user.id) ?? []);
  const [projects, setProjects] = useState<Project[]>(() => getCachedProjects(user.id) ?? []);
  const [projectFilter, setProjectFilter] = useState(() => params.get("obra") ?? "");
  const [loading, setLoading] = useState(() => !(getCachedCompositions(user.id) && getCachedProjects(user.id)));
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [addingTo, setAddingTo] = useState("");

  useEffect(() => { setProjectFilter(params.get("obra") ?? ""); }, [params]);

  useEffect(() => {
    let active = true;
    if (!(getCachedCompositions(user.id) && getCachedProjects(user.id))) setLoading(true);
    setError("");
    Promise.all([loadCompositionsCached(user.id), loadProjectsCached(user.id)])
      .then(([lists, works]) => { if (active) { setCompositions(lists); setProjects(works); } })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : "Não foi possível carregar as composições."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.id]);

  useEffect(() => {
    const refresh = () => {
      void loadCompositionsCached(user.id, true).then(setCompositions).catch(() => undefined);
    };
    const syncFromCache = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId && detail.userId !== user.id) return;
      const cachedCompositions = getCachedCompositions(user.id);
      const cachedProjects = getCachedProjects(user.id);
      if (cachedCompositions) setCompositions(cachedCompositions);
      if (cachedProjects) setProjects(cachedProjects);
    };
    window.addEventListener("precify-compositions-updated", refresh);
    window.addEventListener("precify-app-data-refreshed", syncFromCache);
    return () => {
      window.removeEventListener("precify-compositions-updated", refresh);
      window.removeEventListener("precify-app-data-refreshed", syncFromCache);
    };
  }, [user.id]);

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

  useEffect(() => {
    if (loading || params.get("adicionar") !== "1") return;
    const first = visibleCompositions[0];
    if (first) {
      setExpandedId(first.id);
      setAddingTo(first.id);
      window.requestAnimationFrame(() => document.getElementById(`composition-${first.id}`)?.scrollIntoView({ block: "start", behavior: "smooth" }));
    } else setCreateOpen(true);
    setParams(current => {
      const next = new URLSearchParams(current);
      next.delete("adicionar");
      return next;
    }, { replace: true });
  }, [loading, params, setParams, visibleCompositions]);

  const replace = (updated: Composition) =>
    setCompositions(current => {
      const next = current.map(composition => composition.id === updated.id ? updated : composition);
      saveCachedCompositions(user.id, next);
      return next;
    });

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
        projectType: project.projectType,
        location: project.location,
        notes: project.notes,
        compositionIds: selected.has(project.id)
          ? [...new Set([...project.compositionIds, compositionId])]
          : project.compositionIds.filter(id => id !== compositionId),
      }, project.id)));
      setProjects(current => {
        const next = current.map(project => saved.find(item => item.id === project.id) ?? project);
        saveCachedProjects(user.id, next);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar as obras vinculadas.");
    } finally { setBusy(""); }
  };

  const removeList = async (composition: Composition) => {
    if (!window.confirm(`Excluir a composição “${composition.name}”?`)) return;
    setBusy(composition.id); setError("");
    try {
      await deleteComposition(composition.id);
      setCompositions(current => {
        const next = current.filter(entry => entry.id !== composition.id);
        saveCachedCompositions(user.id, next);
        return next;
      });
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível excluir a composição."); }
    finally { setBusy(""); }
  };

  const create = async () => {
    const name = newName.trim();
    if (!name) { setError("Dê um nome para a composição."); return; }
    setBusy("new"); setError("");
    try {
      const created = await createComposition(name);
      setCompositions(current => {
        const next = [created, ...current];
        saveCachedCompositions(user.id, next);
        return next;
      });
      setExpandedId(created.id);
      setAddingTo(created.id);
      setNewName(""); setCreateOpen(false);
      const selectedProject = projects.find(project => project.id === projectFilter);
      if (selectedProject) {
        try {
          const linked = await saveProject({
            name: selectedProject.name, projectType: selectedProject.projectType,
            location: selectedProject.location, notes: selectedProject.notes,
            compositionIds: [...new Set([...selectedProject.compositionIds, created.id])],
          }, selectedProject.id);
          setProjects(current => {
            const next = current.map(project => project.id === linked.id ? linked : project);
            saveCachedProjects(user.id, next);
            return next;
          });
        } catch (reason) {
          setProjectFilter("");
          setError(`Composição criada, mas não vinculada à obra. ${reason instanceof Error ? reason.message : "Tente vincular novamente."}`);
        }
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível criar a composição."); }
    finally { setBusy(""); }
  };

  return <Container maxWidth="xl" component="main" sx={{ py: { xs: 2.5, md: 5 } }}>
    <Box sx={{ maxWidth: 1160, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} gap={2}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={850}>Meu planejamento</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 32, md: 42 }, fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.05,
            background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Minhas composições</Typography>
          <Typography color="text.secondary" mt={.5}>Organize produtos em composições e acompanhe o valor estimado.</Typography>
        </Box>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={{ xs: .85, md: 1 }}
          sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>
          <Typography sx={{ fontSize: { xs: 12.4, md: 13 }, fontWeight: 820, color: "#2f5c4c", letterSpacing: "-.01em" }}>
            Nova composição
          </Typography>
          <ButtonBase onClick={() => setCreateOpen(true)} aria-label="Criar nova composição" sx={{
            width: { xs: 42, md: 44 }, height: { xs: 42, md: 44 }, borderRadius: "50%", flexShrink: 0,
            color: "#17664f",
            background: "linear-gradient(145deg,rgba(255,255,255,.98),rgba(232,244,239,.96))",
            border: "1px solid rgba(0,107,79,.14)",
            boxShadow: "0 4px 12px rgba(24,60,48,.08), inset 0 1px 0 rgba(255,255,255,.92)",
            transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",
            "&:active": { transform: "scale(.96)" },
            "&.Mui-focusVisible": { outline: "2px solid rgba(38,155,120,.35)", outlineOffset: 3 },
            "@media (hover:hover)": {
              "&:hover": {
                transform: "translateY(-1px)", borderColor: "rgba(0,107,79,.24)",
                background: "linear-gradient(145deg,#ffffff,#e3f1ec)",
                boxShadow: "0 6px 15px rgba(24,60,48,.11), inset 0 1px 0 rgba(255,255,255,.96)",
              },
            },
            "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } },
          }}>
            <AddRoundedIcon sx={{ fontSize: { xs: 22, md: 23 } }} />
          </ButtonBase>
        </Stack>
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

      {(error || workspaceFavorites.error) && <Alert severity="error" sx={{ mt: 2 }}>{error || workspaceFavorites.error}</Alert>}

      <Stack direction="row" gap={.75} my={2.25} alignItems="center" flexWrap="wrap" sx={{
        "& > .MuiButton-root": { minHeight: 36, textTransform: "none", fontWeight: 750, fontSize: 12 },
      }}>
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
        <Button component={RouterLink} to="/obras">Gerenciar obras</Button>
        {projects.some(project => project.id === projectFilter) && <Button component={RouterLink}
          to={`/obras/${encodeURIComponent(projectFilter)}/mao-de-obra`}>Equipe e serviços desta obra</Button>}
        <Button disabled={loading || !visibleCompositions.length} onClick={() => downloadCompositions(visibleCompositions)} sx={{ ml: { sm: "auto" } }}>Exportar CSV</Button>
      </Stack>

      {loading ? <Box minHeight={240} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box> :
        !compositions.length ? <Paper variant="outlined" sx={{ mt: 2, p: 4, borderRadius: 4, textAlign: "center", borderStyle: "dashed" }}>
          <PlaylistAddCheckRoundedIcon color="primary" sx={{ fontSize: 42 }} />
          <Typography variant="h6" fontWeight={800} mt={1}>Sua primeira lista começa aqui</Typography>
          <Typography color="text.secondary" variant="body2" mt={.5}>Crie uma composição para adicionar produtos e vincular obras.</Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)} sx={{ mt: 2, borderRadius: 999 }}>Criar composição</Button>
        </Paper> : !visibleCompositions.length ? <Box sx={{ py: 5, textAlign: "center", borderTop: "1px solid #e6eeeb", borderBottom: "1px solid #e6eeeb" }}>
          <Typography fontWeight={800} color="#294d41">Nenhuma composição nessa obra.</Typography>
          <Typography color="text.secondary" fontSize={14} mt={.5}>Crie uma composição ou vincule uma existente a esta obra.</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="center" mt={2}>
            <Button variant="outlined" onClick={() => setCreateOpen(true)} sx={{ textTransform: "none", borderRadius: 999 }}>Criar composição</Button>
            {projects.some(project => project.id === projectFilter) && <Button component={RouterLink}
              to={`/obras?vincular=${encodeURIComponent(projectFilter)}`}
              sx={{ textTransform: "none", borderRadius: 999 }}>Vincular existente</Button>}
          </Stack>
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
            return <Box key={composition.id} id={`composition-${composition.id}`} sx={{ minWidth: 0, scrollMarginTop: { xs: 90, md: 80 } }}><Accordion
              expanded={expandedId === composition.id}
              onChange={(_, open) => { setExpandedId(open ? composition.id : ""); if (!open) setAddingTo(""); }}
              disableGutters elevation={0} sx={{ border: "1px solid #dce9e5", borderRadius: "14px !important", overflow: "hidden", position: "relative", minWidth: 0,
                "&::before": { display: "none" } }}>
              <Box component="span" id={`composition-heading-${composition.id}`} aria-controls={`composition-details-${composition.id}`}
                aria-label={composition.name} sx={{ display: "block", position: "relative" }}>
              <AccordionSummary id={`composition-toggle-${composition.id}`} aria-controls={`composition-details-${composition.id}`}
                expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 1.5, sm: 2 }, minHeight: 62, bgcolor: "#fbfdfc", "& .MuiAccordionSummary-content": { my: 1, minWidth: 0, mr: 6.5 } }}>
                <Stack direction="row" alignItems="center" width="100%" minWidth={0} pr={.5}>
                  <Box minWidth={0} flex={1}>
                    <Typography fontWeight={800} noWrap>{composition.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {linkedLabel} · {composition.items.length} {composition.items.length === 1 ? "item" : "itens"}
                    </Typography>
                    <Typography color="primary.dark" fontWeight={850} sx={{ display: { xs: "block", sm: "none" }, fontSize: 12, mt: .25 }}>
                      {currency.format(composition.total)}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" gap={.55} flexShrink={0} ml={1} sx={{ display: { xs: "none", sm: "flex" } }}>
                    <Typography color="primary.dark" fontWeight={850}>{currency.format(composition.total)}</Typography>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <IconButton
                size="small"
                aria-label={workspaceFavorites.favorites.COMPOSITION.has(composition.id) ? "Remover composição dos favoritos" : "Favoritar composição"}
                aria-pressed={workspaceFavorites.favorites.COMPOSITION.has(composition.id)}
                disabled={workspaceFavorites.loading || workspaceFavorites.isBusy("COMPOSITION", composition.id)}
                onClick={() => void workspaceFavorites.toggle("COMPOSITION", composition.id)}
                sx={{
                  position: "absolute", top: "50%", right: 46, transform: "translateY(-50%)", zIndex: 1,
                  width: 34, height: 34, borderRadius: "50%",
                  color: workspaceFavorites.favorites.COMPOSITION.has(composition.id) ? "#a56d00" : "#71867c",
                  bgcolor: workspaceFavorites.favorites.COMPOSITION.has(composition.id) ? "#fff9eb" : "#f8fbfa",
                  border: "1px solid",
                  borderColor: workspaceFavorites.favorites.COMPOSITION.has(composition.id) ? "#e7d8b0" : "#dce8e4",
                  "&:hover": { bgcolor: workspaceFavorites.favorites.COMPOSITION.has(composition.id) ? "#fff1cc" : "#eaf3ef" },
                  "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: 2 },
                }}
              >
                {workspaceFavorites.favorites.COMPOSITION.has(composition.id) ? <StarRoundedIcon sx={{ fontSize: 19 }} /> : <StarBorderRoundedIcon sx={{ fontSize: 19 }} />}
              </IconButton>
              </Box>
              <AccordionDetails sx={{ p: { xs: 1.25, sm: 2 }, pt: 0, minWidth: 0 }}>
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
                    renderInput={params => <TextField {...params} placeholder={linkedProjects.length ? "Buscar outra obra" : "Buscar e vincular obras"}
                      slotProps={{ htmlInput: { ...params.inputProps, "aria-label": `Obras da composição ${composition.name}` } }} />}
                    sx={{ width: { xs: "100%", sm: 390 }, minWidth: 0, maxWidth: "100%",
                      "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#fbfcfc", minHeight: 42 },
                      "& .MuiChip-root": { bgcolor: "#eaf5f1", color: "#245342", borderRadius: 2, fontWeight: 700, maxWidth: "calc(100% - 48px)" } }}
                  /> : <Button component={RouterLink} to="/obras" size="small" variant="outlined" sx={{ borderRadius: 999, textTransform: "none" }}>
                    Criar uma obra
                  </Button>}
                </Stack>

                <Divider sx={{ mb: 1.25 }} />
                {!composition.items.length ? <Box textAlign="center" py={3}>
                  <Inventory2OutlinedIcon color="disabled" />
                  <Typography color="text.secondary" variant="body2">Nenhum produto nesta composição.</Typography>
                </Box> : <Stack divider={<Divider flexItem />}>
                  {composition.items.map(item => {
                    const key = `${composition.id}:${item.id}`;
                    return <Stack key={item.id} direction="row" gap={1.25} py={1.25} alignItems="center" minWidth={0}>
                      <ProtectedImage src={item.imageUrl} alt="" sx={{ width: 52, height: 52, borderRadius: 2, flexShrink: 0, bgcolor: "#fff" }} />
                      <Box minWidth={0} flex={1}>
                        <Typography component={RouterLink} to={`/produtos/${encodeURIComponent(item.materialCode)}`}
                          color="text.primary" fontWeight={750} fontSize={13.5} lineHeight={1.2}
                          sx={{ textDecoration: "none", display: "block", "&:hover": { color: "primary.main" } }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {item.supplier || "Sem fornecedor"} · {currency.format(item.unitPrice)}/{item.unit}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mt={.75} minWidth={0}>
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
                  <Button onClick={() => setAddingTo(current => current === composition.id ? "" : composition.id)}
                    aria-expanded={addingTo === composition.id} size="small" startIcon={<AddRoundedIcon />}
                    sx={{ textTransform: "none", fontWeight: 800 }}>Adicionar produtos</Button>
                  <Tooltip title="Excluir composição"><span><IconButton size="small" disabled={busy === composition.id}
                    aria-label={`Excluir composição ${composition.name}`} onClick={() => void removeList(composition)} sx={{ color: "#9d4b4b" }}>
                    {busy === composition.id ? <CircularProgress size={18} /> : <DeleteOutlineRoundedIcon />}
                  </IconButton></span></Tooltip>
                </Stack>
                {addingTo === composition.id && <CompositionProductPicker composition={composition} onAdded={replace} onClose={() => setAddingTo("")} />}
              </AccordionDetails>
            </Accordion></Box>;
          })}
        </Stack>}

      <Dialog open={createOpen} onClose={busy === "new" ? undefined : () => setCreateOpen(false)} fullWidth maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle fontWeight={800}>Nova composição</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" variant="body2" mb={2}>Crie uma lista para uma obra, cômodo ou etapa do projeto.</Typography>
          <TextField autoFocus fullWidth label="Nome" placeholder="Ex.: Alvenaria interna" value={newName}
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
