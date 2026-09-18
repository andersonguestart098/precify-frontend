import { useEffect, useMemo, useState } from "react";
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
import { HardHat } from "@phosphor-icons/react";
import {
  getLaborPlan, listProjects, saveLaborPlan,
  type LaborMode, type LaborPlanItem, type Project,
} from "../services/api";
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
    sx={{ border: "1px solid #dce9e5", borderRadius: "16px !important", overflow: "hidden", bgcolor: "rgba(255,255,255,.78)", "&::before": { display: "none" } }}>
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 1.45, sm: 2 }, minHeight: 62, "& .MuiAccordionSummary-content": { my: 1 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" minWidth={0} pr={1} gap={1}>
        <Box minWidth={0}>
          <Typography fontWeight={850} color="#21483b" sx={{ fontSize: { xs: 14, sm: 15 } }}>{group.title}</Typography>
          {group.subtitle && <Typography color="text.secondary" sx={{ fontSize: 11.5, mt: .15 }}>{group.subtitle}</Typography>}
        </Box>
        <Chip size="small" label={selectedCount ? `${selectedCount} selecionado${selectedCount > 1 ? "s" : ""}` : `${group.items.length} opções`}
          sx={{ flexShrink: 0, height: 24, bgcolor: selectedCount ? "#e6f3ee" : "#f1f5f3", color: selectedCount ? "#176047" : "#72827c", fontWeight: 750, fontSize: 9.5 }} />
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={{ px: { xs: 1.1, sm: 1.5 }, pt: 0, pb: 1.2 }}>
      <Divider sx={{ mb: .55 }} />
      <Stack divider={<Divider flexItem />}>
        {visible.map(item => {
          const selected = selections[item.code];
          return <Box key={item.code} sx={{ py: .55 }}>
            <Stack direction="row" alignItems="center" gap={.75}>
              <Checkbox checked={Boolean(selected)} onChange={() => onToggle(item, source)} size="small"
                inputProps={{ "aria-label": `Selecionar ${item.title}` }} sx={{ p: .55, color: "#9ab0a8", "&.Mui-checked": { color: "#08785b" } }} />
              <Box minWidth={0} flex={1}>
                <Typography fontWeight={selected ? 800 : 680} color="#284d41" sx={{ fontSize: { xs: 12.4, sm: 13 } }}>{item.title}</Typography>
                {item.section && <Typography sx={{ mt: .12, fontSize: 9.6, color: "#83928d" }}>{item.section}</Typography>}
              </Box>
              {mode === "BOTH" && selected && <TextField select size="small" value={selected.origin}
                onChange={event => onOriginChange(item.code, event.target.value as LaborPlanItem["origin"])}
                sx={{ width: 108, flexShrink: 0, "& .MuiInputBase-root": { height: 32, borderRadius: 2, fontSize: 10.5 } }}>
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<LaborMode>("");
  const [selections, setSelections] = useState<Record<string, LaborPlanItem>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setError(""); setSuccess("");
    const projectsRequest = listProjects();
    const planRequest = projectId ? getLaborPlan(projectId) : Promise.resolve(null);
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
  }, [projectId]);

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

  const save = async () => {
    if (!projectId || !mode) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const saved = await saveLaborPlan(projectId, { mode, items: selectedItems });
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
          <Typography component="h1" sx={{ fontSize: { xs: 31, md: 42 }, lineHeight: 1, fontWeight: 900, letterSpacing: "-.04em", color: "#174b3b" }}>Mão de obra</Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: 12.5, md: 14 }, mt: .45 }}>Escolha a obra para montar o planejamento.</Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {!projects.length ? <Paper variant="outlined" sx={{ mt: 3, p: 4, borderRadius: 4, textAlign: "center", borderColor: "#dce9e5" }}>
        <HomeWorkOutlinedIcon sx={{ fontSize: 40, color: "#7e988f" }} />
        <Typography fontWeight={850} color="#284d40" mt={1}>Nenhuma obra cadastrada.</Typography>
        <Typography color="text.secondary" fontSize={13} mt={.45}>A mão de obra nasce dentro de uma obra.</Typography>
        <Button component={RouterLink} to="/obras" variant="contained" sx={{ mt: 2, borderRadius: 999, textTransform: "none" }}>Cadastrar obra</Button>
      </Paper> : <Stack gap={1} mt={3}>
        {projects.map(work => <ButtonBase key={work.id} component={RouterLink} to={`/obras/${encodeURIComponent(work.id)}/mao-de-obra`}
          sx={{ p: { xs: 1.4, sm: 1.7 }, borderRadius: 3.5, border: "1px solid #dce9e5", bgcolor: "rgba(255,255,255,.78)", textAlign: "left", justifyContent: "stretch", transition: "160ms ease", "&:hover": { borderColor: "#9acdbb", bgcolor: "#f5fbf8" } }}>
          <Stack direction="row" alignItems="center" width="100%" gap={1.25}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "#e9f4f0", color: "#28634f" }}><HomeWorkOutlinedIcon /></Box>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={850} color="#21483b" noWrap>{work.name}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>{work.compositionIds.length} {work.compositionIds.length === 1 ? "composição vinculada" : "composições vinculadas"}</Typography>
            </Box>
            <ArrowForwardRoundedIcon sx={{ color: "#6f8b81" }} />
          </Stack>
        </ButtonBase>)}
      </Stack>}
    </Box>
  </Container>;

  if (!project) return <Container maxWidth="lg" sx={{ py: 5 }}><Alert severity="warning">Essa obra não está disponível na sua conta.</Alert></Container>;

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, md: 4.5 }, pb: { xs: 5, md: 5 } }}>
    <Box sx={{ maxWidth: 1020, mx: "auto" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "end" }} gap={2}>
        <Box>
          <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.3 }}>Mão de obra da obra</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 30, md: 42 }, lineHeight: 1.02, fontWeight: 900, letterSpacing: "-.04em", color: "#174b3b" }}>{project.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: .55, fontSize: { xs: 12.5, md: 14 } }}>Defina como a obra será atendida e selecione somente o que ela precisa.</Typography>
        </Box>
        <Button component={RouterLink} to="/mao-de-obra" variant="text" sx={{ alignSelf: { xs: "flex-start", md: "auto" }, textTransform: "none", fontWeight: 750 }}>Trocar obra</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

      <Box component="section" aria-labelledby="labor-mode-title" mt={3}>
        <Typography id="labor-mode-title" fontWeight={850} color="#244d40" sx={{ fontSize: 15 }}>Como esta obra será atendida?</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 11.5, mt: .25 }}>Uma decisão simples na entrada. Você pode mudar depois.</Typography>
        <Box sx={{ mt: 1.25, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 1 }}>
          {modeOptions.map(option => {
            const Icon = option.icon;
            const active = mode === option.value;
            return <ButtonBase key={option.value} onClick={() => chooseMode(option.value)} aria-pressed={active} sx={{
              p: 1.35, minHeight: 96, borderRadius: 3.5, textAlign: "left", alignItems: "stretch", justifyContent: "flex-start",
              border: "1px solid", borderColor: active ? "#70b59d" : "#dce9e5",
              bgcolor: active ? "#edf8f4" : "rgba(255,255,255,.72)", boxShadow: active ? "0 8px 24px rgba(0,107,79,.07)" : "none",
              transition: "160ms ease", "&:hover": { borderColor: "#9acdbb", bgcolor: active ? "#e9f6f1" : "#f8fbfa" }
            }}>
              <Stack gap={1} width="100%">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ width: 34, height: 34, borderRadius: 2.3, display: "grid", placeItems: "center", bgcolor: active ? "#d9eee7" : "#eef5f2", color: "#28634f" }}><Icon sx={{ fontSize: 20 }} /></Box>
                  <Box sx={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid", borderColor: active ? "#3d9b79" : "#cfded8", bgcolor: active ? "#0b8060" : "transparent", boxShadow: active ? "inset 0 0 0 3px #edf8f4" : "none" }} />
                </Stack>
                <Box>
                  <Typography fontWeight={850} color="#21483b" sx={{ fontSize: 13.2 }}>{option.title}</Typography>
                  <Typography color="text.secondary" sx={{ mt: .2, fontSize: 10.2, lineHeight: 1.3 }}>{option.description}</Typography>
                </Box>
              </Stack>
            </ButtonBase>;
          })}
        </Box>
      </Box>

      {mode && <>
        <Paper variant="outlined" sx={{ mt: 2, px: { xs: 1.35, sm: 1.7 }, py: 1.25, borderRadius: 3.5, borderColor: "#dce9e5", bgcolor: "rgba(250,253,252,.9)" }}>
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
            <Button variant="contained" disableElevation startIcon={saving ? <CircularProgress color="inherit" size={15} /> : <SaveRoundedIcon />} onClick={() => void save()} disabled={saving}
              sx={{ borderRadius: 999, px: 2.2, textTransform: "none", fontWeight: 800, alignSelf: { xs: "stretch", sm: "center" } }}>Salvar planejamento</Button>
          </Stack>
        </Paper>

        <TextField fullWidth size="small" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar função ou especialidade"
          slotProps={{ input: { startAdornment: <SearchRoundedIcon sx={{ mr: .8, fontSize: 18, color: "#789087" }} /> } }}
          sx={{ mt: 2, "& .MuiInputBase-root": { borderRadius: 3, bgcolor: "rgba(255,255,255,.78)" } }} />

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

        <Accordion disableGutters elevation={0} sx={{ mt: 2.6, border: "1px solid #dce9e5", borderRadius: "16px !important", overflow: "hidden", bgcolor: "#f8fbfa", "&::before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 1.5, minHeight: 62 }}>
            <Stack direction="row" gap={1} alignItems="center" width="100%">
              <Box sx={{ width: 36, height: 36, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "#e8f4ef", color: "#2b6651", flexShrink: 0 }}><HardHat size={20} weight="duotone" /></Box>
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
                  sx={{ height: 22, fontSize: 9.2, fontWeight: 750, bgcolor: "#e7f3ee", color: "#245843" }} />
              </Stack>)}
            </Stack> : <Typography color="text.secondary" sx={{ fontSize: 11, py: 1 }}>Selecione funções ou especialidades acima para compor o resumo.</Typography>}
          </AccordionDetails>
        </Accordion>
      </>}
    </Box>
  </Container>;
}
