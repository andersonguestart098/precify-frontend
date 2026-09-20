import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, ButtonBase, Checkbox, Chip,
  CircularProgress, Container, Divider, MenuItem, Paper, Stack, TextField, Typography
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import { HardHat } from "@phosphor-icons/react";
import {
  saveLaborPlan,
  type LaborMode, type LaborPlanItem, type Project,
} from "../services/api";
import { useAccount } from "../auth/session";
import {
  getCachedLaborPlan, getCachedProjects, loadLaborPlanCached, loadProjectsCached, saveCachedLaborPlan,
} from "../services/appWarmCache";
import {
  laborTeamGroups, laborThirdPartyPhases,
  type LaborCatalogGroup, type LaborCatalogItem, type LaborSource,
} from "../data/laborCatalog";

const modeOptions: Array<{
  value: Exclude<LaborMode, "">;
  title: string;
  description: string;
  icon: typeof Groups2OutlinedIcon;
}> = [
  { value: "TEAM", title: "Montar equipe", description: "Gestão, supervisão, execução e apoio", icon: Groups2OutlinedIcon },
  { value: "THIRD_PARTY", title: "Contratar terceiro", description: "Especialidades organizadas por fase da obra", icon: HandshakeOutlinedIcon },
  { value: "BOTH", title: "Ambas as opções", description: "Combine equipe própria e terceiros por necessidade", icon: CompareArrowsRoundedIcon },
];

function includesSearch(group: LaborCatalogGroup, item: LaborCatalogItem, search: string) {
  if (!search) return true;
  const haystack = `${group.title} ${group.subtitle ?? ""} ${item.title} ${item.section ?? ""}`.toLocaleLowerCase("pt-BR");
  return haystack.includes(search);
}

