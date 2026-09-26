import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, ButtonBase, Checkbox, Chip,
  CircularProgress, Container, Divider, IconButton, MenuItem, Paper, Snackbar, Stack, TextField, Typography
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
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
import { useWorkspaceFavorites } from "../hooks/useWorkspaceFavorites";

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

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const headerActionSx = {
  minHeight: 42, px: 1.65, borderRadius: 999, textTransform: "none", fontWeight: 800,
  fontSize: 12.5, whiteSpace: "nowrap", color: "#215e49",
  border: "1px solid #c9e1d7", background: "linear-gradient(145deg,#ffffff,#f0f9f5)",
  boxShadow: "0 4px 12px rgba(21,72,56,.06)",
  transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
  "&:hover": { transform: "translateY(-2px)", borderColor: "#83bca7", boxShadow: "0 8px 18px rgba(21,72,56,.11)", background: "#eaf7f1" },
  "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: 2 },
  "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } },
} as const;

function includesSearch(group: LaborCatalogGroup, item: LaborCatalogItem, search: string) {
  if (!search) return true;
  const haystack = `${group.title} ${group.subtitle ?? ""} ${item.title} ${item.section ?? ""}`.toLocaleLowerCase("pt-BR");
  return haystack.includes(search);
}

function laborPlanSignature(mode: LaborMode, items: LaborPlanItem[]) {
  return JSON.stringify({
    mode,
    items: [...items]
      .sort((left, right) => left.code.localeCompare(right.code))
      .map(item => ({
        code: item.code,
        title: item.title,
        source: item.source,
        origin: item.origin,
        cost: Number(item.cost ?? 0),
      })),
  });
}

function LaborGroupCard({
  group, source, mode, search, selections, onToggle, onOriginChange, onCostChange, favoriteCodes, favoriteBusy, onFavorite,
}: {
  group: LaborCatalogGroup;
  source: LaborSource;
  mode: LaborMode;
  search: string;
  selections: Record<string, LaborPlanItem>;
  onToggle: (item: LaborCatalogItem, source: LaborSource) => void;
  onOriginChange: (code: string, origin: LaborPlanItem["origin"]) => void;
  onCostChange: (code: string, cost: number) => void;
  favoriteCodes: Set<string>;
  favoriteBusy: (code: string) => boolean;
  onFavorite: (code: string) => void;
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
              <IconButton
                size="small"
                aria-label={favoriteCodes.has(item.code) ? `Remover ${item.title} dos favoritos` : `Favoritar ${item.title}`}
                aria-pressed={favoriteCodes.has(item.code)}
                disabled={favoriteBusy(item.code)}
                onClick={() => onFavorite(item.code)}
                sx={{
                  width: 30, height: 30, flexShrink: 0,
                  color: favoriteCodes.has(item.code) ? "#b77b00" : "#7c9189",
                  bgcolor: favoriteCodes.has(item.code) ? "#fff6d7" : "transparent",
                  "&:hover": { bgcolor: favoriteCodes.has(item.code) ? "#ffefb3" : "#edf5f2" },
                }}
              >
                {favoriteCodes.has(item.code) ? <StarRoundedIcon sx={{ fontSize: 17 }} /> : <StarBorderRoundedIcon sx={{ fontSize: 17 }} />}
              </IconButton>
              {mode === "BOTH" && selected && <TextField select size="small" value={selected.origin}
                onChange={event => onOriginChange(item.code, event.target.value as LaborPlanItem["origin"])}
                sx={{ width: 108, flexShrink: 0, "& .MuiInputBase-root": { height: 32, borderRadius: "8px", fontSize: 10.5, bgcolor: "#fff" } }}>
                <MenuItem value="TEAM">Equipe</MenuItem>
                <MenuItem value="THIRD_PARTY">Terceiro</MenuItem>
                <MenuItem value="BOTH">Ambos</MenuItem>
              </TextField>}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={.6}
              sx={{ pl: { xs: 4.9, sm: 5.1 }, pr: .35, pt: .35, pb: .55, opacity: selected ? 1 : .58 }}>
              <Typography sx={{ fontSize: 10.2, fontWeight: 760, color: "#5e746c", minWidth: 92 }}>
                Custo estimado
              </Typography>
              <TextField
                size="small"
                type="number"
                label="Custo (R$)"
                disabled={!selected}
                value={selected && selected.cost > 0 ? selected.cost : ""}
                placeholder={selected ? "0,00" : "Selecione a opção"}
                onChange={event => {
                  if (!selected) return;
                  const parsed = Number(event.target.value);
                  onCostChange(item.code, Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
                }}
                slotProps={{ htmlInput: { min: 0, step: "0.01", inputMode: "decimal" } }}
                sx={{
                  width: { xs: "100%", sm: 180 },
                  "& .MuiInputBase-root": { height: 38, borderRadius: "9px", fontSize: 11.5, bgcolor: "#fff" },
                  "& .MuiInputLabel-root": { fontSize: 11.5 },
                }}
              />
            </Stack>
          </Box>;
        })}
      </Stack>
    </AccordionDetails>
  </Accordion>;
}

