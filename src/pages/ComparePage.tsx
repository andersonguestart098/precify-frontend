import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {
  Alert, Box, ButtonBase, Chip, CircularProgress, Container, Divider, Paper, Stack, Typography,
} from "@mui/material";
import { useAccount } from "../auth/session";
import type { Composition } from "../domain/composition";
import {
  getCachedCompositions, getCachedLaborPlan, getCachedProjects,
  loadCompositionsCached, loadLaborPlanCached, loadProjectsCached,
} from "../services/appWarmCache";
import { type LaborPlan, type Project } from "../services/api";

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
  const selectedParam = params.get("projects") ?? "";
  const selectedIds = useMemo(
    () => [...new Set(selectedParam.split(",").map(value => value.trim()).filter(Boolean))].slice(0, 3),
    [selectedParam],
  );

  const [projects, setProjects] = useState<Project[]>(() => getCachedProjects(user.id) ?? []);
  const [compositions, setCompositions] = useState<Composition[]>(() => getCachedCompositions(user.id) ?? []);
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
    if (loading || selectedIds.length || projects.length < 2) return;
    const initial = projects.slice(0, Math.min(3, projects.length)).map(project => project.id);
    setParams({ projects: initial.join(",") }, { replace: true });
  }, [loading, projects, selectedIds.length, setParams]);

  useEffect(() => {
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
  }, [selectedParam, user.id]);

  const selectedProjects = useMemo(
    () => selectedIds
      .map(id => projects.find(project => project.id === id))
      .filter((project): project is Project => Boolean(project)),
    [projects, selectedParam],
  );

  const snapshots = useMemo(() => selectedProjects.map(project => {
    const linkedCompositions = compositions.filter(composition => project.compositionIds.includes(composition.id));
    const plan = laborPlans[project.id];
    const total = linkedCompositions.reduce((sum, composition) => sum + composition.total, 0);
    const itemCount = linkedCompositions.reduce((sum, composition) => sum + composition.items.length, 0);
    const teamCount = plan?.items.filter(item => item.origin === "TEAM").length ?? 0;
    const thirdCount = plan?.items.filter(item => item.origin === "THIRD_PARTY").length ?? 0;
    const bothCount = plan?.items.filter(item => item.origin === "BOTH").length ?? 0;

    return {
      project,
      compositions: linkedCompositions,
      plan,
      total,
      itemCount,
      teamCount,
      thirdCount,
      bothCount,
    };
  }), [selectedProjects, compositions, laborPlans]);

  const summaryLines = useMemo(() => {
    if (snapshots.length < 2) return [];

    const lowest = snapshots.reduce((best, current) => current.total < best.total ? current : best);
    const highest = snapshots.reduce((best, current) => current.total > best.total ? current : best);
    const mostCompositions = snapshots.reduce((best, current) => current.compositions.length > best.compositions.length ? current : best);
    const mostLabor = snapshots.reduce((best, current) => (current.plan?.items.length ?? 0) > (best.plan?.items.length ?? 0) ? current : best);

    const costLine = lowest.total === highest.total
      ? `Todas as obras estão com o mesmo total de composições: ${currency.format(lowest.total)}.`
      : `${lowest.project.name} está com o menor total (${currency.format(lowest.total)}) e ${highest.project.name} com o maior (${currency.format(highest.total)}), diferença de ${currency.format(highest.total - lowest.total)}.`;

    return [
      costLine,
      `${mostCompositions.project.name} possui a maior quantidade de composições vinculadas: ${mostCompositions.compositions.length}.`,
      `${mostLabor.project.name} possui o maior planejamento de mão de obra entre as selecionadas: ${mostLabor.plan?.items.length ?? 0} necessidades.`,
    ];
  }, [snapshots]);

  const toggleProject = (projectId: string) => {
    const selected = selectedIds.includes(projectId);
    const next = selected
      ? selectedIds.filter(id => id !== projectId)
      : selectedIds.length < 3 ? [...selectedIds, projectId] : selectedIds;

    setParams(next.length ? { projects: next.join(",") } : {}, { replace: true });
  };

  if (loading) return <Box minHeight={420} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box>;

  return <Container maxWidth="xl" component="main" sx={{ py: { xs: 2.5, md: 5 }, px: { xs: 2, sm: 3, md: 4 } }}>
    <Box sx={{ maxWidth: 1180, mx: "auto" }}>
      <Box sx={{ mb: { xs: 1.8, md: 2.5 } }}>
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
        <Typography color="text.secondary" sx={{ mt: .65, maxWidth: 760, fontSize: { xs: 13, md: 14 }, lineHeight: 1.5 }}>
          Composições, custos e mão de obra lado a lado. Toque nas obras para incluir ou remover da comparação.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{
        p: { xs: 1.25, sm: 1.55 }, borderRadius: { xs: "15px", md: "14px" },
        borderColor: "#dce9e5", bgcolor: "#fbfdfc", boxShadow: "0 5px 20px rgba(23,67,53,.03)",
      }}>
        <Stack direction="row" alignItems="center" gap={.85} mb={1}>
          <Box sx={{
            width: 34, height: 34, borderRadius: "8px", display: "grid", placeItems: "center",
            bgcolor: "#e8f4ef", color: "#28634f", border: "1px solid #dcebe6",
          }}>
            <CompareArrowsRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box minWidth={0} flex={1}>
            <Typography fontWeight={850} color="#21483b" sx={{ fontSize: 12.8 }}>Obras na comparação</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 9.8 }}>Até 3 obras. A comparação atualiza automaticamente.</Typography>
          </Box>
          <Chip
            size="small"
            label={`${selectedIds.length}/3`}
            sx={{ height: 22, borderRadius: "7px", fontSize: 9, fontWeight: 800, bgcolor: "#edf5f2", color: "#45685c" }}
          />
        </Stack>

        {projects.length < 2 ? <Alert severity="info" sx={{ borderRadius: 2.5 }}>
          Cadastre pelo menos duas obras para comparar.
        </Alert> : <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))", md: "repeat(3,minmax(0,1fr))" },
          gap: .7,
        }}>
          {projects.map(project => {
            const selected = selectedIds.includes(project.id);
            const disabled = !selected && selectedIds.length >= 3;
            return <ButtonBase
              key={project.id}
              onClick={() => toggleProject(project.id)}
              disabled={disabled}
              aria-pressed={selected}
              sx={{
                minHeight: 58, px: 1, py: .8, borderRadius: "10px",
                justifyContent: "flex-start", textAlign: "left", gap: .8,
                border: "1px solid",
                borderColor: selected ? "#8bc4b0" : "#e0e9e6",
                bgcolor: selected ? "#f0f8f5" : "#fff",
                boxShadow: selected ? "0 5px 14px rgba(0,107,79,.045)" : "none",
                transition: "border-color 150ms ease,background-color 150ms ease,transform 150ms ease",
                "&:hover": { borderColor: selected ? "#6eaf98" : "#bdd7ce", transform: "translateY(-1px)" },
                "&.Mui-disabled": { opacity: .46 },
                "&.Mui-focusVisible": { outline: "2px solid rgba(38,155,120,.35)", outlineOffset: 2 },
              }}
            >
              <Box sx={{
                width: 32, height: 32, flexShrink: 0, borderRadius: "8px", display: "grid", placeItems: "center",
                bgcolor: selected ? "#dfeee8" : "#f0f5f3", color: "#366858",
              }}>
                <HomeWorkOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box minWidth={0} flex={1}>
                <Typography noWrap fontWeight={820} color="#254b3e" sx={{ fontSize: 11.3 }}>{project.name}</Typography>
                <Typography color="text.secondary" sx={{ mt: .1, fontSize: 8.8 }}>
                  {project.compositionIds.length} {project.compositionIds.length === 1 ? "composição" : "composições"}
                </Typography>
              </Box>
              <Box sx={{
                width: 18, height: 18, flexShrink: 0, borderRadius: "6px", display: "grid", placeItems: "center",
                border: "1px solid", borderColor: selected ? "#5ca78d" : "#d7e2de",
                bgcolor: selected ? "#0d7a5b" : "transparent", color: "#fff",
              }}>
                {selected ? <CheckRoundedIcon sx={{ fontSize: 13 }} /> : null}
              </Box>
            </ButtonBase>;
          })}
        </Box>}
      </Paper>

      {error ? <Alert severity="error" sx={{ mt: 1.5, borderRadius: 3 }}>{error}</Alert> : null}

      {selectedProjects.length < 2 ? <Box sx={{
        mt: 2, py: 4.5, textAlign: "center", borderTop: "1px solid #e4ece9", borderBottom: "1px solid #e4ece9",
      }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", mx: "auto", bgcolor: "#edf6f2", color: "#356554" }}>
          <CompareArrowsRoundedIcon />
        </Box>
        <Typography mt={1} fontWeight={850} color="#284d40">Escolha pelo menos duas obras.</Typography>
        <Typography mt={.35} color="text.secondary" sx={{ fontSize: 11.5 }}>A comparação aparece automaticamente aqui embaixo.</Typography>
      </Box> : <Box sx={{ mt: 1.6 }}>
        {laborLoading ? <Stack direction="row" alignItems="center" gap={.8} mb={1}>
          <CircularProgress size={14} />
          <Typography color="text.secondary" sx={{ fontSize: 10 }}>Atualizando mão de obra...</Typography>
        </Stack> : null}

        <Box sx={{ overflowX: "auto", pb: .6, scrollbarWidth: "thin", mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 } }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: `minmax(108px,132px) repeat(${snapshots.length},minmax(170px,1fr))`,
            minWidth: { xs: 108 + snapshots.length * 170, sm: 620 },
            border: "1px solid #dce7e3", borderRadius: "12px", overflow: "hidden", bgcolor: "#fff",
          }}>
            <Box sx={{ p: 1, bgcolor: "#f5faf8", borderRight: "1px solid #e3ebe8" }} />
            {snapshots.map(snapshot => <Box key={snapshot.project.id} sx={{
              p: 1.05, minWidth: 0, bgcolor: "#f5faf8",
              borderRight: "1px solid #e3ebe8", "&:last-child": { borderRight: 0 },
            }}>
              <Stack direction="row" alignItems="center" gap={.6}>
                <HomeWorkOutlinedIcon sx={{ fontSize: 17, color: "#39725f", flexShrink: 0 }} />
                <Typography fontWeight={860} color="#21483b" sx={{ fontSize: 11.4, lineHeight: 1.15 }}>{snapshot.project.name}</Typography>
              </Stack>
            </Box>)}

            {[
              ["Composições", (snapshot: typeof snapshots[number]) => String(snapshot.compositions.length)],
              ["Itens", (snapshot: typeof snapshots[number]) => String(snapshot.itemCount)],
              ["Custo", (snapshot: typeof snapshots[number]) => currency.format(snapshot.total)],
              ["Modo M.O.", (snapshot: typeof snapshots[number]) => laborModeLabel(snapshot.plan?.mode ?? "")],
              ["Necessidades", (snapshot: typeof snapshots[number]) => String(snapshot.plan?.items.length ?? 0)],
              ["Equipe", (snapshot: typeof snapshots[number]) => String(snapshot.teamCount)],
              ["Terceiros", (snapshot: typeof snapshots[number]) => String(snapshot.thirdCount)],
              ["Ambos", (snapshot: typeof snapshots[number]) => String(snapshot.bothCount)],
            ].flatMap(([label, getValue], rowIndex) => {
              const valueFn = getValue as (snapshot: typeof snapshots[number]) => string;
              return [
                <Box key={`label-${rowIndex}`} sx={{
                  px: 1, py: .75, bgcolor: "#fbfdfc", borderTop: "1px solid #e8efec", borderRight: "1px solid #e3ebe8",
                }}>
                  <Typography sx={{ fontSize: 8.8, fontWeight: 800, color: "#668078", lineHeight: 1.15 }}>{label as string}</Typography>
                </Box>,
                ...snapshots.map(snapshot => <Box key={`${snapshot.project.id}-${rowIndex}`} sx={{
                  px: 1.05, py: .75, borderTop: "1px solid #e8efec", borderRight: "1px solid #e8efec",
                  "&:last-child": { borderRight: 0 },
                }}>
                  <Typography sx={{
                    fontSize: 10.5, fontWeight: label === "Custo" ? 850 : 720,
                    color: label === "Custo" ? "#176047" : "#36564b", lineHeight: 1.2,
                  }}>
                    {valueFn(snapshot)}
                  </Typography>
                </Box>),
              ];
            })}
          </Box>
        </Box>

        <Box sx={{
          mt: 1,
          display: { xs: "flex", md: "grid" },
          gridTemplateColumns: { md: `repeat(${snapshots.length},minmax(0,1fr))` },
          gap: .8, overflowX: { xs: "auto", md: "visible" },
          mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 }, pb: { xs: .6, md: 0 },
          scrollSnapType: { xs: "x proximity", md: "none" }, scrollbarWidth: "thin",
        }}>
          {snapshots.map(snapshot => <Paper key={snapshot.project.id} variant="outlined" sx={{
            borderRadius: "11px", borderColor: "#dfe9e6", overflow: "hidden",
            minWidth: { xs: "76vw", sm: 280, md: 0 }, maxWidth: { xs: 310, md: "none" },
            flex: { xs: "0 0 auto", md: "initial" }, scrollSnapAlign: { xs: "start", md: "none" },
          }}>
            <Box sx={{ px: 1.2, py: .9, bgcolor: "#fbfdfc" }}>
              <Typography fontWeight={850} color="#21483b" sx={{ fontSize: 11.6 }}>{snapshot.project.name}</Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 1.1 }}>
              <Stack direction="row" alignItems="center" gap={.55} mb={.65}>
                <Inventory2OutlinedIcon sx={{ fontSize: 16, color: "#39725f" }} />
                <Typography fontWeight={820} color="#315247" sx={{ fontSize: 10.2 }}>Composições</Typography>
              </Stack>
              {snapshot.compositions.length ? <Stack gap={.42}>
                {snapshot.compositions.map(composition => <Stack key={composition.id} direction="row" justifyContent="space-between" gap={1}>
                  <Typography sx={{ fontSize: 9.2, color: "#536d64", lineHeight: 1.22 }}>{composition.name}</Typography>
                  <Typography sx={{ fontSize: 9.2, fontWeight: 760, color: "#31594b", whiteSpace: "nowrap" }}>{currency.format(composition.total)}</Typography>
                </Stack>)}
              </Stack> : <Typography color="text.secondary" sx={{ fontSize: 9.2 }}>Sem composições vinculadas.</Typography>}

              <Divider sx={{ my: .9 }} />
              <Stack direction="row" alignItems="center" gap={.55} mb={.65}>
                <Groups2OutlinedIcon sx={{ fontSize: 16, color: "#39725f" }} />
                <Typography fontWeight={820} color="#315247" sx={{ fontSize: 10.2 }}>Mão de obra</Typography>
              </Stack>
              {snapshot.plan?.items.length ? <Stack gap={.4}>
                {snapshot.plan.items.map(item => <Stack key={item.code} direction="row" alignItems="center" gap={.5}>
                  <Typography flex={1} sx={{ fontSize: 9, color: "#536d64", lineHeight: 1.22 }}>{item.title}</Typography>
                  <Chip size="small" label={originLabel(item.origin)} sx={{
                    height: 19, borderRadius: "6px", fontSize: 7.9, fontWeight: 760, bgcolor: "#eaf4f0", color: "#31594b",
                  }} />
                </Stack>)}
              </Stack> : <Typography color="text.secondary" sx={{ fontSize: 9.2 }}>Sem planejamento salvo.</Typography>}
            </Box>
          </Paper>)}
        </Box>

        <Paper variant="outlined" sx={{
          mt: 1.1, p: { xs: 1.25, sm: 1.5 }, borderRadius: "11px", borderColor: "#dce9e5", bgcolor: "#f8fbfa",
        }}>
          <Typography fontWeight={880} color="#21483b" sx={{ fontSize: 12 }}>Resumo da comparação</Typography>
          <Stack gap={.48} mt={.75}>
            {summaryLines.map(line => <Stack key={line} direction="row" gap={.65} alignItems="flex-start">
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#269b78", mt: .58, flexShrink: 0 }} />
              <Typography color="#536d64" sx={{ fontSize: 10.3, lineHeight: 1.42 }}>{line}</Typography>
            </Stack>)}
          </Stack>
        </Paper>
      </Box>}
    </Box>
  </Container>;
}
