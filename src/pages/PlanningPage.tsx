import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { HardHat } from "@phosphor-icons/react";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, CircularProgress, Container,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, TextField, Tooltip, Typography
} from "@mui/material";
import {
  deleteProject, getLaborPlan, listCompositions, listProjects, saveProject,
  type LaborPlan, type LaborPlanItem, type Project,
} from "../services/api";
import type { Composition } from "../domain/composition";
import { downloadCompositions } from "../domain/export";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function laborModeLabel(mode: LaborPlan["mode"]) {
  if (mode === "TEAM") return "Equipe própria";
  if (mode === "THIRD_PARTY") return "Terceiros";
  if (mode === "BOTH") return "Equipe + terceiros";
  return "Não configurada";
}

function laborOriginLabel(origin: LaborPlanItem["origin"]) {
  if (origin === "TEAM") return "Equipe";
  if (origin === "THIRD_PARTY") return "Terceiro";
  return "Ambos";
}

function CompositionPanel({ composition }: { composition: Composition }) {
  return <Accordion disableGutters elevation={0} sx={{
    border: "1px solid #e0e9e6", borderRadius: "10px !important", overflow: "hidden",
    bgcolor: "#fff", "&::before": { display: "none" },
  }}>
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 19, color: "#6d837b" }} />} sx={{
      minHeight: 54, px: { xs: 1.15, sm: 1.4 },
      "& .MuiAccordionSummary-content": { my: .8 },
    }}>
      <Stack direction="row" alignItems="center" width="100%" minWidth={0} gap={1} pr={.6}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "8px", display: "grid", placeItems: "center",
          bgcolor: "#edf6f2", color: "#316855", border: "1px solid #e0ede8", flexShrink: 0,
        }}>
          <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box minWidth={0} flex={1}>
          <Typography fontWeight={800} color="#254b3e" noWrap sx={{ fontSize: { xs: 12.2, sm: 13 } }}>{composition.name}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 9.8, mt: .15 }}>
            {composition.items.length} {composition.items.length === 1 ? "item" : "itens"}
          </Typography>
        </Box>
        <Typography fontWeight={850} color="#176047" whiteSpace="nowrap" sx={{ fontSize: { xs: 11.5, sm: 12.5 } }}>
          {currency.format(composition.total)}
        </Typography>
      </Stack>
    </AccordionSummary>

    <AccordionDetails sx={{ px: { xs: 1, sm: 1.35 }, pt: 0, pb: 1 }}>
      <Divider sx={{ mb: .4 }} />
      {composition.items.length ? <Stack divider={<Divider flexItem />}>
        {composition.items.map(item => <Stack key={item.id} direction={{ xs: "column", sm: "row" }} gap={{ xs: .45, sm: 1 }}
          alignItems={{ sm: "center" }} py={.75} px={.35}>
          <Box minWidth={0} flex={1}>
            <Typography fontWeight={720} color="#315247" sx={{ fontSize: 10.8, lineHeight: 1.3 }}>{item.name}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 8.9, mt: .15 }}>
              {item.supplier ? `${item.supplier} • ` : ""}{item.materialCode}
            </Typography>
          </Box>
          <Stack direction="row" gap={{ xs: 1.4, sm: 2 }} alignItems="center" flexShrink={0}>
            <Box>
              <Typography color="text.secondary" sx={{ fontSize: 7.8, textTransform: "uppercase", letterSpacing: ".06em" }}>Quantidade</Typography>
              <Typography fontWeight={760} color="#405d53" sx={{ fontSize: 9.8 }}>{item.quantity} {item.unit}</Typography>
            </Box>
            <Box>
              <Typography color="text.secondary" sx={{ fontSize: 7.8, textTransform: "uppercase", letterSpacing: ".06em" }}>Unitário</Typography>
              <Typography fontWeight={760} color="#405d53" sx={{ fontSize: 9.8 }}>{currency.format(item.unitPrice)}</Typography>
            </Box>
            <Box sx={{ minWidth: 74 }}>
              <Typography color="text.secondary" sx={{ fontSize: 7.8, textTransform: "uppercase", letterSpacing: ".06em" }}>Subtotal</Typography>
              <Typography fontWeight={850} color="#176047" sx={{ fontSize: 9.8 }}>{currency.format(item.quantity * item.unitPrice)}</Typography>
            </Box>
          </Stack>
        </Stack>)}
      </Stack> : <Typography color="text.secondary" sx={{ fontSize: 10.5, py: 1 }}>Esta composição ainda não possui itens.</Typography>}
    </AccordionDetails>
  </Accordion>;
}

