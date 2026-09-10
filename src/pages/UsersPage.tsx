import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useEffect, useState, type FormEvent } from "react";
import { Alert, Avatar, Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { createUser, listUsers, updateUserAvatar, type Account } from "../services/api";
export default function UsersPage() {
  const [users, setUsers] = useState<Account[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", avatarUrl: "", role: "ADMIN" as Account["role"] });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  useEffect(() => { const c = new AbortController(); listUsers(c.signal).then(setUsers).catch(e => { if (!c.signal.aborted) setError(e.message); }); return () => c.abort(); }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setSuccess("");
    try { const user = await createUser(form); setUsers(current => [...current, user]); setForm({ name: "", email: "", password: "", avatarUrl: "", role: "ADMIN" }); setSuccess("Usuário criado com sucesso."); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível criar o usuário."); }
    finally { setBusy(false); }
  };
  return <Container maxWidth="md" component="main" sx={{ py: 4 }}><Typography component="h1" variant="h4" fontWeight={800} mb={3}>Usuários</Typography>
    <Paper component="form" onSubmit={submit} variant="outlined" sx={{ p: 3, borderRadius: 4 }}><Stack gap={2}>
      <Typography variant="h6">Criar usuário</Typography>
      {error && <Alert severity="error">{error}</Alert>}{success && <Alert severity="success">{success}</Alert>}
      <TextField label="Nome" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} inputProps={{ maxLength: 100 }} />
      <TextField label="E-mail" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <TextField label="Senha inicial" type="password" autoComplete="new-password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} inputProps={{ minLength: 8, maxLength: 72 }} helperText="Pelo menos 8 caracteres." />
      <TextField label="URL do avatar (Cloudinary)" type="url" value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} helperText="Opcional. Cole a URL HTTPS da imagem." inputProps={{ maxLength: 2048 }} />
      <Avatar src={form.avatarUrl || undefined} alt={form.name}>{form.name.charAt(0).toUpperCase()}</Avatar>
      <TextField select label="Perfil" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Account["role"] })}><MenuItem value="ADMIN">Administrador</MenuItem><MenuItem value="USER">Usuário</MenuItem></TextField>
      <Button type="submit" variant="contained" loading={busy} loadingPosition="start" startIcon={<PersonAddAltOutlinedIcon />}>Criar usuário</Button>
    </Stack></Paper>
    <Stack mt={3} gap={2}>{users.map(user => <UserAvatarEditor key={user.id} user={user} onSaved={saved => setUsers(current => current.map(u => u.id === saved.id ? saved : u))} />)}</Stack>
  </Container>;
}

function UserAvatarEditor({ user, onSaved }: { user: Account; onSaved: (user: Account) => void }) {
  const [url, setUrl] = useState(user.avatarUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  return <Paper variant="outlined" component="form" sx={{ p: 2, borderRadius: 3 }} onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError(""); setSuccess(false);
    try { const saved = await updateUserAvatar(user.id, url.trim()); onSaved(saved); setUrl(saved.avatarUrl ?? ""); setSuccess(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar a foto."); }
    finally { setBusy(false); }
  }}><Stack gap={2}>
    <Stack direction="row" gap={2} alignItems="center"><Avatar src={url || undefined} alt={user.name}>{user.name.charAt(0).toUpperCase()}</Avatar>
      <Box><Typography fontWeight={700}>{user.name}</Typography><Typography variant="body2" color="text.secondary">{user.email} · {user.role}</Typography></Box>
    </Stack>
    <TextField label={`URL do avatar de ${user.name}`} type="url" value={url} disabled={busy} onChange={e => { setUrl(e.target.value); setSuccess(false); }} inputProps={{ maxLength: 2048 }} helperText="Cole a URL HTTPS do Cloudinary. Deixe vazio para remover." />
    {error && <Alert severity="error">{error}</Alert>}
    {success && <Alert severity="success">Foto salva. Ao atualizar a página, a sessão carregará o avatar atualizado.</Alert>}
    <Button type="submit" variant="outlined" loading={busy} loadingPosition="start" startIcon={<SaveOutlinedIcon />} disabled={busy || url === (user.avatarUrl ?? "")}>Salvar foto</Button>
  </Stack></Paper>;
}
