import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Checkbox, Container, FormControlLabel, Paper, Stack, TextField, Typography } from "@mui/material";
import { deleteProject, listProjects, saveProject, listCompositions, type Project } from "../services/api";
import type { Composition } from "../domain/composition";
import { downloadCompositions } from "../domain/export";

export default function PlanningPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [name, setName] = useState(""); const [ids, setIds] = useState<string[]>([]); const [editing, setEditing] = useState<string>();
  const [busy, setBusy] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; Promise.all([listProjects(), listCompositions()]).then(([p, c]) => { if (active) { setProjects(p); setCompositions(c); } }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setBusy(false); }); return () => { active = false; }; }, []);
  const save = async () => {
    setBusy(true); setError("");
    try { const result = await saveProject({ name: name.trim(), compositionIds: ids }, editing); setProjects(p => [...p.filter(x => x.id !== result.id), result]); setName(""); setIds([]); setEditing(undefined); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar."); } finally { setBusy(false); }
  };
  const remove = async (project: Project) => {
    if (!window.confirm(`Excluir a obra ${project.name}? As composições serão mantidas.`)) return;
    setBusy(true); try { await deleteProject(project.id); setProjects(p => p.filter(x => x.id !== project.id)); if (editing === project.id) { setEditing(undefined); setName(""); setIds([]); } } catch (e) { setError(e instanceof Error ? e.message : "Falha ao excluir."); } finally { setBusy(false); }
  };
  return <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h4" component="h1" fontWeight={800}>Minhas obras</Typography>
    <Typography color="text.secondary" mb={3}>Agrupe suas composições por projeto e acompanhe o total estimado.</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    {busy && <Typography role="status">Carregando…</Typography>}
    <Paper variant="outlined" sx={{ p: 3, my: 2 }}>
      <Stack gap={2}><Typography variant="h6">{editing ? "Editar obra" : "Nova obra"}</Typography><TextField label="Nome da obra" value={name} onChange={e => setName(e.target.value)} slotProps={{ htmlInput: { maxLength: 80 } }} />
      <Box>{compositions.map(c => <FormControlLabel key={c.id} label={c.name} control={<Checkbox checked={ids.includes(c.id)} onChange={(_, checked) => setIds(v => checked ? [...v, c.id] : v.filter(id => id !== c.id))} />} />)}</Box>
      {!compositions.length && <Button component={Link} to="/composicoes">Criar uma composição</Button>}
      <Stack direction="row" gap={1}><Button disabled={busy || !name.trim()} variant="contained" onClick={() => void save()}>Salvar obra</Button>{editing && <Button onClick={() => { setEditing(undefined); setName(""); setIds([]); }}>Cancelar</Button>}</Stack></Stack>
    </Paper>
    {!busy && !projects.length && <Typography>Nenhuma obra salva ainda.</Typography>}
    <Stack gap={2}>{projects.map(project => {
      const lists = compositions.filter(c => project.compositionIds.includes(c.id));
      return <Paper key={project.id} variant="outlined" sx={{ p: 3 }}><Typography variant="h6">{project.name}</Typography><Typography color="primary" fontWeight={800}>{lists.reduce((s, c) => s + c.total, 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Typography>
      {lists.map(c => <Typography key={c.id} sx={{ pl: 2, py: .5 }}>{c.name} · {c.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Typography>)}
      <Stack direction="row" flexWrap="wrap"><Button onClick={() => { setEditing(project.id); setName(project.name); setIds(lists.map(c => c.id)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar</Button><Button disabled={!lists.length} onClick={() => downloadCompositions(lists)}>Exportar CSV</Button><Button disabled={busy} color="error" onClick={() => void remove(project)}>Excluir obra</Button></Stack></Paper>;
    })}</Stack>
  </Container>;
}