function LaborOverview({
  project,
  plan,
  loading,
  error,
}: {
  project: Project;
  plan?: LaborPlan;
  loading: boolean;
  error?: string;
}) {
  const teamCount = plan?.items.filter(item => item.origin === "TEAM").length ?? 0;
  const thirdCount = plan?.items.filter(item => item.origin === "THIRD_PARTY").length ?? 0;
  const bothCount = plan?.items.filter(item => item.origin === "BOTH").length ?? 0;

  return <Box component="section" aria-labelledby={`labor-${project.id}`} sx={{
    border: "1px solid #dbe7e3", borderRadius: "11px", bgcolor: "#fbfdfc", overflow: "hidden",
  }}>
    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1.1} px={{ xs: 1.2, sm: 1.5 }} py={1.2}>
      <Stack direction="row" alignItems="center" gap={1} minWidth={0} flex={1}>
        <Box sx={{
          width: 38, height: 38, borderRadius: "9px", display: "grid", placeItems: "center",
          bgcolor: "#e8f4ef", color: "#2b6651", border: "1px solid #dcebe6", flexShrink: 0,
        }}>
          <HardHat size={21} weight="duotone" />
        </Box>
        <Box minWidth={0}>
          <Typography id={`labor-${project.id}`} fontWeight={850} color="#21483b" sx={{ fontSize: 13.2 }}>Mão de obra</Typography>
          {loading ? <Typography color="text.secondary" sx={{ fontSize: 10 }}>Carregando planejamento...</Typography> :
            <Typography color="text.secondary" sx={{ fontSize: 10 }}>
              {plan?.items.length ? `${plan.items.length} necessidades • ${laborModeLabel(plan.mode)}` : "Nenhum planejamento de mão de obra salvo"}
            </Typography>}
        </Box>
      </Stack>

      <Button component={RouterLink} to={`/obras/${encodeURIComponent(project.id)}/mao-de-obra`} size="small"
        variant={plan?.items.length ? "outlined" : "contained"}
        sx={{ borderRadius: "8px", minHeight: 34, px: 1.45, textTransform: "none", fontWeight: 780, alignSelf: { xs: "stretch", sm: "center" } }}>
        {plan?.items.length ? "Gerenciar mão de obra" : "Configurar mão de obra"}
      </Button>
    </Stack>

    {error ? <Alert severity="error" sx={{ m: 1, mt: 0 }}>{error}</Alert> : loading ? <Box px={1.5} pb={1.4}><CircularProgress size={18} /></Box> :
      plan?.items.length ? <>
        <Divider />
        <Stack direction="row" gap={.6} flexWrap="wrap" px={{ xs: 1.2, sm: 1.5 }} py={1}>
          <Chip size="small" label={laborModeLabel(plan.mode)} sx={{ height: 23, borderRadius: "7px", fontWeight: 780, fontSize: 9.2, bgcolor: "#e8f4ef", color: "#245843" }} />
          {teamCount > 0 && <Chip size="small" label={`${teamCount} equipe`} sx={{ height: 23, borderRadius: "7px", fontSize: 9.1 }} />}
          {thirdCount > 0 && <Chip size="small" label={`${thirdCount} terceiro${thirdCount > 1 ? "s" : ""}`} sx={{ height: 23, borderRadius: "7px", fontSize: 9.1 }} />}
          {bothCount > 0 && <Chip size="small" label={`${bothCount} ambos`} sx={{ height: 23, borderRadius: "7px", fontSize: 9.1 }} />}
        </Stack>
        <Box sx={{
          px: { xs: 1.05, sm: 1.35 }, pb: 1.2,
          display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,minmax(0,1fr))" }, gap: .65,
        }}>
          {plan.items.map(item => <Stack key={item.code} direction="row" alignItems="center" gap={.8} sx={{
            px: 1, py: .75, minWidth: 0, border: "1px solid #e5ece9", borderRadius: "9px", bgcolor: "#fff",
          }}>
            <Box minWidth={0} flex={1}>
              <Typography fontWeight={760} color="#315247" sx={{ fontSize: 10.6, lineHeight: 1.25 }}>{item.title}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 8.5, mt: .1 }}>{item.code}</Typography>
            </Box>
            <Chip size="small" label={laborOriginLabel(item.origin)} sx={{
              height: 21, borderRadius: "6px", flexShrink: 0, fontSize: 8.7, fontWeight: 760,
              bgcolor: item.origin === "THIRD_PARTY" ? "#f1f4f3" : "#e9f5f0", color: "#31594b",
            }} />
          </Stack>)}
        </Box>
      </> : null}
  </Box>;
}