function LaborGroupCard({
  group, source, mode, search, selections, onToggle, onOriginChange,
}: {
  group: LaborCatalogGroup;
  source: LaborSource;
  mode: LaborMode;
  search: string;
  selections: Record<string, LaborPlanItem>;
  onToggle: (item: LaborCatalogItem, source: LaborSource) => void;
  onOriginChange: (code: string, origin: LaborPlanItem["origin"]) => void;
}) {
  const visible = group.items.filter(item => includesSearch(group, item, search));
  if (!visible.length) return null;
  const selectedCount = group.items.filter(item => Boolean(selections[item.code])).length;

  return <Accordion disableGutters elevation={0} defaultExpanded={Boolean(search) && visible.length <= 8}
    sx={{
      border: "1px solid #d9e6e1", borderRadius: "11px !important", overflow: "hidden", bgcolor: "#fff",
      boxShadow: selectedCount ? "0 7px 22px rgba(21,72,56,.055)" : "0 2px 10px rgba(21,72,56,.025)",
      transition: "border-color 160ms ease, box-shadow 160ms ease",
      "&::before": { display: "none" },
      "&:hover": { borderColor: "#bfd8cf" },
    }}>
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 20, color: "#6f877e" }} />} sx={{
      px: { xs: 1.35, sm: 1.7 }, minHeight: 58,
      bgcolor: selectedCount ? "#f8fcfa" : "#fff",
      "& .MuiAccordionSummary-content": { my: .9 },
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" minWidth={0} pr={1} gap={1}>
        <Box minWidth={0}>
          <Typography fontWeight={850} color="#21483b" sx={{ fontSize: { xs: 14, sm: 15 } }}>{group.title}</Typography>
          {group.subtitle && <Typography color="text.secondary" sx={{ fontSize: 11.5, mt: .15 }}>{group.subtitle}</Typography>}
        </Box>
        <Chip size="small" label={selectedCount ? `${selectedCount} selecionado${selectedCount > 1 ? "s" : ""}` : `${group.items.length} opções`}
          sx={{ flexShrink: 0, height: 23, borderRadius: "7px", bgcolor: selectedCount ? "#e6f3ee" : "#f3f6f5", color: selectedCount ? "#176047" : "#72827c", fontWeight: 780, fontSize: 9.2 }} />
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={{ px: { xs: 1.05, sm: 1.35 }, pt: 0, pb: 1 }}>
      <Divider sx={{ mb: .55 }} />
      <Stack divider={<Divider flexItem />}>
        {visible.map(item => {
          const selected = selections[item.code];
          return <Box key={item.code} sx={{
            py: .45, px: .35, borderRadius: 2,
            bgcolor: selected ? "#f7fbf9" : "transparent",
            transition: "background 140ms ease",
          }}>
            <Stack direction="row" alignItems="center" gap={.75}>
              <Checkbox checked={Boolean(selected)} onChange={() => onToggle(item, source)} size="small"
                inputProps={{ "aria-label": `Selecionar ${item.title}` }} sx={{ p: .55, color: "#9ab0a8", "&.Mui-checked": { color: "#08785b" } }} />
              <Box minWidth={0} flex={1}>
                <Typography fontWeight={selected ? 800 : 680} color="#284d41" sx={{ fontSize: { xs: 12.4, sm: 13 } }}>{item.title}</Typography>
                {item.section && <Typography sx={{ mt: .12, fontSize: 9.6, color: "#83928d" }}>{item.section}</Typography>}
              </Box>
              {mode === "BOTH" && selected && <TextField select size="small" value={selected.origin}
                onChange={event => onOriginChange(item.code, event.target.value as LaborPlanItem["origin"])}
                sx={{ width: 108, flexShrink: 0, "& .MuiInputBase-root": { height: 32, borderRadius: "8px", fontSize: 10.5, bgcolor: "#fff" } }}>
                <MenuItem value="TEAM">Equipe</MenuItem>
                <MenuItem value="THIRD_PARTY">Terceiro</MenuItem>
                <MenuItem value="BOTH">Ambos</MenuItem>
              </TextField>}
            </Stack>
          </Box>;
        })}
      </Stack>
    </AccordionDetails>
  </Accordion>;
}

export default function LaborPage() {
  const { projectId } = useParams<{ projectId?: string }>();
  const user = useAccount();
  const [projects, setProjects] = useState<Project[]>(() => getCachedProjects(user.id) ?? []);
  const [loading, setLoading] = useState(() => {
    const projectsCached = Boolean(getCachedProjects(user.id));
    const laborCached = !projectId || Boolean(getCachedLaborPlan(user.id, projectId));
    return !(projectsCached && laborCached);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<LaborMode>("");
  const [selections, setSelections] = useState<Record<string, LaborPlanItem>>({});
  const [search, setSearch] = useState("");
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const summaryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const cachedPlan = projectId ? getCachedLaborPlan(user.id, projectId) : null;
    if (!getCachedProjects(user.id) || (projectId && !cachedPlan)) setLoading(true);
    setError(""); setSuccess("");

    const projectsRequest = loadProjectsCached(user.id);
    const planRequest = projectId ? loadLaborPlanCached(user.id, projectId) : Promise.resolve(null);
    Promise.all([projectsRequest, planRequest])
      .then(([works, plan]) => {
        if (!active) return;
        setProjects(works);
        if (plan) {
          setMode(plan.mode);
          setSelections(Object.fromEntries(plan.items.map(item => [item.code, item])));
        } else {
          setMode("");
          setSelections({});
        }
      })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar a mão de obra."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId, user.id]);

  const project = projects.find(item => item.id === projectId);
  const selectedItems = useMemo(() => Object.values(selections), [selections]);
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const teamSelected = selectedItems.filter(item => item.origin === "TEAM").length;
  const thirdSelected = selectedItems.filter(item => item.origin === "THIRD_PARTY").length;
  const bothSelected = selectedItems.filter(item => item.origin === "BOTH").length;

  const chooseMode = (nextMode: Exclude<LaborMode, "">) => {
    setMode(nextMode);
    setSuccess("");
    setSelections(current => {
      if (nextMode === "BOTH") return current;
      return Object.fromEntries(Object.entries(current).filter(([, item]) => item.source === nextMode)
        .map(([code, item]) => [code, { ...item, origin: nextMode }]));
    });
  };

  const toggleItem = (item: LaborCatalogItem, source: LaborSource) => {
    setSuccess("");
    setSelections(current => {
      const next = { ...current };
      if (next[item.code]) delete next[item.code];
      else next[item.code] = { code: item.code, title: item.title, source, origin: source };
      return next;
    });
  };

  const changeOrigin = (code: string, origin: LaborPlanItem["origin"]) => {
    setSuccess("");
    setSelections(current => current[code] ? { ...current, [code]: { ...current[code], origin } } : current);
  };

  const openSummary = () => {
    setSummaryExpanded(true);
    window.requestAnimationFrame(() => {
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const save = async () => {
    if (!projectId || !mode) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const saved = await saveLaborPlan(projectId, { mode, items: selectedItems });
      saveCachedLaborPlan(user.id, projectId, saved);
      setMode(saved.mode);
      setSelections(Object.fromEntries(saved.items.map(item => [item.code, item])));
      setSuccess("Planejamento de mão de obra salvo nesta obra.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar o planejamento.");
    } finally { setSaving(false); }
  };

  if (loading) return <Container maxWidth="lg" sx={{ minHeight: 420, display: "grid", placeItems: "center" }}><CircularProgress /></Container>;

  if (!projectId) return <Container maxWidth="lg" component="main" sx={{ py: { xs: 3, md: 5 }, pb: { xs: 5, md: 5 } }}>
    <Box sx={{ maxWidth: 920, mx: "auto" }}>
      <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.35 }}>Planejamento da obra</Typography>
      <Stack direction="row" alignItems="center" gap={1.1} mt={.3}>
        <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", color: "#195b45", bgcolor: "#e9f4f0", border: "1px solid #d3e8e0" }}>
          <HardHat size={27} weight="duotone" />
        </Box>
        <Box>
          <Typography component="h1" sx={{
            fontSize: { xs: 31, md: 42 }, lineHeight: 1, fontWeight: 900, letterSpacing: "-.04em",
            background: "linear-gradient(112deg,#13382e,#006b4f 68%,#269b78)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Mão de obra</Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: 12.5, md: 14 }, mt: .45 }}>Escolha a obra para montar o planejamento.</Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {!projects.length ? <Paper variant="outlined" sx={{ mt: 3, p: 4, borderRadius: 4, textAlign: "center", borderColor: "#dce9e5" }}>
        <HomeWorkOutlinedIcon sx={{ fontSize: 40, color: "#7e988f" }} />
        <Typography fontWeight={850} color="#284d40" mt={1}>Nenhuma obra cadastrada.</Typography>
        <Typography color="text.secondary" fontSize={13} mt={.45}>A mão de obra nasce dentro de uma obra.</Typography>
        <Button component={RouterLink} to="/obras" variant="contained" sx={{ mt: 2, borderRadius: 999, textTransform: "none" }}>Cadastrar obra</Button>
      </Paper> : <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" }, gap: 1 }}>
        {projects.map(work => <ButtonBase key={work.id} component={RouterLink} to={`/obras/${encodeURIComponent(work.id)}/mao-de-obra`}
          sx={{
            p: { xs: 1.35, sm: 1.5 }, minHeight: 76, borderRadius: "11px",
            border: "1px solid #d9e6e1", bgcolor: "#fff", textAlign: "left", justifyContent: "stretch",
            boxShadow: "0 3px 14px rgba(21,72,56,.03)",
            transition: "transform 160ms ease,border-color 160ms ease,box-shadow 160ms ease,background 160ms ease",
            "&:hover": { transform: "translateY(-1px)", borderColor: "#9fcdbd", bgcolor: "#f9fcfb", boxShadow: "0 8px 24px rgba(21,72,56,.065)" },
          }}>
          <Stack direction="row" alignItems="center" width="100%" gap={1.25}>
            <Box sx={{ width: 40, height: 40, borderRadius: "9px", display: "grid", placeItems: "center", bgcolor: "#e9f4f0", color: "#28634f", border: "1px solid #dcebe6" }}><HomeWorkOutlinedIcon /></Box>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={850} color="#21483b" noWrap>{work.name}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>{work.compositionIds.length} {work.compositionIds.length === 1 ? "composição vinculada" : "composições vinculadas"}</Typography>
            </Box>
            <ArrowForwardRoundedIcon sx={{ color: "#6f8b81" }} />
          </Stack>
        </ButtonBase>)}
      </Box>}
    </Box>
  </Container>;

  if (!project) return <Container maxWidth="lg" sx={{ py: 5 }}><Alert severity="warning">Essa obra não está disponível na sua conta.</Alert></Container>;

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, md: 4.5 }, pb: { xs: 5, md: 5 } }}>
    <Box sx={{ maxWidth: 1020, mx: "auto" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "end" }} gap={2}>
        <Box>
          <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.3 }}>Mão de obra da obra</Typography>
          <Typography component="h1" sx={{
            fontSize: { xs: 30, md: 42 }, lineHeight: 1.02, fontWeight: 900, letterSpacing: "-.04em",
            background: "linear-gradient(112deg,#13382e,#006b4f 68%,#269b78)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{project.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: .55, fontSize: { xs: 12.5, md: 14 } }}>Defina como a obra será atendida e selecione somente o que ela precisa.</Typography>
        </Box>
        <Button component={RouterLink} to="/mao-de-obra" variant="outlined" sx={{
          alignSelf: { xs: "flex-start", md: "auto" }, minHeight: 38, px: 1.6,
          borderRadius: "9px", textTransform: "none", fontWeight: 780, borderColor: "#cfdfd9", color: "#315e4e",
          bgcolor: "rgba(255,255,255,.74)", "&:hover": { borderColor: "#94c5b3", bgcolor: "#f7fbf9" },
        }}>Trocar obra</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

      <Box component="section" aria-labelledby="labor-mode-title" mt={3}>
        <Typography id="labor-mode-title" fontWeight={850} color="#244d40" sx={{ fontSize: 15 }}>Como esta obra será atendida?</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 11.5, mt: .25 }}>Uma decisão simples na entrada. Você pode mudar depois.</Typography>
        <Box sx={{ mt: 1.15, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: .9 }}>
          {modeOptions.map(option => {
            const Icon = option.icon;
            const active = mode === option.value;
            return <ButtonBase key={option.value} onClick={() => chooseMode(option.value)} aria-pressed={active} sx={{
              p: 1.15, minHeight: 78, borderRadius: "11px", textAlign: "left", alignItems: "stretch", justifyContent: "flex-start",
              border: "1px solid", borderColor: active ? "#73b69f" : "#d9e6e1",
              bgcolor: active ? "#f0f8f5" : "#fff",
              boxShadow: active ? "0 8px 22px rgba(0,107,79,.065)" : "0 3px 12px rgba(21,72,56,.025)",
              transition: "transform 160ms ease,border-color 160ms ease,box-shadow 160ms ease,background 160ms ease",
              "&:hover": { transform: "translateY(-1px)", borderColor: "#9acdbb", bgcolor: active ? "#edf7f3" : "#fafcfb" }
            }}>
              <Stack direction="row" alignItems="center" gap={1.05} width="100%">
                <Box sx={{
                  width: 38, height: 38, borderRadius: "9px", flexShrink: 0,
                  display: "grid", placeItems: "center",
                  bgcolor: active ? "#dcefe8" : "#eef5f2", color: active ? "#0d6d52" : "#3c6c5b",
                  border: "1px solid", borderColor: active ? "#c3e2d7" : "#e2ebe7",
                }}><Icon sx={{ fontSize: 20 }} /></Box>
                <Box minWidth={0} flex={1}>
                  <Typography fontWeight={850} color="#21483b" sx={{ fontSize: 12.8, lineHeight: 1.18 }}>{option.title}</Typography>
                  <Typography color="text.secondary" sx={{ mt: .25, fontSize: 9.9, lineHeight: 1.28 }}>{option.description}</Typography>
                </Box>
                <Box sx={{
                  width: 11, height: 11, borderRadius: "3px", flexShrink: 0,
                  border: "1px solid", borderColor: active ? "#21805f" : "#cadad4",
                  bgcolor: active ? "#0b8060" : "transparent",
                  boxShadow: active ? "inset 0 0 0 2px #f0f8f5" : "none",
                }} />
              </Stack>
            </ButtonBase>;
          })}
        </Box>
      </Box>

      {mode && <>
        <Paper variant="outlined" sx={{
          mt: 1.8, px: { xs: 1.25, sm: 1.55 }, py: 1.1, borderRadius: "11px",
          borderColor: "#d9e6e1", bgcolor: "#fbfdfc", boxShadow: "0 3px 14px rgba(21,72,56,.025)",
        }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1.15}>
            <Box flex={1}>
              <Typography fontWeight={850} color="#21483b" sx={{ fontSize: 13 }}>{selectedItems.length} {selectedItems.length === 1 ? "necessidade selecionada" : "necessidades selecionadas"}</Typography>
              <Stack direction="row" gap={.55} flexWrap="wrap" mt={.55}>
                {mode === "BOTH" ? <>
                  <Chip size="small" label={`${teamSelected} equipe`} sx={{ height: 22, fontSize: 9.5 }} />
                  <Chip size="small" label={`${thirdSelected} terceiro`} sx={{ height: 22, fontSize: 9.5 }} />
                  {bothSelected > 0 && <Chip size="small" label={`${bothSelected} ambos`} sx={{ height: 22, fontSize: 9.5 }} />}
                </> : <Typography color="text.secondary" sx={{ fontSize: 10.5 }}>{mode === "TEAM" ? "Equipe própria" : "Empresas e autônomos especializados"}</Typography>}
              </Stack>
            </Box>
            <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={.85}
              sx={{ display: { xs: "flex", sm: "none" } }}>
              <Typography sx={{ fontSize: 12.2, fontWeight: 820, color: "#2f5c4c", letterSpacing: "-.01em" }}>
                Salvar planejamento
              </Typography>
              <ButtonBase onClick={() => void save()} disabled={saving} aria-label="Salvar planejamento" sx={{
                width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                color: "#17664f",
                background: "linear-gradient(145deg,rgba(255,255,255,.98),rgba(232,244,239,.96))",
                border: "1px solid rgba(0,107,79,.14)",
                boxShadow: "0 4px 12px rgba(24,60,48,.08), inset 0 1px 0 rgba(255,255,255,.92)",
                transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",
                "&:active": { transform: "scale(.96)" },
                "&.Mui-disabled": { opacity: .62 },
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
                {saving ? <CircularProgress size={18} sx={{ color: "inherit" }} /> : <SaveRoundedIcon sx={{ fontSize: 20 }} />}
              </ButtonBase>
            </Stack>

            <Button variant="contained" disableElevation startIcon={saving ? <CircularProgress color="inherit" size={15} /> : <SaveRoundedIcon />}
              onClick={() => void save()} disabled={saving}
              sx={{ display: { xs: "none", sm: "inline-flex" }, borderRadius: "9px", px: 2, minHeight: 38, textTransform: "none", fontWeight: 800, alignSelf: "center", boxShadow: "none" }}>
              Salvar planejamento
            </Button>
          </Stack>
        </Paper>

        <TextField fullWidth size="small" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar função ou especialidade"
          slotProps={{ input: { startAdornment: <SearchRoundedIcon sx={{ mr: .8, fontSize: 18, color: "#789087" }} /> } }}
          sx={{
            mt: 1.6,
            "& .MuiInputBase-root": { borderRadius: "10px", bgcolor: "#fff", minHeight: 42, boxShadow: "0 2px 10px rgba(21,72,56,.02)" },
            "& fieldset": { borderColor: "#d9e6e1" },
          }} />

        {(mode === "TEAM" || mode === "BOTH") && <Box component="section" mt={2.3}>
          <Stack direction="row" alignItems="center" gap={.8} mb={1}>
            <Groups2OutlinedIcon sx={{ color: "#36745e", fontSize: 20 }} />
            <Box>
              <Typography fontWeight={900} color="#21483b" sx={{ fontSize: 15 }}>Montar equipe</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 10.5 }}>Gestão, supervisão, execução e apoio.</Typography>
            </Box>
          </Stack>
          <Stack gap={.8}>{laborTeamGroups.map(group => <LaborGroupCard key={group.code} group={group} source="TEAM" mode={mode} search={normalizedSearch} selections={selections} onToggle={toggleItem} onOriginChange={changeOrigin} />)}</Stack>
        </Box>}

        {(mode === "THIRD_PARTY" || mode === "BOTH") && <Box component="section" mt={2.6}>
          <Stack direction="row" alignItems="center" gap={.8} mb={1}>
            <HandshakeOutlinedIcon sx={{ color: "#36745e", fontSize: 20 }} />
            <Box>
              <Typography fontWeight={900} color="#21483b" sx={{ fontSize: 15 }}>Contratar terceiro</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 10.5 }}>Especialidades organizadas nas 6 fases definidas para a obra.</Typography>
            </Box>
          </Stack>
          <Stack gap={.8}>{laborThirdPartyPhases.map(group => <LaborGroupCard key={group.code} group={group} source="THIRD_PARTY" mode={mode} search={normalizedSearch} selections={selections} onToggle={toggleItem} onOriginChange={changeOrigin} />)}</Stack>
        </Box>}

        <Accordion
          ref={summaryRef}
          disableGutters
          elevation={0}
          expanded={summaryExpanded}
          onChange={(_, expanded) => setSummaryExpanded(expanded)}
          sx={{
            mt: 2.3, scrollMarginTop: { xs: 88, md: 84 },
            border: "1px solid #d9e6e1", borderRadius: "11px !important", overflow: "hidden", bgcolor: "#fbfdfc",
            boxShadow: summaryExpanded ? "0 10px 28px rgba(21,72,56,.07)" : "0 3px 14px rgba(21,72,56,.025)",
            transition: "box-shadow 180ms ease,border-color 180ms ease",
            "&::before": { display: "none" },
          }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 1.5, minHeight: 62 }}>
            <Stack direction="row" gap={1} alignItems="center" width="100%">
              <Box sx={{ width: 36, height: 36, borderRadius: "9px", display: "grid", placeItems: "center", bgcolor: "#e8f4ef", color: "#2b6651", border: "1px solid #dcebe6", flexShrink: 0 }}><HardHat size={20} weight="duotone" /></Box>
              <Box minWidth={0} flex={1}>
                <Typography fontWeight={850} color="#21483b" sx={{ fontSize: 12.5 }}>Resumo único da obra</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 10.3, lineHeight: 1.35 }}>{selectedItems.length ? `${selectedItems.length} necessidades vinculadas a ${project.name}` : "Nenhuma necessidade selecionada ainda."}</Typography>
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 1.3 }}>
            <Divider sx={{ mb: .5 }} />
            {selectedItems.length ? <Stack divider={<Divider flexItem />}>
              {selectedItems.map(item => <Stack key={item.code} direction="row" alignItems="center" gap={1} py={.7}>
                <Box minWidth={0} flex={1}>
                  <Typography fontWeight={760} color="#294d41" sx={{ fontSize: 11.5 }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: 8.8, color: "#91a09a" }}>{item.code}</Typography>
                </Box>
                <Chip size="small" label={item.origin === "TEAM" ? "Equipe" : item.origin === "THIRD_PARTY" ? "Terceiro" : "Ambos"}
                  sx={{ height: 22, borderRadius: "7px", fontSize: 9.2, fontWeight: 750, bgcolor: "#e7f3ee", color: "#245843" }} />
              </Stack>)}
            </Stack> : <Typography color="text.secondary" sx={{ fontSize: 11, py: 1 }}>Selecione funções ou especialidades acima para compor o resumo.</Typography>}
          </AccordionDetails>
        </Accordion>

        {selectedItems.length > 0 ? <Box sx={{
          position: "fixed",
          right: { xs: 12, sm: 18, md: 24, xl: 32 },
          bottom: {
            xs: "calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 14px)",
            md: 24,
          },
          zIndex: theme => theme.zIndex.appBar - 1,
          pointerEvents: "none",
        }}>
          <ButtonBase onClick={openSummary} aria-label="Abrir resumo da obra" sx={{
            minHeight: 46, px: 1.05, pr: 1.25, gap: .8,
            borderRadius: 999, pointerEvents: "auto",
            bgcolor: "rgba(255,255,255,.96)",
            border: "1px solid rgba(0,107,79,.14)",
            boxShadow: "0 10px 26px rgba(24,60,48,.13), inset 0 1px 0 rgba(255,255,255,.92)",
            backdropFilter: "blur(12px)",
            transition: "transform 160ms ease,box-shadow 160ms ease,border-color 160ms ease",
            "&:active": { transform: "scale(.97)" },
            "&.Mui-focusVisible": { outline: "2px solid rgba(38,155,120,.35)", outlineOffset: 3 },
            "@media (hover:hover)": {
              "&:hover": {
                transform: "translateY(-2px)",
                borderColor: "rgba(0,107,79,.24)",
                boxShadow: "0 14px 30px rgba(24,60,48,.16), inset 0 1px 0 rgba(255,255,255,.95)",
              },
            },
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
              "&:hover": { transform: "none" },
            },
          }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0,
              color: "#17664f",
              background: "linear-gradient(145deg,#eef8f4,#dfeee8)",
              border: "1px solid rgba(0,107,79,.09)",
            }}>
              <SummarizeOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box textAlign="left">
              <Typography sx={{ fontSize: 10.8, lineHeight: 1.05, fontWeight: 850, color: "#244d40" }}>
                Resumo da obra
              </Typography>
              <Typography sx={{ mt: .2, fontSize: 8.6, lineHeight: 1, color: "#81928b" }}>
                {selectedItems.length} {selectedItems.length === 1 ? "necessidade" : "necessidades"}
              </Typography>
            </Box>
          </ButtonBase>
        </Box> : null}
      </>}
    </Box>
  </Container>;
}
