import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress, Container, Divider, Paper, Stack, TextField, Typography,
} from "@mui/material";
import { type LaborPlan, type Project } from "../services/api";
import { useAccount } from "../auth/session";
import {
  getCachedCompositions, getCachedLaborPlan, getCachedProjects,
  loadCompositionsCached, loadLaborPlanCached, loadProjectsCached,
} from "../services/appWarmCache";
import type { Composition } from "../domain/composition";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function laborModeLabel(mode: LaborPlan["mode"]) {
  if (mode === "TEAM") return "Equipe própria";
  if (mode === "THIRD_PARTY") return "Terceiros";
  if (mode === "BOTH") return "Equipe + terceiros";
  return "Não configurada";
}

function originLabel(origin: "TEAM" | "THIRD_PARTY" | "BOTH") {
  if (origin === "TEAM") return "Equipe";
  if (origin === "THIRD_PARTY") return "Terceiro";
  return "Ambos";
}

export default function ComparePage() {
  const user = useAccount();
  const [params, setParams] = useSearchParams();
  const selectedIds = useMemo(() => [...new Set((params.get("projects") ?? "").split(",").map(value => value.trim()).filter(Boolean))].slice(0, 3), [params]);
  const [projects, setProjects] = useState<Project[]>(() => getCachedProjects(user.id) ?? []);
  const [compositions, setCompositions] = useState<Composition[]>(() => getCachedCompositions(user.id) ?? []);
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const [laborPlans, setLaborPlans] = useState<Record<string, LaborPlan>>({});
  const [loading, setLoading] = useState(() => !(getCachedProjects(user.id) && getCachedCompositions(user.id)));
  const [laborLoading, setLaborLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!(getCachedProjects(user.id) && getCachedCompositions(user.id))) setLoading(true);
    setError("");
    Promise.all([loadProjectsCached(user.id), loadCompositionsCached(user.id)])
      .then(([works, lists]) => {
        if (!active) return;
        setProjects(works);
        setCompositions(lists);
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar os dados das obras.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.id]);

  useEffect(() => {
    const syncFromCache = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId && detail.userId !== user.id) return;
      const cachedProjects = getCachedProjects(user.id);
      const cachedCompositions = getCachedCompositions(user.id);
      if (cachedProjects) setProjects(cachedProjects);
      if (cachedCompositions) setCompositions(cachedCompositions);
    };
    window.addEventListener("precify-app-data-refreshed", syncFromCache);
    return () => window.removeEventListener("precify-app-data-refreshed", syncFromCache);
  }, [user.id]);

  useEffect(() => {
    setDraftIds(selectedIds);
    if (!selectedIds.length) {
      setLaborPlans({});
      return;
    }

    let active = true;
    setLaborLoading(true);
    setError("");
    Promise.all(selectedIds.map(async projectId => [
      projectId,
      getCachedLaborPlan(user.id, projectId) ?? await loadLaborPlanCached(user.id, projectId),
    ] as const))
      .then(entries => { if (active) setLaborPlans(Object.fromEntries(entries)); })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar a mão de obra das obras selecionadas.");
      })
      .finally(() => { if (active) setLaborLoading(false); });
    return () => { active = false; };
  }, [selectedIds.join("|"), user.id]);

  const selectedProjects = selectedIds.map(id => projects.find(project => project.id === id)).filter((project): project is Project => Boolean(project));
  const draftProjects = draftIds.map(id => projects.find(project => project.id === id)).filter((project): project is Project => Boolean(project));

  const snapshots = selectedProjects.map(project => {
    const linkedCompositions = compositions.filter(composition => project.compositionIds.includes(composition.id));
    const plan = laborPlans[project.id];
    const total = linkedCompositions.reduce((sum, composition) => sum + composition.total, 0);
    const itemCount = linkedCompositions.reduce((sum, composition) => sum + composition.items.length, 0);
    const teamCount = plan?.items.filter(item => item.origin === "TEAM").length ?? 0;
    const thirdCount = plan?.items.filter(item => item.origin === "THIRD_PARTY").length ?? 0;
    const bothCount = plan?.items.filter(item => item.origin === "BOTH").length ?? 0;
    return { project, compositions: linkedCompositions, plan, total, itemCount, teamCount, thirdCount, bothCount };
  });

  const compare = () => {
    const next = draftIds.slice(0, 3);
    setParams(next.length ? { projects: next.join(",") } : {});
  };

  const summaryLines = useMemo(() => {
    if (snapshots.length < 2) return [];
    const totals = snapshots.map(snapshot => snapshot.total);
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    const compositionCounts = snapshots.map(snapshot => snapshot.compositions.length);
    const laborCounts = snapshots.map(snapshot => snapshot.plan?.items.length ?? 0);

    return [
      min === max
        ? `As obras selecionadas têm o mesmo total de composições: ${currency.format(max)}.`
        : `O total das composições varia de ${currency.format(min)} a ${currency.format(max)} entre as obras selecionadas.`,
      `As obras possuem entre ${Math.min(...compositionCounts)} e ${Math.max(...compositionCounts)} composições vinculadas.`,
      `O planejamento de mão de obra contém entre ${Math.min(...laborCounts)} e ${Math.max(...laborCounts)} necessidades selecionadas.`,
    ];
  }, [snapshots]);

  if (loading) return <Box minHeight={420} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box>;

  return <Container maxWidth="xl" component="main" sx={{ py: { xs: 2.5, md: 5 }, px: { xs: 2, sm: 3, md: 4 } }}>
    <Box sx={{ maxWidth: 1180, mx: "auto" }}>
      <Box sx={{ mb: { xs: 2.2, md: 3.2 } }}>
        <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.35 }}>
          Análise de obras
        </Typography>
        <Typography component="h1" sx={{
          mt: .3, fontSize: { xs: 34, md: 44 }, lineHeight: 1.04, fontWeight: 900, letterSpacing: "-.045em",
          background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Comparar obras
        </Typography>
        <Typography color="text.secondary" sx={{ mt: .65, maxWidth: 760, fontSize: { xs: 13, md: 14 }, lineHeight: 1.55 }}>
          Compare composições, custos e mão de obra lado a lado e veja um resumo objetivo das diferenças.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{
        p: { xs: 1.7, sm: 2.1 }, borderRadius: { xs: "18px", md: "16px" },
        borderColor: "#dce9e5", bgcolor: "#fbfdfc", boxShadow: "0 7px 24px rgba(23,67,53,.035)",
      }}>
        <Stack direction="row" alignItems="center" gap={1} mb={1.35}>
          <Box sx={{
            width: 38, height: 38, borderRadius: "9px", display: "grid", placeItems: "center",
            bgcolor: "#e8f4ef", color: "#28634f", border: "1px solid #dcebe6",
          }}>
            <CompareArrowsRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography fontWeight={850} color="#21483b" sx={{ fontSize: 13.5 }}>Escolha as obras</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 10.3 }}>Selecione de 2 a 3 obras para comparar.</Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Autocomplete
            multiple
            fullWidth
            options={projects}
            value={draftProjects}
            getOptionLabel={option => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, values) => setDraftIds(values.slice(0, 3).map(project => project.id))}
            getOptionDisabled={option => draftIds.length >= 3 && !draftIds.includes(option.id)}
            limitTags={2}
            noOptionsText="Nenhuma obra disponível"
            renderInput={params => <TextField {...params} label="Obras" placeholder={draftIds.length ? "Adicionar outra obra" : "Selecione as obras"} />}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 52, borderRadius: "26px", bgcolor: "#f8faf9", fontSize: 14,
                "& fieldset": { borderColor: "#dfe7e4" },
                "&:hover fieldset": { borderColor: "#a6c8bd" },
                "&.Mui-focused": { bgcolor: "#fff", boxShadow: "0 0 0 3px #006b4f12" },
                "&.Mui-focused fieldset": { borderColor: "#006b4f", borderWidth: 1 },
              },
              "& .MuiChip-root": { height: 25, borderRadius: "8px", bgcolor: "#e8f4ef", color: "#245843", fontWeight: 760, fontSize: 10.3 },
            }}
          />
          <Button variant="contained" disableElevation onClick={compare} disabled={draftIds.length < 2}
            startIcon={<CompareArrowsRoundedIcon />} sx={{
              minHeight: 50, borderRadius: 999, px: 2.5, textTransform: "none", fontWeight: 820,
              whiteSpace: "nowrap", background: "linear-gradient(110deg,#176046,#007252)",
              boxShadow: "0 5px 14px rgba(0,107,79,.12)", "&:hover": { background: "#175641" },
            }}>
            Comparar
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mt: 1.7, borderRadius: 3 }}>{error}</Alert>}

      {!selectedProjects.length && <Box sx={{
        mt: 3, py: 5.5, textAlign: "center", borderTop: "1px solid #e4ece9", borderBottom: "1px solid #e4ece9",
      }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", mx: "auto", bgcolor: "#edf6f2", color: "#356554" }}>
          <CompareArrowsRoundedIcon />
        </Box>
        <Typography mt={1.2} fontWeight={850} color="#284d40">Escolha duas ou mais obras.</Typography>
        <Typography mt={.4} color="text.secondary" sx={{ fontSize: 12.5 }}>O Precify organiza os vínculos lado a lado.</Typography>
      </Box>}

      {!!selectedProjects.length && <Box sx={{ mt: 2.2 }}>
        {laborLoading && <Stack direction="row" alignItems="center" gap={1} mb={1.2}>
          <CircularProgress size={16} />
          <Typography color="text.secondary" sx={{ fontSize: 11 }}>Carregando mão de obra...</Typography>
        </Stack>}

        <Box sx={{
          overflowX: "auto", pb: .65, scrollbarWidth: "thin",
          mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 },
        }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: `minmax(118px,138px) repeat(${Math.max(1, snapshots.length)},minmax(180px,1fr))`,
            minWidth: snapshots.length > 1 ? { xs: 118 + snapshots.length * 180, sm: 640 } : 0,
            border: "1px solid #dce7e3", borderRadius: "14px", overflow: "hidden", bgcolor: "#fff",
          }}>
            <Box sx={{ p: 1.2, bgcolor: "#f5faf8", borderRight: "1px solid #e3ebe8" }} />
            {snapshots.map(snapshot => <Box key={snapshot.project.id} sx={{ p: 1.25, minWidth: 0, bgcolor: "#f5faf8", borderRight: "1px solid #e3ebe8", "&:last-child": { borderRight: 0 } }}>
              <Stack direction="row" alignItems="center" gap={.7}>
                <HomeWorkOutlinedIcon sx={{ fontSize: 18, color: "#39725f", flexShrink: 0 }} />
                <Typography fontWeight={880} color="#21483b" sx={{ fontSize: 12.5, lineHeight: 1.15 }}>{snapshot.project.name}</Typography>
              </Stack>
            </Box>)}

            {[
              ["Composições", (snapshot: typeof snapshots[number]) => String(snapshot.compositions.length)],
              ["Itens", (snapshot: typeof snapshots[number]) => String(snapshot.itemCount)],
              ["Custo", (snapshot: typeof snapshots[number]) => currency.format(snapshot.total)],
              ["Modo M.O.", (snapshot: typeof snapshots[number]) => laborModeLabel(snapshot.plan?.mode ?? "")],
              ["Necessidades M.O.", (snapshot: typeof snapshots[number]) => String(snapshot.plan?.items.length ?? 0)],
              ["Equipe", (snapshot: typeof snapshots[number]) => String(snapshot.teamCount)],
              ["Terceiros", (snapshot: typeof snapshots[number]) => String(snapshot.thirdCount)],
              ["Ambos", (snapshot: typeof snapshots[number]) => String(snapshot.bothCount)],
            ].flatMap(([label, getValue], rowIndex) => {
              const valueFn = getValue as (snapshot: typeof snapshots[number]) => string;
              return [
                <Box key={`label-${rowIndex}`} sx={{ px: 1.2, py: .9, bgcolor: "#fbfdfc", borderTop: "1px solid #e8efec", borderRight: "1px solid #e3ebe8" }}>
                  <Typography sx={{ fontSize: 9.3, fontWeight: 800, color: "#668078", lineHeight: 1.2 }}>{label as string}</Typography>
                </Box>,
                ...snapshots.map(snapshot => <Box key={`${snapshot.project.id}-${rowIndex}`} sx={{ px: 1.25, py: .9, borderTop: "1px solid #e8efec", borderRight: "1px solid #e8efec", "&:last-child": { borderRight: 0 } }}>
                  <Typography sx={{ fontSize: 11.2, fontWeight: label === "Custo" ? 850 : 720, color: label === "Custo" ? "#176047" : "#36564b", lineHeight: 1.25 }}>{valueFn(snapshot)}</Typography>
                </Box>),
              ];
            })}
          </Box>
        </Box>

        <Box sx={{ mt: 1.25, display: "grid", gridTemplateColumns: { xs: "1fr", md: `repeat(${Math.max(1, snapshots.length)},minmax(0,1fr))` }, gap: 1 }}>
          {snapshots.map(snapshot => <Paper key={snapshot.project.id} variant="outlined" sx={{ borderRadius: "12px", borderColor: "#dfe9e6", overflow: "hidden" }}>
            <Box sx={{ px: 1.35, py: 1.1, bgcolor: "#fbfdfc" }}>
              <Typography fontWeight={850} color="#21483b" sx={{ fontSize: 12.3 }}>{snapshot.project.name}</Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 1.25 }}>
              <Stack direction="row" alignItems="center" gap={.6} mb={.7}>
                <Inventory2OutlinedIcon sx={{ fontSize: 17, color: "#39725f" }} />
                <Typography fontWeight={820} color="#315247" sx={{ fontSize: 10.8 }}>Composições</Typography>
              </Stack>
              {snapshot.compositions.length ? <Stack gap={.5}>
                {snapshot.compositions.map(composition => <Stack key={composition.id} direction="row" justifyContent="space-between" gap={1}>
                  <Typography sx={{ fontSize: 9.7, color: "#536d64", lineHeight: 1.25 }}>{composition.name}</Typography>
                  <Typography sx={{ fontSize: 9.7, fontWeight: 760, color: "#31594b", whiteSpace: "nowrap" }}>{currency.format(composition.total)}</Typography>
                </Stack>)}
              </Stack> : <Typography color="text.secondary" sx={{ fontSize: 9.7 }}>Sem composições vinculadas.</Typography>}

              <Divider sx={{ my: 1 }} />
              <Stack direction="row" alignItems="center" gap={.6} mb={.7}>
                <Groups2OutlinedIcon sx={{ fontSize: 17, color: "#39725f" }} />
                <Typography fontWeight={820} color="#315247" sx={{ fontSize: 10.8 }}>Mão de obra</Typography>
              </Stack>
              {snapshot.plan?.items.length ? <Stack gap={.45}>
                {snapshot.plan.items.map(item => <Stack key={item.code} direction="row" alignItems="center" gap={.6}>
                  <Typography flex={1} sx={{ fontSize: 9.5, color: "#536d64", lineHeight: 1.25 }}>{item.title}</Typography>
                  <Chip size="small" label={originLabel(item.origin)} sx={{ height: 20, borderRadius: "6px", fontSize: 8.3, fontWeight: 760, bgcolor: "#eaf4f0", color: "#31594b" }} />
                </Stack>)}
              </Stack> : <Typography color="text.secondary" sx={{ fontSize: 9.7 }}>Sem planejamento salvo.</Typography>}
            </Box>
          </Paper>)}
        </Box>

        {summaryLines.length ? <Paper variant="outlined" sx={{ mt: 1.4, p: { xs: 1.4, sm: 1.7 }, borderRadius: "12px", borderColor: "#dce9e5", bgcolor: "#f8fbfa" }}>
          <Typography fontWeight={880} color="#21483b" sx={{ fontSize: 12.8 }}>Resumo da comparação</Typography>
          <Stack gap={.55} mt={.9}>
            {summaryLines.map(line => <Stack key={line} direction="row" gap={.7} alignItems="flex-start">
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#269b78", mt: .65, flexShrink: 0 }} />
              <Typography color="#536d64" sx={{ fontSize: 10.8, lineHeight: 1.45 }}>{line}</Typography>
            </Stack>)}
          </Stack>
        </Paper> : null}
      </Box>}
    </Box>
  </Container>;
}