export default function PlanningPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [laborPlans, setLaborPlans] = useState<Record<string, LaborPlan>>({});
  const [laborLoading, setLaborLoading] = useState<Record<string, boolean>>({});
  const [laborErrors, setLaborErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<string>();
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([listProjects(), listCompositions()])
      .then(([works, lists]) => { if (active) { setProjects(works); setCompositions(lists); } })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar as obras."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  const selectedCompositions = useMemo(() => compositions.filter(composition => ids.includes(composition.id)), [compositions, ids]);
  const totalCompositionLinks = useMemo(() => projects.reduce((sum, project) => sum + project.compositionIds.length, 0), [projects]);
  const overallTotal = useMemo(() => projects.reduce((sum, project) => sum + compositions
    .filter(composition => project.compositionIds.includes(composition.id))
    .reduce((subtotal, composition) => subtotal + composition.total, 0), 0), [projects, compositions]);

  const ensureLaborPlan = async (projectId: string) => {
    if (laborPlans[projectId] || laborLoading[projectId]) return;
    setLaborLoading(current => ({ ...current, [projectId]: true }));
    setLaborErrors(current => ({ ...current, [projectId]: "" }));
    try {
      const plan = await getLaborPlan(projectId);
      setLaborPlans(current => ({ ...current, [projectId]: plan }));
    } catch (reason) {
      setLaborErrors(current => ({
        ...current,
        [projectId]: reason instanceof Error ? reason.message : "Não foi possível carregar a mão de obra desta obra.",
      }));
    } finally {
      setLaborLoading(current => ({ ...current, [projectId]: false }));
    }
  };

  const resetForm = () => {
    setEditing(undefined);
    setName("");
    setIds([]);
    setFormOpen(false);
  };

  const openNew = () => {
    setEditing(undefined);
    setName("");
    setIds([]);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project.id);
    setName(project.name);
    setIds(project.compositionIds);
    setError("");
    setFormOpen(true);
  };

  const save = async () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setSaving(true); setError("");
    try {
      const result = await saveProject({ name: cleanName, compositionIds: ids }, editing);
      setProjects(current => [...current.filter(project => project.id !== result.id), result]);
      resetForm();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar a obra.");
    } finally { setSaving(false); }
  };

  const remove = async (project: Project) => {
    if (!window.confirm(`Excluir a obra “${project.name}”? As composições serão mantidas, mas o planejamento de mão de obra desta obra será removido.`)) return;
    setBusy(true); setError("");
    try {
      await deleteProject(project.id);
      setProjects(current => current.filter(item => item.id !== project.id));
      setLaborPlans(current => {
        const next = { ...current };
        delete next[project.id];
        return next;
      });
      if (editing === project.id) resetForm();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível excluir a obra.");
    } finally { setBusy(false); }
  };

  return <Container maxWidth="xl" component="main" sx={{ py: { xs: 3, md: 5 } }}>
    <Box sx={{ maxWidth: 1160, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} gap={2}>
        <Box>
          <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.4 }}>Planejamento</Typography>
          <Typography component="h1" sx={{
            mt: .35, fontSize: { xs: 34, md: 44 }, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-.045em",
            background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Obras
          </Typography>
          <Typography color="text.secondary" mt={.7}>Veja tudo que pertence a cada obra: composições, itens, custos e mão de obra.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}
          sx={{ borderRadius: "9px", px: 2.4, minHeight: 40, alignSelf: { xs: "stretch", sm: "auto" }, textTransform: "none", fontWeight: 800, boxShadow: "none" }}>
          Nova obra
        </Button>
      </Stack>

      <Box sx={{
        mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,minmax(0,1fr))" },
        border: "1px solid #dce9e5", borderRadius: "12px", overflow: "hidden", bgcolor: "#fbfdfc",
      }}>
        {[
          { label: "Obras cadastradas", value: String(projects.length) },
          { label: "Composições vinculadas", value: String(totalCompositionLinks) },
          { label: "Total das composições", value: currency.format(overallTotal) },
        ].map((metric, index) => <Box key={metric.label} sx={{
          px: { xs: 1.5, sm: 1.7 }, py: 1.35,
          borderLeft: { xs: 0, sm: index ? "1px solid #e0e9e6" : 0 },
          borderTop: { xs: index ? "1px solid #e0e9e6" : 0, sm: 0 },
        }}>
          <Typography color="text.secondary" sx={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 720 }}>{metric.label}</Typography>
          <Typography color="#1d5845" fontWeight={900} sx={{ mt: .25, fontSize: { xs: 18, sm: index === 2 ? 18 : 22 } }}>{metric.value}</Typography>
        </Box>)}
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {busy ? <Box minHeight={260} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box> : !projects.length ?
        <Box sx={{ mt: 4, py: 7, textAlign: "center", borderTop: "1px solid #e3ebe8", borderBottom: "1px solid #e3ebe8" }}>
          <HomeWorkOutlinedIcon sx={{ fontSize: 42, color: "#8ca199" }} />
          <Typography fontWeight={850} color="#284d40" mt={1.2}>Nenhuma obra cadastrada.</Typography>
          <Typography color="text.secondary" fontSize={14} mt={.5}>Crie uma obra e vincule uma ou várias composições a ela.</Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew} sx={{ mt: 2.2, borderRadius: "9px", textTransform: "none" }}>Criar obra</Button>
        </Box> :
        <Stack gap={1} mt={3}>
          {projects.map(project => {
            const lists = compositions.filter(composition => project.compositionIds.includes(composition.id));
            const total = lists.reduce((sum, composition) => sum + composition.total, 0);
            const laborPlan = laborPlans[project.id];

            return <Accordion key={project.id} disableGutters elevation={0}
              onChange={(_, expanded) => { if (expanded) void ensureLaborPlan(project.id); }}
              sx={{
                border: "1px solid #d9e6e1", borderRadius: "11px !important", overflow: "hidden", bgcolor: "#fff",
                boxShadow: "0 3px 14px rgba(21,72,56,.025)", "&::before": { display: "none" },
              }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: "#6d837b" }} />} sx={{
                px: { xs: 1.25, sm: 1.7 }, minHeight: 70, bgcolor: "#fbfdfc",
                "& .MuiAccordionSummary-content": { my: 1 },
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" minWidth={0} pr={.8} gap={1.4}>
                  <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
                    <Box sx={{
                      width: 38, height: 38, borderRadius: "9px", display: "grid", placeItems: "center",
                      bgcolor: "#e9f4f0", color: "#28634f", border: "1px solid #dcebe6", flexShrink: 0,
                    }}>
                      <HomeWorkOutlinedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box minWidth={0}>
                      <Typography fontWeight={880} color="#21483b" noWrap sx={{ fontSize: { xs: 13.2, sm: 14 } }}>{project.name}</Typography>
                      <Stack direction="row" alignItems="center" gap={.6} mt={.2}>
                        <Typography color="text.secondary" sx={{ fontSize: 9.7 }}>
                          {lists.length} {lists.length === 1 ? "composição" : "composições"}
                        </Typography>
                        {laborPlan?.items.length ? <Typography color="#4f7769" sx={{ fontSize: 9.7 }}>• {laborPlan.items.length} M.O.</Typography> : null}
                      </Stack>
                    </Box>
                  </Stack>
                  <Typography fontWeight={900} color="#176047" whiteSpace="nowrap" sx={{ fontSize: { xs: 12.2, sm: 14 } }}>{currency.format(total)}</Typography>
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ p: { xs: 1.15, sm: 1.5 }, pt: 0 }}>
                <Divider sx={{ mb: 1.15 }} />

                <Stack gap={1.1}>
                  <Box component="section" aria-labelledby={`compositions-${project.id}`}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={.8} mb={.8}>
                      <Stack direction="row" alignItems="center" gap={.7}>
                        <LinkRoundedIcon sx={{ color: "#39725f", fontSize: 18 }} />
                        <Box>
                          <Typography id={`compositions-${project.id}`} fontWeight={850} color="#21483b" sx={{ fontSize: 12.8 }}>Composições vinculadas</Typography>
                          <Typography color="text.secondary" sx={{ fontSize: 9.4 }}>{lists.length ? `${lists.length} composições • ${currency.format(total)}` : "Nenhuma composição vinculada"}</Typography>
                        </Box>
                      </Stack>
                      <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => openEdit(project)}
                        sx={{ borderRadius: "8px", alignSelf: { xs: "flex-start", sm: "center" }, textTransform: "none", fontWeight: 760 }}>
                        Editar vínculos
                      </Button>
                    </Stack>

                    {lists.length ? <Stack gap={.65}>
                      {lists.map(composition => <CompositionPanel key={composition.id} composition={composition} />)}
                    </Stack> : <Box sx={{ py: 2, px: 1.2, border: "1px dashed #d8e4df", borderRadius: "10px", textAlign: "center" }}>
                      <Typography color="text.secondary" sx={{ fontSize: 11 }}>Use “Editar vínculos” para adicionar composições a esta obra.</Typography>
                    </Box>}
                  </Box>

                  <LaborOverview
                    project={project}
                    plan={laborPlan}
                    loading={Boolean(laborLoading[project.id])}
                    error={laborErrors[project.id]}
                  />

                  <Divider />
                  <Stack direction="row" alignItems="center" gap={.55} flexWrap="wrap">
                    <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => openEdit(project)}
                      sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 750 }}>Editar obra</Button>
                    <Button size="small" startIcon={<FileDownloadOutlinedIcon />} disabled={!lists.length} onClick={() => downloadCompositions(lists)}
                      sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 750 }}>Exportar composições</Button>
                    <Tooltip title="Excluir obra"><span><IconButton size="small" disabled={busy} onClick={() => void remove(project)} sx={{ ml: { xs: 0, sm: "auto" }, color: "#a54b4b" }}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton></span></Tooltip>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>;
          })}
        </Stack>}

      <Dialog open={formOpen} onClose={saving ? undefined : resetForm} fullWidth maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: { xs: "18px 18px 0 0", sm: "12px" }, m: { xs: 0, sm: 2 }, position: { xs: "fixed", sm: "relative" }, bottom: { xs: 0, sm: "auto" } } } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="overline" color="primary" fontWeight={850}>{editing ? "Editar planejamento" : "Novo planejamento"}</Typography>
          <Typography component="div" variant="h5" fontWeight={900}>{editing ? "Editar obra" : "Criar nova obra"}</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" variant="body2" mb={2.25}>Dê um nome à obra e escolha as composições que fazem parte dela. A mesma composição pode pertencer a várias obras.</Typography>
          <Stack gap={2}>
            <TextField autoFocus label="Nome da obra" placeholder="Ex.: Residencial Centro" value={name}
              onChange={event => setName(event.target.value)} slotProps={{ htmlInput: { maxLength: 80 } }} />
            <Autocomplete
              multiple
              options={compositions}
              value={selectedCompositions}
              getOptionLabel={option => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, selected) => setIds(selected.map(composition => composition.id))}
              noOptionsText="Nenhuma composição encontrada"
              limitTags={3}
              slotProps={{ listbox: { sx: { maxHeight: 260, overflowY: "auto" } } }}
              renderInput={params => <TextField {...params} label="Composições" placeholder={selectedCompositions.length ? "Buscar outra composição" : "Buscar e selecionar composições"} />}
              sx={{ "& .MuiChip-root": { bgcolor: "#eaf5f1", color: "#245342", borderRadius: "7px", fontWeight: 700 } }}
            />
            {!compositions.length && <Typography color="text.secondary" fontSize={13}>Você ainda não possui composições. Crie uma composição primeiro.</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={resetForm} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={() => void save()} disabled={saving || !name.trim()}
            startIcon={saving ? <CircularProgress color="inherit" size={16} /> : undefined} sx={{ borderRadius: "9px", px: 2.5 }}>
            {editing ? "Salvar alterações" : "Criar obra"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Container>;
}
