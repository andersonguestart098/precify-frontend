import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LinkOffRoundedIcon from "@mui/icons-material/LinkOffRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, ButtonBase, CircularProgress, Collapse, Container,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, TextField,
  Tooltip, Typography, useMediaQuery
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
const UNASSIGNED = "__unassigned__";

type ProjectOption = { id: string; label: string };

function CompositionProductPicker({ composition, onAdded }: {
  composition: Composition;
  onAdded: (updated: Composition) => void;
}) {
  const isWideScreen = useMediaQuery("(min-width:600px)");
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

  return <Box sx={{ mt: .75, mb: 1.25, px: .35 }}>
    <TextField autoFocus={isWideScreen} fullWidth size="small" value={query} onChange={event => setQuery(event.target.value)}
      placeholder="Buscar produto ou especificação"
      slotProps={{ input: { startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 19, color: "#698c7b" }} /> },
        htmlInput: { "aria-label": "Buscar produtos para esta composição" } }}
      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: "10px", minHeight: 42 } }} />
    {addedName && <Alert severity="success" sx={{ mt: 1, py: 0 }}>“{addedName}” adicionado à composição.</Alert>}
    {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    <Box aria-busy={loading} sx={{ position: "relative", mt: .8, height: { xs: "min(320px, 42dvh)", sm: 336 }, minWidth: 0 }}>
      <Box sx={{ height: "100%", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", touchAction: "pan-y",
        scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, opacity: loading ? .4 : 1, pointerEvents: loading ? "none" : "auto" }}>
        {results?.content.length ? <Stack gap={.6}>
          {results.content.flatMap(result => (result.offers.length ? result.offers : [undefined]).map((offer, index) => {
            const key = `${result.material.materialCode}:${offer?.productId ?? "catalog"}:${offer?.optionCode ?? ""}`;
            return <Stack key={`${key}:${index}`} direction="row" alignItems="center" gap={.8} sx={{
              px: .85, py: .65, minHeight: 67, minWidth: 0, borderRadius: "9px", bgcolor: "#fff", border: "1px solid #e1ece7",
            }}>
              <ProtectedImage src={offer?.imageUrl ?? result.imageUrl ?? result.material.imageUrl} alt=""
                sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0 }} />
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
                  flexShrink: 0, width: 36, height: 36, color: "#17664f", bgcolor: "#e7f4ed",
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

function CompositionWorkPicker({ composition, projects, linkedProjects, busy, onToggle }: {
  composition: Composition;
  projects: Project[];
  linkedProjects: Project[];
  busy: boolean;
  onToggle: (project: Project, linked: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const linkedIds = new Set(linkedProjects.map(project => project.id));
  const visible = projects.filter(project => project.name.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")));

  return <Box sx={{ px: .35, pt: .55, pb: 1.1 }}>
    {projects.length ? <>
      <TextField fullWidth size="small" value={query} onChange={event => setQuery(event.target.value)}
        placeholder="Buscar obra pelo nome"
        slotProps={{ input: { startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 19, color: "#698c7b" }} /> },
          htmlInput: { "aria-label": `Buscar obras para ${composition.name}` } }}
        sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: "10px", minHeight: 42 } }} />
      <Box sx={{ mt: .8, height: { xs: "min(320px, 42dvh)", sm: 336 }, overflowY: "auto", overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch", touchAction: "pan-y", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
        {visible.length ? <Stack gap={.6}>
          {visible.map(project => {
            const linked = linkedIds.has(project.id);
            return <Stack key={project.id} direction="row" alignItems="center" gap={.8} sx={{
              px: .85, py: .65, minHeight: 67, minWidth: 0, borderRadius: "9px", bgcolor: linked ? "#f4fbf7" : "#fff", border: "1px solid #e1ece7",
            }}>
              <Box sx={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 1.5, flexShrink: 0,
                bgcolor: "#e9f4f0", color: "#28634f" }}><HomeWorkOutlinedIcon sx={{ fontSize: 19 }} /></Box>
              <Box minWidth={0} flex={1}>
                <Typography fontWeight={800} color="#254b3e" fontSize={12} noWrap>{project.name}</Typography>
                <Typography color="text.secondary" fontSize={10.5} noWrap>{linked ? "Vinculada à composição" : project.location || "Obra cadastrada"}</Typography>
              </Box>
              <IconButton aria-label={linked ? `Remover ${composition.name} da obra ${project.name}` : `Adicionar ${composition.name} à obra ${project.name}`}
                disabled={busy} onClick={() => onToggle(project, linked)} sx={{ flexShrink: 0, width: 36, height: 36,
                  color: linked ? "#5b7469" : "#17664f", bgcolor: linked ? "#e8f0ec" : "#e7f4ed", "&:hover": { bgcolor: linked ? "#dae9e1" : "#d7eddf" } }}>
                {linked ? <LinkOffRoundedIcon sx={{ fontSize: 19 }} /> : <AddRoundedIcon />}
              </IconButton>
            </Stack>;
          })}
        </Stack> : <Typography color="text.secondary" fontSize={12} py={2} textAlign="center">Nenhuma obra encontrada.</Typography>}
      </Box>
    </> : <Button component={RouterLink} to="/obras?new=1" size="small" variant="outlined" sx={{ borderRadius: 2, textTransform: "none" }}>Cadastrar obra</Button>}
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
  const [linksOpenId, setLinksOpenId] = useState("");
  const [pendingScrollId, setPendingScrollId] = useState("");

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
  const creationProject = projects.find(project => project.id === projectFilter);

  useEffect(() => {
    if (loading || params.get("adicionar") !== "1") return;
    const first = visibleCompositions[0];
    if (first) {
      setExpandedId(first.id);
      setAddingTo(first.id);
      setPendingScrollId(first.id);
    } else { setError(""); setCreateOpen(true); }
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
    if (busy === "new") return;
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

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, md: 4.5 }, pb: { xs: 5, md: 5 } }}>
    <Box sx={{ maxWidth: 1020, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1.4}>
        <Box>
          <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.3 }}>Planejamento de materiais</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 30, md: 42 }, fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.02,
            background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Minhas composições</Typography>
          <Typography color="text.secondary" sx={{ mt: .5, fontSize: { xs: 12.5, md: 14 } }}>Organize os produtos e vincule as composições às obras.</Typography>
        </Box>
        <Stack direction="row" justifyContent="flex-end" sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>
          <ButtonBase onClick={() => { setError(""); setCreateOpen(true); }} aria-label="Criar nova composição" sx={{
            display: "inline-flex", alignItems: "center", gap: { xs: .85, md: 1 },
            minHeight: 44, pl: 1.2, borderRadius: 999, color: "#2f5c4c",
            transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",
            "&:active": { transform: "scale(.96)" },
            "&.Mui-focusVisible": { outline: "2px solid rgba(38,155,120,.35)", outlineOffset: 3 },
            "@media (hover:hover)": {
              "&:hover": {
                transform: "translateY(-1px)", color: "#17664f",
                "& .new-composition-icon": {
                  borderColor: "rgba(0,107,79,.24)",
                  background: "linear-gradient(145deg,#ffffff,#e3f1ec)",
                  boxShadow: "0 6px 15px rgba(24,60,48,.11), inset 0 1px 0 rgba(255,255,255,.96)",
                },
              },
            },
            "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } },
          }}>
            <Typography component="span" sx={{ fontSize: { xs: 12.4, md: 13 }, fontWeight: 820, letterSpacing: "-.01em" }}>
              Nova composição
            </Typography>
            <Box component="span" className="new-composition-icon" sx={{
              width: { xs: 42, md: 44 }, height: { xs: 42, md: 44 }, borderRadius: "50%", flexShrink: 0,
              display: "grid", placeItems: "center", color: "#17664f",
              background: "linear-gradient(145deg,rgba(255,255,255,.98),rgba(232,244,239,.96))",
              border: "1px solid rgba(0,107,79,.14)",
              boxShadow: "0 4px 12px rgba(24,60,48,.08), inset 0 1px 0 rgba(255,255,255,.92)",
              transition: "box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",
            }}>
              <AddRoundedIcon sx={{ fontSize: { xs: 22, md: 23 } }} />
            </Box>
          </ButtonBase>
        </Stack>
      </Stack>

      {(error || workspaceFavorites.error) && <Alert severity="error" sx={{ mt: 2 }}>{error || workspaceFavorites.error}</Alert>}

      <Box component="section" aria-label="Filtrar composições" sx={{ mt: { xs: 2.5, md: 3 } }}>
        <Box sx={{ mb: 1.2 }}>
          <Box>
            <Typography fontWeight={900} color="#21483b" sx={{ fontSize: { xs: 17, md: 19 } }}>Composições</Typography>
            <Typography color="text.secondary" sx={{ mt: .2, fontSize: { xs: 11.5, md: 12.5 } }}>
              {visibleCompositions.length} {visibleCompositions.length === 1 ? "composição" : "composições"} · {itemCount} {itemCount === 1 ? "produto" : "produtos"} · {currency.format(grandTotal)} estimados
            </Typography>
          </Box>
        </Box>
      <Stack direction="row" gap={.75} alignItems="center" flexWrap="wrap" sx={{
        "& > .MuiButton-root": { minHeight: 36, textTransform: "none", fontWeight: 750, fontSize: 11.5 },
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
          sx={{ width: { xs: "100%", sm: 290 }, mr: { sm: "auto" }, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff", minHeight: 42 }, "& fieldset": { borderColor: "#d9e6e1" } }}
        />
        <Button disabled={loading || !visibleCompositions.length} onClick={() => downloadCompositions(visibleCompositions)}>Exportar CSV</Button>
      </Stack>
      </Box>

      {loading ? <Box minHeight={240} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box> :
        !compositions.length ? <Paper variant="outlined" sx={{ mt: 2, p: 4, borderRadius: 4, textAlign: "center", borderStyle: "dashed" }}>
          <PlaylistAddCheckRoundedIcon color="primary" sx={{ fontSize: 42 }} />
          <Typography variant="h6" fontWeight={800} mt={1}>Sua primeira lista começa aqui</Typography>
          <Typography color="text.secondary" variant="body2" mt={.5}>Crie uma composição para adicionar produtos e vincular obras.</Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setError(""); setCreateOpen(true); }} sx={{ mt: 2, borderRadius: 999 }}>Criar composição</Button>
        </Paper> : !visibleCompositions.length ? <Box sx={{ py: 5, textAlign: "center", borderTop: "1px solid #e6eeeb", borderBottom: "1px solid #e6eeeb" }}>
          <Typography fontWeight={800} color="#294d41">Nenhuma composição nessa obra.</Typography>
          <Typography color="text.secondary" fontSize={14} mt={.5}>Crie uma composição ou vincule uma existente a esta obra.</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="center" mt={2}>
            <Button variant="outlined" onClick={() => { setError(""); setCreateOpen(true); }} sx={{ textTransform: "none", borderRadius: 999 }}>Criar composição</Button>
            {projects.some(project => project.id === projectFilter) && <Button component={RouterLink}
              to={`/obras?vincular=${encodeURIComponent(projectFilter)}`}
              sx={{ textTransform: "none", borderRadius: 999 }}>Vincular existente</Button>}
          </Stack>
        </Box> :
        <Stack gap={.8} mt={1.35}>
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
              onChange={(_, open) => { setExpandedId(open ? composition.id : ""); if (!open) { setAddingTo(""); setPendingScrollId(""); } }}
              slotProps={{ transition: { onEntered: () => {
                if (pendingScrollId !== composition.id) return;
                document.getElementById(`composition-${composition.id}`)?.scrollIntoView({
                  block: "start", behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                });
                setPendingScrollId("");
              } } }}
              disableGutters elevation={0} sx={{ border: "1px solid #d9e6e1", borderRadius: "11px !important", overflow: "hidden", position: "relative", minWidth: 0,
                bgcolor: "#fff", boxShadow: expandedId === composition.id ? "0 7px 22px rgba(21,72,56,.055)" : "0 2px 10px rgba(21,72,56,.025)",
                "&::before": { display: "none" }, "&:hover": { borderColor: "#bfd8cf" } }}>
              <Box component="span" id={`composition-heading-${composition.id}`} aria-controls={`composition-details-${composition.id}`}
                aria-label={composition.name} sx={{ display: "block", position: "relative" }}>
              <AccordionSummary id={`composition-toggle-${composition.id}`} aria-controls={`composition-details-${composition.id}`}
                expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 20, color: "#6f877e" }} />} sx={{ px: { xs: 1.35, sm: 1.7 }, minHeight: 64, bgcolor: expandedId === composition.id ? "#f8fcfa" : "#fff", "& .MuiAccordionSummary-content": { my: .9, minWidth: 0, mr: 6.5 } }}>
                <Stack direction="row" alignItems="center" width="100%" minWidth={0} pr={.5} gap={1}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "9px", display: "grid", placeItems: "center", flexShrink: 0,
                    bgcolor: "#e9f4f0", color: "#28634f", border: "1px solid #dcebe6" }}><PlaylistAddCheckRoundedIcon sx={{ fontSize: 20 }} /></Box>
                  <Box minWidth={0} flex={1}>
                    <Typography fontWeight={850} color="#21483b" noWrap sx={{ fontSize: { xs: 13.5, sm: 15 } }}>{composition.name}</Typography>
                    <Typography color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 10.5, mt: .15 }}>
                      {linkedLabel} · {composition.items.length} {composition.items.length === 1 ? "produto" : "produtos"}
                    </Typography>
                    <Typography color="#176047" fontWeight={850} sx={{ display: { xs: "block", sm: "none" }, fontSize: 11, mt: .15 }}>
                      {currency.format(composition.total)}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" gap={.55} flexShrink={0} ml={1} sx={{ display: { xs: "none", sm: "flex" } }}>
                    <Typography color="#176047" fontWeight={850} fontSize={13}>{currency.format(composition.total)}</Typography>
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
              <AccordionDetails sx={{ px: { xs: 1.05, sm: 1.35 }, pt: 0, pb: 1.25, minWidth: 0 }}>
                <Divider sx={{ mb: .75 }} />
                <Typography fontWeight={850} color="#21483b" fontSize={12.5} sx={{ px: .35, pb: .5 }}>Produtos ({composition.items.length})</Typography>
                {!composition.items.length ? <Box textAlign="center" py={2.5} sx={{ bgcolor: "#fbfdfc", borderRadius: 2 }}>
                  <Inventory2OutlinedIcon sx={{ color: "#87a096", fontSize: 26 }} />
                  <Typography color="text.secondary" fontSize={11.5}>Nenhum produto nesta composição.</Typography>
                </Box> : <Stack divider={<Divider flexItem />}>
                  {composition.items.map(item => {
                    const key = `${composition.id}:${item.id}`;
                    return <Stack key={item.id} direction="row" gap={.75} py={.55} px={.25} alignItems="center" minWidth={0}>
                      <ProtectedImage src={item.imageUrl} alt="" sx={{ width: 32, height: 32, borderRadius: 1.5, flexShrink: 0, bgcolor: "#fff" }} />
                      <Box minWidth={0} flex={1}>
                        <Typography component={RouterLink} to={`/produtos/${encodeURIComponent(item.materialCode)}`}
                          color="#284d41" fontWeight={750} fontSize={12.5} lineHeight={1.2}
                          sx={{ textDecoration: "none", display: "block", "&:hover": { color: "primary.main" } }}>{item.name}</Typography>
                        <Typography color="text.secondary" noWrap display="block" fontSize={10}>
                          {item.supplier || "Sem fornecedor"} · {currency.format(item.unitPrice)}/{item.unit}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={.6} mt={.35} minWidth={0}>
                          <TextField key={item.quantity} type="number" size="small" defaultValue={item.quantity}
                            disabled={busy === key} aria-label={`Quantidade de ${item.name}`}
                            slotProps={{ htmlInput: { min: .01, step: .01 } }}
                            onBlur={event => { const value = Number(event.target.value); if (value !== item.quantity) void changeQuantity(composition.id, item.id, value); }}
                            onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }}
                            sx={{ width: 72, "& .MuiInputBase-root": { borderRadius: "8px", height: 30 }, "& .MuiInputBase-input": { py: .35, fontSize: 11.5 } }} />
                          <Stack direction="row" alignItems="center" gap={.35}>
                            <Typography fontWeight={850} color="#176047" fontSize={12.5}>{currency.format(item.quantity * item.unitPrice)}</Typography>
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

                <Divider sx={{ my: .65 }} />
                <Button onClick={() => setAddingTo(current => current === composition.id ? "" : composition.id)}
                  aria-expanded={addingTo === composition.id} fullWidth startIcon={<AddRoundedIcon sx={{ fontSize: 19 }} />}
                  sx={{ justifyContent: "flex-start", textTransform: "none", color: "#176047", fontSize: 11.5, fontWeight: 800, px: .7, minHeight: 40 }}>
                  Adicionar produtos à composição
                </Button>
                {addingTo === composition.id && <CompositionProductPicker composition={composition} onAdded={replace} />}
                <Divider sx={{ my: .65 }} />
                <Button onClick={() => setLinksOpenId(current => current === composition.id ? "" : composition.id)}
                  aria-expanded={linksOpenId === composition.id} fullWidth startIcon={<AddRoundedIcon sx={{ fontSize: 19 }} />}
                  sx={{ justifyContent: "flex-start", textTransform: "none", color: "#176047", fontSize: 11.5, fontWeight: 800, px: .7, minHeight: 40 }}>
                  Adicionar composições a obras{linkedProjects.length ? ` (${linkedProjects.length})` : ""}
                </Button>
                <Collapse in={linksOpenId === composition.id} unmountOnExit>
                  <CompositionWorkPicker composition={composition} projects={projects} linkedProjects={linkedProjects} busy={projectBusy}
                    onToggle={(project, linked) => void setLinkedProjects(composition.id,
                      linked ? linkedProjects.filter(item => item.id !== project.id).map(item => item.id)
                        : [...linkedProjects.map(item => item.id), project.id])} />
                </Collapse>
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: .35 }}>
                  <Button size="small" color="error" disabled={busy === composition.id}
                    startIcon={busy === composition.id ? <CircularProgress size={15} /> : <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />}
                    onClick={() => void removeList(composition)} sx={{ textTransform: "none", fontSize: 10.5, fontWeight: 700 }}>
                    Excluir composição
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion></Box>;
          })}
        </Stack>}

      <Dialog open={createOpen} onClose={busy === "new" ? undefined : () => setCreateOpen(false)} fullWidth maxWidth={false}
        slotProps={{ paper: { sx: {
          width: { xs: "100%", sm: "calc(100% - 48px)" }, maxWidth: { xs: "100%", sm: 460 },
          maxHeight: { xs: "88dvh", sm: "calc(100dvh - 48px)" },
          m: { xs: 0, sm: 2 }, position: { xs: "fixed", sm: "relative" }, bottom: { xs: 0, sm: "auto" },
          borderRadius: { xs: "24px 24px 0 0", sm: "22px" }, overflow: "hidden", bgcolor: "#fff",
          boxShadow: { xs: "0 -12px 38px rgba(14,47,37,.18)", sm: "0 22px 60px rgba(14,47,37,.16)" },
        } } }}>
        <DialogTitle sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 2.3, sm: 2.6 }, pb: 1.7, borderBottom: "1px solid #e7eeeb" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Stack direction="row" alignItems="center" gap={.8}>
              <Box sx={{ width: 34, height: 34, borderRadius: "10px", display: "grid", placeItems: "center", bgcolor: "#e8f5ee", color: "#19684c" }}>
                <PlaylistAddCheckRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="overline" sx={{ color: "#33705a", fontWeight: 850, letterSpacing: 1.1, lineHeight: 1 }}>
                Planejamento
              </Typography>
            </Stack>
            <IconButton aria-label="Fechar criação de composição" disabled={busy === "new"} onClick={() => setCreateOpen(false)}
              sx={{ width: 36, height: 36, color: "#698278", bgcolor: "#f4f8f6" }}>
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
          <Typography component="h2" sx={{ mt: 1.3, fontSize: { xs: 24, sm: 27 }, lineHeight: 1.08, fontWeight: 900, letterSpacing: "-.035em", color: "#173f34" }}>
            Nova composição
          </Typography>
          <Typography sx={{ mt: .65, fontSize: 12.5, lineHeight: 1.45, color: "#61796e", fontWeight: 450 }}>
            Dê um nome para organizar os produtos de um ambiente ou etapa da obra.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: "20px !important", pb: 1 }}>
          <TextField fullWidth label="Nome da composição" placeholder="Ex.: Reforma da cozinha" value={newName}
            onChange={event => { setNewName(event.target.value); if (error) setError(""); }}
            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void create(); } }}
            helperText="Você poderá adicionar os produtos logo depois."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#fbfdfc" }, "& .MuiFormHelperText-root": { mx: .3, mt: .8, fontSize: 11 } }} />
          {creationProject && <Typography sx={{ mt: 1.5, px: 1.3, py: 1, borderRadius: "10px", bgcolor: "#edf7f1", color: "#326a52", fontSize: 11.5, fontWeight: 700 }}>
            Vincular à obra: {creationProject.name}
          </Typography>}
          {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: "10px" }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, px: { xs: 2.5, sm: 3 }, pt: 1.5, pb: { xs: "calc(env(safe-area-inset-bottom) + 24px)", sm: 3 } }}>
          <Button variant="outlined" onClick={() => setCreateOpen(false)} disabled={busy === "new"}
            sx={{ m: "0 !important", minHeight: 46, borderRadius: "11px", textTransform: "none", fontWeight: 800, color: "#315e4e", borderColor: "#d3e4dc" }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => void create()} disabled={busy === "new" || !newName.trim()}
            startIcon={busy === "new" ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon />}
            sx={{ m: "0 !important", minHeight: 46, borderRadius: "11px", textTransform: "none", fontWeight: 850, boxShadow: "0 6px 14px rgba(0,107,79,.16)" }}>
            Criar composição
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Container>;
}