function LaborDatabaseGroup({
  group,
  search,
  favoriteCodes,
  favoriteBusy,
  onFavorite,
}: {
  group: LaborCatalogGroup;
  search: string;
  favoriteCodes: Set<string>;
  favoriteBusy: (code: string) => boolean;
  onFavorite: (code: string) => void;
}) {
  const visible = group.items.filter(item => includesSearch(group, item, search));
  if (!visible.length) return null;

  return <Accordion disableGutters elevation={0} defaultExpanded={Boolean(search)} sx={{
    border: "1px solid #d9e6e1", borderRadius: "11px !important", overflow: "hidden", bgcolor: "#fff",
    "&::before": { display: "none" }, boxShadow: "0 3px 14px rgba(21,72,56,.025)",
  }}>
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 20, color: "#6f877e" }} />} sx={{
      px: { xs: 1.35, sm: 1.6 }, minHeight: 56, bgcolor: "#fbfdfc",
      "& .MuiAccordionSummary-content": { my: .85 },
    }}>
      <Box minWidth={0}>
        <Typography fontWeight={850} color="#21483b" sx={{ fontSize: { xs: 13.5, sm: 14.5 } }}>{group.title}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 10.3, mt: .12 }}>
          {group.subtitle || `${group.items.length} opções`}
        </Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ px: { xs: 1.05, sm: 1.3 }, pt: 0, pb: .8 }}>
      <Divider sx={{ mb: .4 }} />
      <Stack divider={<Divider flexItem />}>
        {visible.map(item => <Stack key={item.code} direction="row" alignItems="center" gap={.8} sx={{ py: .55, px: .35 }}>
          <Box minWidth={0} flex={1}>
            <Typography fontWeight={700} color="#284d41" sx={{ fontSize: { xs: 12.1, sm: 12.7 } }}>{item.title}</Typography>
            {item.section && <Typography color="text.secondary" sx={{ fontSize: 9.2, mt: .1 }}>{item.section}</Typography>}
          </Box>
          <IconButton
            size="small"
            aria-label={favoriteCodes.has(item.code) ? `Remover ${item.title} dos favoritos` : `Favoritar ${item.title}`}
            aria-pressed={favoriteCodes.has(item.code)}
            disabled={favoriteBusy(item.code)}
            onClick={() => onFavorite(item.code)}
            sx={{
              width: 32, height: 32, flexShrink: 0,
              color: favoriteCodes.has(item.code) ? "#b77b00" : "#7c9189",
              bgcolor: favoriteCodes.has(item.code) ? "#fff6d7" : "#f5f8f7",
              border: "1px solid",
              borderColor: favoriteCodes.has(item.code) ? "#ead07d" : "#e1e9e6",
              "&:hover": { bgcolor: favoriteCodes.has(item.code) ? "#ffefb3" : "#edf5f2" },
            }}
          >
            {favoriteCodes.has(item.code) ? <StarRoundedIcon sx={{ fontSize: 18 }} /> : <StarBorderRoundedIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Stack>)}
      </Stack>
    </AccordionDetails>
  </Accordion>;
}

