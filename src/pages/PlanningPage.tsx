import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, CircularProgress, Container,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, TextField, Tooltip, Typography
} from "@mui/material";
import { deleteProject, listProjects, saveProject, listCompositions, type Project } from "../services/api";
import type { Composition } from "../domain/composition";
import { downloadCompositions } from "../domain/export";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function PlanningPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
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
      .catch(error => { if (active) setError(error instanceof Error ? error.message : "Não foi possível carregar as obras."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  const selectedCompositions = useMemo(() => compositions.filter(composition => ids.includes(composition.id)), [compositions, ids]);
  const overallTotal = useMemo(() => projects.reduce((sum, project) => sum + compositions
    .filter(composition => project.compositionIds.includes(composition.id))
    .reduce((subtotal, composition) => subtotal + composition.total, 0), 0), [projects, compositions]);

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
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível salvar a obra.");
    } finally { setSaving(false); }
  };

  const remove = async (project: Project) => {
    if (!window.confirm(`Excluir a obra “${project.name}”? As composições serão mantidas.`)) return;
    setBusy(true); setError("");
    try {
      await deleteProject(project.id);
      setProjects(current => current.filter(item => item.id !== project.id));
      if (editing === project.id) resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível excluir a obra.");
    } finally { setBusy(false); }
  };

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 3, md: 5 } }}>
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} gap={2}>
        <Box>
          <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.4 }}>Planejamento</Typography>
          <Typography component="h1" sx={{ mt: .35, fontSize: { xs: 34, md: 44 }, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-.045em",
            background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Obras cadastradas
          </Typography>
          <Typography color="text.secondary" mt={.7}>Agrupe suas composições por projeto e acompanhe os custos de cada obra.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew}
          sx={{ borderRadius: 999, px: 2.6, alignSelf: { xs: "stretch", sm: "auto" }, textTransform: "none", fontWeight: 800 }}>
          Nova obra
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ mt: 3, px: { xs: 2, sm: 2.5 }, py: 2, borderRadius: 4, borderColor: "#dce9e5",
        background: "linear-gradient(135deg,#f9fcfb 0%,#eef8f4 60%,#f8fffc 100%)" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box sx={{ width: 42, height: 42, borderRadius: 3, display: "grid", placeItems: "center", color: "#fff",
              background: "linear-gradient(135deg,#185a44,#379e7b)" }}><HomeWorkOutlinedIcon /></Box>
            <Box>
              <Typography variant="caption" color="text.secondary">{projects.length} {projects.length === 1 ? "obra" : "obras"}</Typography>
              <Typography fontWeight={850}>Total planejado</Typography>
            </Box>
          </Stack>
          <Typography color="primary.dark" fontWeight={900} fontSize={{ xs: 20, sm: 26 }}>{currency.format(overallTotal)}</Typography>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {busy ? <Box minHeight={260} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box> : !projects.length ?
        <Box sx={{ mt: 4, py: 7, textAlign: "center", borderTop: "1px solid #e3ebe8", borderBottom: "1px solid #e3ebe8" }}>
          <HomeWorkOutlinedIcon sx={{ fontSize: 42, color: "#8ca199" }} />
          <Typography fontWeight={850} color="#284d40" mt={1.2}>Nenhuma obra cadastrada.</Typography>
          <Typography color="text.secondary" fontSize={14} mt={.5}>Crie uma obra e vincule uma ou várias composições a ela.</Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openNew} sx={{ mt: 2.2, borderRadius: 999, textTransform: "none" }}>Criar obra</Button>
        </Box> :
        <Stack gap={1.15} mt={3}>
          {projects.map(project => {
            const lists = compositions.filter(composition => project.compositionIds.includes(composition.id));
            const total = lists.reduce((sum, composition) => sum + composition.total, 0);
            return <Accordion key={project.id} disableGutters elevation={0}
              sx={{ border: "1px solid #dce9e5", borderRadius: "14px !important", overflow: "hidden", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 1.6, sm: 2.25 }, minHeight: 70, bgcolor: "#fbfdfc",
                "& .MuiAccordionSummary-content": { my: 1.1 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" minWidth={0} pr={1} gap={2}>
                  <Box minWidth={0}>
                    <Typography fontWeight={850} color="#21483b" noWrap>{project.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{lists.length} {lists.length === 1 ? "composição" : "composições"}</Typography>
                  </Box>
                  <Typography fontWeight={900} color="primary.dark" whiteSpace="nowrap">{currency.format(total)}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 1.5, sm: 2.25 }, pt: 0 }}>
                <Divider sx={{ mb: 1.25 }} />
                {lists.length ? <Stack divider={<Divider flexItem />}>
                  {lists.map(composition => <Stack key={composition.id} direction="row" alignItems="center" justifyContent="space-between" gap={2} py={1.15}>
                    <Box minWidth={0}>
                      <Typography fontWeight={750} color="#294d41" noWrap>{composition.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{composition.items.length} {composition.items.length === 1 ? "item" : "itens"}</Typography>
                    </Box>
                    <Typography fontWeight={800} color="primary.dark" whiteSpace="nowrap">{currency.format(composition.total)}</Typography>
                  </Stack>)}
                </Stack> : <Box py={2.5} textAlign="center">
                  <Typography color="text.secondary" fontSize={13.5}>Nenhuma composição vinculada a esta obra.</Typography>
                </Box>}
                <Divider sx={{ mt: 1.25 }} />
                <Stack direction="row" alignItems="center" gap={.5} pt={1.25}>
                  <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => openEdit(project)} sx={{ textTransform: "none", fontWeight: 750 }}>Editar</Button>
                  <Button size="small" startIcon={<FileDownloadOutlinedIcon />} disabled={!lists.length} onClick={() => downloadCompositions(lists)}
                    sx={{ textTransform: "none", fontWeight: 750 }}>Exportar CSV</Button>
                  <Tooltip title="Excluir obra"><span><IconButton size="small" disabled={busy} onClick={() => void remove(project)} sx={{ ml: "auto", color: "#a54b4b" }}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton></span></Tooltip>
                </Stack>
              </AccordionDetails>
            </Accordion>;
          })}
        </Stack>}

      <Dialog open={formOpen} onClose={saving ? undefined : resetForm} fullWidth maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: { xs: "24px 24px 0 0", sm: 4 }, m: { xs: 0, sm: 2 }, position: { xs: "fixed", sm: "relative" }, bottom: { xs: 0, sm: "auto" } } } }}>
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
              sx={{ "& .MuiChip-root": { bgcolor: "#eaf5f1", color: "#245342", borderRadius: 2, fontWeight: 700 } }}
            />
            {!compositions.length && <Typography color="text.secondary" fontSize={13}>Você ainda não possui composições. Crie uma composição primeiro.</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={resetForm} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={() => void save()} disabled={saving || !name.trim()}
            startIcon={saving ? <CircularProgress color="inherit" size={16} /> : undefined} sx={{ borderRadius: 999, px: 2.5 }}>
            {editing ? "Salvar alterações" : "Criar obra"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Container>;
}