export default function LaborPage() {
  const { projectId } = useParams<{ projectId?: string }>();
  const user = useAccount();
  const workspaceFavorites = useWorkspaceFavorites();
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
  const [savedSignature, setSavedSignature] = useState(() => laborPlanSignature("", []));
  const [search, setSearch] = useState("");
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [summaryPulse, setSummaryPulse] = useState(false);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const summaryPulseTimer = useRef<number | undefined>(undefined);

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
          const normalizedItems = plan.items.map(item => ({ ...item, cost: Number(item.cost ?? 0) }));
          setMode(plan.mode);
          setSelections(Object.fromEntries(normalizedItems.map(item => [item.code, item])));
          setSavedSignature(laborPlanSignature(plan.mode, normalizedItems));
        } else {
          setMode("");
          setSelections({});
          setSavedSignature(laborPlanSignature("", []));
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
  const laborTotal = selectedItems.reduce((sum, item) => sum + Math.max(0, Number(item.cost ?? 0)), 0);
  const hasUnsavedChanges = Boolean(mode) && laborPlanSignature(mode, selectedItems) !== savedSignature;

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
      else next[item.code] = { code: item.code, title: item.title, source, origin: source, cost: 0 };
      return next;
    });
  };

  const changeOrigin = (code: string, origin: LaborPlanItem["origin"]) => {
    setSuccess("");
    setSelections(current => current[code] ? { ...current, [code]: { ...current[code], origin } } : current);
  };

  const changeCost = (code: string, cost: number) => {
    setSuccess("");
    setSelections(current => current[code] ? {
      ...current,
      [code]: { ...current[code], cost: Math.max(0, Number.isFinite(cost) ? cost : 0) },
    } : current);
  };

  const openSummary = () => {
    setSummaryExpanded(true);
    setSummaryPulse(false);
    window.clearTimeout(summaryPulseTimer.current);
    window.requestAnimationFrame(() => {
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.requestAnimationFrame(() => setSummaryPulse(true));
    });
    summaryPulseTimer.current = window.setTimeout(() => setSummaryPulse(false), 1800);
  };

  useEffect(() => () => window.clearTimeout(summaryPulseTimer.current), []);

  const save = async () => {
    if (!projectId || !mode) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const saved = await saveLaborPlan(projectId, { mode, items: selectedItems });
      saveCachedLaborPlan(user.id, projectId, saved);
      const normalizedItems = saved.items.map(item => ({ ...item, cost: Number(item.cost ?? 0) }));
      setMode(saved.mode);
      setSelections(Object.fromEntries(normalizedItems.map(item => [item.code, item])));
      setSavedSignature(laborPlanSignature(saved.mode, normalizedItems));
      setSuccess("Planejamento de mão de obra salvo nesta obra.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar o planejamento.");
    } finally { setSaving(false); }
  };

  if (loading) return <Container maxWidth="lg" sx={{ minHeight: 420, display: "grid", placeItems: "center" }}><CircularProgress /></Container>;

  if (!projectId) return <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, md: 4.5 }, pb: { xs: 5, md: 5 } }}>
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1.4}>
        <Stack direction="row" alignItems="center" gap={1.1}>
          <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", color: "#195b45", bgcolor: "#e9f4f0", border: "1px solid #d3e8e0" }}>
            <HardHat size={27} weight="duotone" />
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.35 }}>Mão de obra por obra</Typography>
            <Typography component="h1" sx={{
              fontSize: { xs: 31, md: 42 }, lineHeight: 1, fontWeight: 900, letterSpacing: "-.04em",
              background: "linear-gradient(112deg,#13382e,#006b4f 68%,#269b78)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Mão de obra</Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: 12.5, md: 14 }, mt: .45 }}>
              Escolha uma obra para planejar equipes e serviços. Consulte o catálogo de especialidades abaixo.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" gap={.8} sx={{ alignSelf: { xs: "flex-end", sm: "auto" } }}>
          <Typography sx={{ fontSize: { xs: 12.2, md: 12.9 }, fontWeight: 820, color: "#2f5c4c" }}>Cadastrar obra</Typography>
          <ButtonBase component={RouterLink} to="/obras?new=1" aria-label="Cadastrar obra" sx={{
            width: { xs: 42, md: 44 }, height: { xs: 42, md: 44 }, borderRadius: "50%", flexShrink: 0,
            color: "#17664f", background: "linear-gradient(145deg,rgba(255,255,255,.98),rgba(232,244,239,.96))",
            border: "1px solid rgba(0,107,79,.14)", boxShadow: "0 4px 12px rgba(24,60,48,.08)",
            "&:hover": { borderColor: "rgba(0,107,79,.24)", background: "linear-gradient(145deg,#ffffff,#e3f1ec)" },
          }}><AddRoundedIcon sx={{ fontSize: { xs: 22, md: 23 } }} /></ButtonBase>
        </Stack>
      </Stack>

      {(error || workspaceFavorites.error) && <Alert severity="error" sx={{ mt: 2 }}>{error || workspaceFavorites.error}</Alert>}

      <Box component="section" aria-labelledby="labor-planning-title" sx={{ mt: { xs: 2.5, md: 3 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography id="labor-planning-title" fontWeight={900} color="#21483b" sx={{ fontSize: { xs: 17, md: 19 } }}>Escolha a obra</Typography>
            <Typography color="text.secondary" sx={{ mt: .25, fontSize: { xs: 11.5, md: 12.5 } }}>
              Equipes e serviços são planejados dentro de cada obra, junto com as composições.
            </Typography>
          </Box>
          <Chip size="small" label={`${projects.length} ${projects.length === 1 ? "obra" : "obras"}`} sx={{ alignSelf: "flex-start", bgcolor: "#e9f4f0", color: "#1f674f", fontWeight: 800 }} />
        </Stack>

        {!projects.length ? <Paper variant="outlined" sx={{ mt: 1.4, p: { xs: 2.5, sm: 3 }, borderRadius: 3, textAlign: "center", borderColor: "#dce9e5", bgcolor: "#fbfdfc" }}>
          <HomeWorkOutlinedIcon sx={{ fontSize: 36, color: "#7e988f" }} />
          <Typography fontWeight={850} color="#284d40" mt={.8}>Nenhuma obra cadastrada ainda.</Typography>
          <Typography color="text.secondary" fontSize={12} mt={.35}>Cadastre uma obra para planejar equipe e serviços.</Typography>
          <Button component={RouterLink} to="/obras?new=1" variant="contained" sx={{ mt: 1.5, textTransform: "none", borderRadius: 2 }}>Cadastrar obra</Button>
        </Paper> : <Box sx={{ mt: 1.4, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" }, gap: 1.15 }}>
          {projects.map(work => {
            const cachedPlan = getCachedLaborPlan(user.id, work.id);
            const teamCount = cachedPlan?.items.filter(item => item.origin === "TEAM" || item.origin === "BOTH").length ?? 0;
            const serviceCount = cachedPlan?.items.filter(item => item.origin === "THIRD_PARTY" || item.origin === "BOTH").length ?? 0;
            return <Paper key={work.id} variant="outlined" sx={{ p: { xs: 1.6, sm: 1.8 }, borderRadius: 3, borderColor: "#d9e6e1", bgcolor: "#fff", boxShadow: "0 4px 16px rgba(21,72,56,.035)" }}>
              <Stack direction="row" alignItems="center" gap={1.1}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", display: "grid", placeItems: "center", bgcolor: "#e9f4f0", color: "#28634f", border: "1px solid #dcebe6", flexShrink: 0 }}><HomeWorkOutlinedIcon /></Box>
                <Box minWidth={0} flex={1}>
                  <Typography fontWeight={850} color="#21483b" noWrap>{work.name}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 10.8 }}>{work.compositionIds.length} {work.compositionIds.length === 1 ? "composição vinculada" : "composições vinculadas"}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" gap={.6} flexWrap="wrap" mt={1.3}>
                <Chip size="small" icon={<Groups2OutlinedIcon />} label={cachedPlan ? `Equipe: ${teamCount} ${teamCount === 1 ? "função" : "funções"}` : "Equipe"} sx={{ bgcolor: "#f0f8f5", fontSize: 10 }} />
                <Chip size="small" icon={<HandshakeOutlinedIcon />} label={cachedPlan ? `${serviceCount} serviços` : "Serviços"} sx={{ bgcolor: "#f0f8f5", fontSize: 10 }} />
              </Stack>
              <Stack direction="row" gap={1} flexWrap="wrap" mt={1.5}>
                <Button component={RouterLink} to={`/obras/${encodeURIComponent(work.id)}/mao-de-obra`} variant="contained" size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 750 }}>
                  Equipes e serviços
                </Button>
                <Button component={RouterLink} to={`/composicoes?obra=${encodeURIComponent(work.id)}`} variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 750 }}>
                  Composições
                </Button>
              </Stack>
            </Paper>;
          })}
        </Box>}
      </Box>

      <Box component="section" aria-labelledby="labor-catalog-title" sx={{ mt: { xs: 3.3, md: 4 }, pt: 2.5, borderTop: "1px solid #dfe9e5" }}>
        <Typography id="labor-catalog-title" fontWeight={900} color="#21483b" sx={{ fontSize: { xs: 16, md: 18 } }}>Explorar funções e especialidades</Typography>
        <Typography color="text.secondary" sx={{ mt: .25, fontSize: { xs: 11, md: 12 } }}>
          Consulte o catálogo e salve seus favoritos. Para incluir uma função no planejamento, abra a obra acima.
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Buscar função, equipe ou especialidade"
          slotProps={{ input: { startAdornment: <SearchRoundedIcon sx={{ mr: .8, fontSize: 18, color: "#789087" }} /> } }}
          sx={{
            mt: 2.2,
            "& .MuiInputBase-root": { borderRadius: "10px", bgcolor: "#fff", minHeight: 42, boxShadow: "0 2px 10px rgba(21,72,56,.02)" },
            "& fieldset": { borderColor: "#d9e6e1" },
          }}
        />

        <Box sx={{ mt: 1.4, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,minmax(0,1fr))" }, gap: 1.2, alignItems: "start" }}>
          <Stack gap={.8}>
            <Stack direction="row" alignItems="center" gap={.7} mb={.1}>
              <Groups2OutlinedIcon sx={{ color: "#36745e", fontSize: 20 }} />
              <Box>
                <Typography fontWeight={900} color="#21483b" sx={{ fontSize: 14.5 }}>Equipe própria</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 10 }}>Funções internas para montar a equipe.</Typography>
              </Box>
            </Stack>
            {laborTeamGroups.map(group => <LaborDatabaseGroup
              key={group.code}
              group={group}
              search={normalizedSearch}
              favoriteCodes={workspaceFavorites.favorites.LABOR}
              favoriteBusy={code => workspaceFavorites.loading || workspaceFavorites.isBusy("LABOR", code)}
              onFavorite={code => { void workspaceFavorites.toggle("LABOR", code); }}
            />)}
          </Stack>

          <Stack gap={.8}>
            <Stack direction="row" alignItems="center" gap={.7} mb={.1}>
              <HandshakeOutlinedIcon sx={{ color: "#36745e", fontSize: 20 }} />
              <Box>
                <Typography fontWeight={900} color="#21483b" sx={{ fontSize: 14.5 }}>Terceiros</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 10 }}>Especialidades organizadas por fase da obra.</Typography>
              </Box>
            </Stack>
            {laborThirdPartyPhases.map(group => <LaborDatabaseGroup
              key={group.code}
              group={group}
              search={normalizedSearch}
              favoriteCodes={workspaceFavorites.favorites.LABOR}
              favoriteBusy={code => workspaceFavorites.loading || workspaceFavorites.isBusy("LABOR", code)}
              onFavorite={code => { void workspaceFavorites.toggle("LABOR", code); }}
            />)}
          </Stack>
        </Box>

      </Box>
    </Box>
  </Container>;

  if (!project) return <Container maxWidth="lg" sx={{ py: 5 }}><Alert severity="warning">Essa obra não está disponível na sua conta.</Alert></Container>;

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, md: 4.5 }, pb: { xs: 5, md: 5 } }}>
    <Box sx={{ maxWidth: 1020, mx: "auto", position: "relative" }}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ lg: "end" }} gap={2}>
        <Box>
          <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.3 }}>Mão de obra da obra</Typography>
          <Typography component="h1" sx={{
            fontSize: { xs: 30, md: 42 }, lineHeight: 1.02, fontWeight: 900, letterSpacing: "-.04em",
            background: "linear-gradient(112deg,#13382e,#006b4f 68%,#269b78)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{project.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: .55, fontSize: { xs: 12.5, md: 14 } }}>Defina como a obra será atendida e selecione somente o que ela precisa.</Typography>
        </Box>
        <Stack gap={1} sx={{ alignSelf: { xs: "stretch", lg: "auto" }, alignItems: { xs: "stretch", lg: "flex-end" } }}>
          <Stack direction="row" alignItems="center" gap={{ xs: .8, md: 1 }} flexWrap="wrap"
            sx={{ justifyContent: { xs: "flex-start", lg: "flex-end" } }}>
            <Button component={RouterLink} to={`/composicoes?obra=${encodeURIComponent(project.id)}`}
              startIcon={<CalculateOutlinedIcon sx={{ fontSize: 18 }} />} sx={headerActionSx}>
              Composições ({project.compositionIds.length})
            </Button>
            <Button component={RouterLink} to="/produtos"
              startIcon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />} sx={headerActionSx}>
              Produtos
            </Button>
            {selectedItems.length > 0 && <Button onClick={openSummary} aria-label="Abrir resumo da obra"
              startIcon={<SummarizeOutlinedIcon sx={{ fontSize: 18 }} />} sx={headerActionSx}>
              Resumo da obra
            </Button>}
          </Stack>
          <Button component={RouterLink} to="/mao-de-obra"
            startIcon={<SwapHorizRoundedIcon sx={{ fontSize: 19 }} />}
            sx={{ ...headerActionSx, alignSelf: "flex-end", borderColor: "#d4e2dd", background: "#fff", color: "#315e4e" }}>
            Trocar obra
          </Button>
        </Stack>
      </Stack>

      {(error || workspaceFavorites.error) && <Alert severity="error" sx={{ mt: 2 }}>{error || workspaceFavorites.error}</Alert>}

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
          mt: 1.8,
          px: { xs: 1.35, sm: 1.7 },
          py: 1.2,
          borderRadius: "13px",
          position: "sticky",
          top: { xs: "calc(var(--header-height, 56px) + var(--mobile-context-height, 0px) + 8px)", md: "calc(var(--header-height, 64px) + 10px)" },
          zIndex: 8,
          borderColor: "#bcd9cf",
          bgcolor: "rgba(250,253,252,.97)",
          boxShadow: "0 10px 28px rgba(21,72,56,.10), 0 0 0 1px rgba(0,107,79,.025)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1.2}>
            <Box minWidth={0}>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "baseline" }} gap={{ xs: .25, sm: 1.1 }}>
                <Typography fontWeight={850} color="#21483b" sx={{ fontSize: 13 }}>
                  {selectedItems.length} {selectedItems.length === 1 ? "necessidade selecionada" : "necessidades selecionadas"}
                </Typography>
                <Typography sx={{ fontSize: { xs: 14.5, sm: 16 }, fontWeight: 900, color: "#0f6b50", letterSpacing: "-.02em" }}>
                  Total M.O.: {currency.format(laborTotal)}
                </Typography>
              </Stack>
              <Stack direction="row" gap={.55} flexWrap="wrap" mt={.55}>
                {mode === "BOTH" ? <>
                  <Chip size="small" label={`${teamSelected} equipe`} sx={{ height: 22, fontSize: 9.5 }} />
                  <Chip size="small" label={`${thirdSelected} terceiro`} sx={{ height: 22, fontSize: 9.5 }} />
                  {bothSelected > 0 && <Chip size="small" label={`${bothSelected} ambos`} sx={{ height: 22, fontSize: 9.5 }} />}
                </> : <Typography color="text.secondary" sx={{ fontSize: 10.5 }}>
                  {mode === "TEAM" ? "Equipe própria" : "Empresas e autônomos especializados"}
                </Typography>}
              </Stack>
            </Box>

            {hasUnsavedChanges && <Stack direction="row" alignItems="center" gap={.55} sx={{ flexShrink: 0 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#d18a22", boxShadow: "0 0 0 4px rgba(209,138,34,.10)" }} />
              <Typography sx={{ fontSize: 9.5, fontWeight: 780, color: "#8a642f", whiteSpace: "nowrap" }}>
                Alterações não salvas
              </Typography>
            </Stack>}
          </Stack>
        </Paper>

        {(hasUnsavedChanges || saving) && <ButtonBase
          onClick={() => void save()}
          disabled={saving}
          aria-label="Salvar alterações da mão de obra"
          sx={{
            position: "fixed",
            right: { xs: 16, md: 28 },
            bottom: {
              xs: "calc(var(--bottom-nav-height, 68px) + env(safe-area-inset-bottom, 0px) + 14px)",
              md: 28,
            },
            zIndex: 1250,
            width: { xs: "calc(100% - 32px)", sm: "auto" },
            minWidth: { sm: 184 },
            minHeight: 52,
            px: { xs: 2, sm: 2.15 },
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: .8,
            color: "#fff",
            background: "linear-gradient(135deg,#0b8060 0%,#006b4f 100%)",
            border: "1px solid rgba(255,255,255,.18)",
            boxShadow: "0 12px 30px rgba(0,107,79,.24), inset 0 1px 0 rgba(255,255,255,.16)",
            transition: "transform 160ms ease, box-shadow 160ms ease",
            "&:active": { transform: "scale(.98)" },
            "&.Mui-disabled": { opacity: .9, color: "#fff" },
            "&.Mui-focusVisible": { outline: "3px solid rgba(38,155,120,.25)", outlineOffset: 3 },
            "@media (hover:hover)": {
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 16px 34px rgba(0,107,79,.29), inset 0 1px 0 rgba(255,255,255,.18)",
              },
            },
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
              "&:hover": { transform: "none" },
            },
          }}
        >
          {saving ? <CircularProgress size={18} thickness={5} sx={{ color: "#fff" }} /> : <SaveRoundedIcon sx={{ fontSize: 19 }} />}
          <Typography sx={{ fontSize: 12.4, fontWeight: 900, lineHeight: 1 }}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Typography>
        </ButtonBase>}

        <Snackbar
          open={Boolean(success)}
          autoHideDuration={2200}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{ bottom: { xs: "calc(var(--bottom-nav-height, 68px) + 18px)", md: 28 } }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setSuccess("")}
            sx={{ borderRadius: 999, px: 1.7, py: .35, fontWeight: 800, boxShadow: "0 10px 28px rgba(21,72,56,.18)" }}
          >
            Planejamento salvo
          </Alert>
        </Snackbar>

        <TextField fullWidth size="small" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar função ou especialidade"
          slotProps={{ input: { startAdornment: <SearchRoundedIcon sx={{ mr: .8, fontSize: 18, color: "#789087" }} /> } }}
          sx={{
            mt: 1.6,
            "& .MuiInputBase-root": { borderRadius: "10px", bgcolor: "#fff", minHeight: 42, boxShadow: "0 2px 10px rgba(21,72,56,.02)" },
            "& fieldset": { borderColor: "#d9e6e1" },
          }} />

        {(mode === "TEAM" || mode === "BOTH") && <Box component="section" id="labor-team-title" mt={2.3} sx={{ scrollMarginTop: 24 }}>
          <Stack direction="row" alignItems="center" gap={.8} mb={1}>
            <Groups2OutlinedIcon sx={{ color: "#36745e", fontSize: 20 }} />
            <Box>
              <Typography fontWeight={900} color="#21483b" sx={{ fontSize: 15 }}>Montar equipe</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 10.5 }}>Gestão, supervisão, execução e apoio.</Typography>
            </Box>
          </Stack>
          <Stack gap={.8}>{laborTeamGroups.map(group => <LaborGroupCard key={group.code} group={group} source="TEAM" mode={mode} search={normalizedSearch} selections={selections} onToggle={toggleItem} onOriginChange={changeOrigin} onCostChange={changeCost} favoriteCodes={workspaceFavorites.favorites.LABOR} favoriteBusy={code => workspaceFavorites.loading || workspaceFavorites.isBusy("LABOR", code)} onFavorite={code => { void workspaceFavorites.toggle("LABOR", code); }} />)}</Stack>
        </Box>}

        {(mode === "THIRD_PARTY" || mode === "BOTH") && <Box component="section" id="labor-services-title" mt={2.6} sx={{ scrollMarginTop: 24 }}>
          <Stack direction="row" alignItems="center" gap={.8} mb={1}>
            <HandshakeOutlinedIcon sx={{ color: "#36745e", fontSize: 20 }} />
            <Box>
              <Typography fontWeight={900} color="#21483b" sx={{ fontSize: 15 }}>Contratar terceiro</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 10.5 }}>Especialidades organizadas nas 6 fases definidas para a obra.</Typography>
            </Box>
          </Stack>
          <Stack gap={.8}>{laborThirdPartyPhases.map(group => <LaborGroupCard key={group.code} group={group} source="THIRD_PARTY" mode={mode} search={normalizedSearch} selections={selections} onToggle={toggleItem} onOriginChange={changeOrigin} onCostChange={changeCost} favoriteCodes={workspaceFavorites.favorites.LABOR} favoriteBusy={code => workspaceFavorites.loading || workspaceFavorites.isBusy("LABOR", code)} onFavorite={code => { void workspaceFavorites.toggle("LABOR", code); }} />)}</Stack>
        </Box>}

        <Accordion
          ref={summaryRef}
          disableGutters
          elevation={0}
          expanded={summaryExpanded}
          onChange={(_, expanded) => setSummaryExpanded(expanded)}
          sx={{
            mt: 2.3, scrollMarginTop: { xs: 96, md: 84 },
            border: "1px solid", borderRadius: "11px !important", overflow: "hidden",
            borderColor: summaryPulse ? "#198a67" : "#d9e6e1",
            bgcolor: summaryPulse ? "#f1faf6" : "#fbfdfc",
            boxShadow: summaryPulse
              ? "0 0 0 5px rgba(38,155,120,.16), 0 16px 34px rgba(21,72,56,.14)"
              : summaryExpanded ? "0 10px 28px rgba(21,72,56,.07)" : "0 3px 14px rgba(21,72,56,.025)",
            animation: summaryPulse ? "summaryAttention 1.5s ease-out both" : "none",
            transition: "box-shadow 220ms ease,border-color 220ms ease,background-color 220ms ease",
            "@keyframes summaryAttention": {
              "0%": { transform: "scale(.992)", boxShadow: "0 0 0 0 rgba(38,155,120,0), 0 8px 20px rgba(21,72,56,.06)" },
              "35%": { transform: "scale(1)", boxShadow: "0 0 0 7px rgba(38,155,120,.17), 0 18px 38px rgba(21,72,56,.14)" },
              "100%": { transform: "scale(1)", boxShadow: "0 0 0 3px rgba(38,155,120,.08), 0 12px 30px rgba(21,72,56,.09)" },
            },
            "&::before": { display: "none" },
            "@media (prefers-reduced-motion: reduce)": { transition: "none", animation: "none" },
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
                <Stack direction="row" alignItems="center" gap={.55} flexShrink={0}>
                  <Typography sx={{ fontSize: 10.2, fontWeight: 820, color: "#176047", whiteSpace: "nowrap" }}>
                    {currency.format(Number(item.cost ?? 0))}
                  </Typography>
                  <Chip size="small" label={item.origin === "TEAM" ? "Equipe" : item.origin === "THIRD_PARTY" ? "Terceiro" : "Ambos"}
                    sx={{ height: 22, borderRadius: "7px", fontSize: 9.2, fontWeight: 750, bgcolor: "#e7f3ee", color: "#245843" }} />
                </Stack>
              </Stack>)}
            </Stack> : <Typography color="text.secondary" sx={{ fontSize: 11, py: 1 }}>Selecione funções ou especialidades acima para compor o resumo.</Typography>}
          </AccordionDetails>
        </Accordion>


      </>}
    </Box>
  </Container>;
}
