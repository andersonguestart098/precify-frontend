import { useEffect, useMemo, useState, type FormEvent } from "react";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  Alert, Avatar, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, InputAdornment, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography
} from "@mui/material";
import { useAccount, useSession } from "../auth/session";
import { createUser, listUsers, updateUserActive, type Account } from "../services/api";

type UserFilter = "all" | "active" | "inactive";

export default function ProfilePage() {
  const user = useAccount();
  const { signOut } = useSession();
  const [users, setUsers] = useState<Account[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(user.role === "ADMIN");
  const [userError, setUserError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [search, setSearch] = useState("");
  const [busyUserId, setBusyUserId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", avatarUrl: "", role: "USER" as Account["role"] });

  useEffect(() => {
    if (user.role !== "ADMIN") return;
    const controller = new AbortController();
    listUsers(controller.signal)
      .then(setUsers)
      .catch(error => { if (!controller.signal.aborted) setUserError(error instanceof Error ? error.message : "Não foi possível carregar os usuários."); })
      .finally(() => { if (!controller.signal.aborted) setLoadingUsers(false); });
    return () => controller.abort();
  }, [user.role]);

  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter(account => {
      const active = account.active !== false;
      if (filter === "active" && !active) return false;
      if (filter === "inactive" && active) return false;
      if (!term) return true;
      return `${account.name} ${account.email}`.toLowerCase().includes(term);
    });
  }, [users, filter, search]);

  const counts = useMemo(() => ({
    active: users.filter(account => account.active !== false).length,
    inactive: users.filter(account => account.active === false).length,
  }), [users]);

  const toggleActive = async (account: Account) => {
    if (account.id === user.id) return;
    const next = account.active === false;
    setBusyUserId(account.id); setUserError(""); setSuccess("");
    try {
      const saved = await updateUserActive(account.id, next);
      setUsers(current => current.map(item => item.id === saved.id ? saved : item));
      setSuccess(next ? `${account.name} foi reativado.` : `${account.name} foi inativado.`);
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Não foi possível alterar o status do usuário.");
    } finally { setBusyUserId(""); }
  };

  const submitCreate = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true); setUserError(""); setSuccess("");
    try {
      const created = await createUser({ ...form, avatarUrl: form.avatarUrl.trim() || undefined });
      setUsers(current => [...current, created]);
      setForm({ name: "", email: "", password: "", avatarUrl: "", role: "USER" });
      setCreateOpen(false);
      setSuccess(`Usuário ${created.name} criado com sucesso.`);
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Não foi possível criar o usuário.");
    } finally { setCreating(false); }
  };

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 3, md: 6 } }}>
    <Box sx={{ mb: { xs: 4, md: 5 } }}>
      <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.5 }}>Perfil</Typography>
      <Typography component="h1" sx={{ mt: .5, fontSize: { xs: 34, md: 48 }, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-.045em",
        background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Sua conta e sua equipe.
      </Typography>
    </Box>

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "300px minmax(0,1fr)" }, gap: { xs: 4, md: 7 }, alignItems: "start" }}>
      <Box>
        <Stack direction="row" alignItems="center" gap={1.75}>
          <Avatar src={user.avatarUrl || undefined} alt={user.name} sx={{ width: 68, height: 68, bgcolor: "#e9f3f0", color: "#183c30", border: "2px solid #cfe4dd", fontWeight: 800, fontSize: 24 }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box minWidth={0}>
            <Typography fontWeight={850} fontSize={19} noWrap>{user.name}</Typography>
            <Typography color="text.secondary" fontSize={13.5} sx={{ overflowWrap: "anywhere" }}>{user.email}</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 2.5, borderColor: "#e5ece9" }} />
        <Stack gap={1.5}>
          <Box>
            <Typography sx={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 1.2, color: "#84958f", fontWeight: 800 }}>Perfil de acesso</Typography>
            <Typography sx={{ mt: .4, fontSize: 14, fontWeight: 700, color: "#294d41" }}>{user.role === "ADMIN" ? "Administrador" : "Usuário"}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 1.2, color: "#84958f", fontWeight: 800 }}>Status</Typography>
            <Typography sx={{ mt: .4, fontSize: 14, fontWeight: 700, color: "#294d41" }}>Ativo</Typography>
          </Box>
        </Stack>
        <Button onClick={signOut} color="error" startIcon={<LogoutRoundedIcon />} sx={{ mt: 3, px: 0, justifyContent: "flex-start", textTransform: "none", fontWeight: 700 }}>Sair da conta</Button>
      </Box>

      {user.role === "ADMIN" ? <Box minWidth={0}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} gap={2}>
          <Box>
            <Typography sx={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.35, color: "#70867e", fontWeight: 850 }}>Administração</Typography>
            <Typography component="h2" sx={{ mt: .5, fontSize: { xs: 24, md: 30 }, fontWeight: 850, letterSpacing: "-.03em", color: "#183f33" }}>Usuários da conta</Typography>
            <Typography sx={{ mt: .5, maxWidth: 620, color: "#687b74", fontSize: 14.5, lineHeight: 1.65 }}>Crie acessos, consulte a equipe e inative usuários sem remover o histórico.</Typography>
          </Box>
          <Button variant="contained" startIcon={<PersonAddAltOutlinedIcon />} onClick={() => setCreateOpen(true)} sx={{ borderRadius: 999, px: 2.4, alignSelf: { xs: "stretch", sm: "auto" } }}>Novo usuário</Button>
        </Stack>

        {(userError || success) && <Stack mt={2} gap={1}>{userError && <Alert severity="error">{userError}</Alert>}{success && <Alert severity="success">{success}</Alert>}</Stack>}

        <Stack direction={{ xs: "column", md: "row" }} gap={1.25} mt={3} alignItems={{ md: "center" }}>
          <TextField size="small" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome ou e-mail" sx={{ flex: 1, minWidth: 0,
            "& .MuiOutlinedInput-root": { borderRadius: 999, bgcolor: "#fbfcfc" } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 19, color: "#6d837b" }} /></InputAdornment> } }} />
          <ToggleButtonGroup exclusive size="small" value={filter} onChange={(_, next: UserFilter | null) => next && setFilter(next)}
            sx={{ alignSelf: { xs: "stretch", md: "auto" }, "& .MuiToggleButton-root": { flex: { xs: 1, md: "initial" }, borderColor: "#dfe8e5", color: "#61756e", textTransform: "none", px: 1.5 }, "& .Mui-selected": { color: "#174a39 !important", bgcolor: "#e9f4f0 !important" } }}>
            <ToggleButton value="all">Todos ({users.length})</ToggleButton>
            <ToggleButton value="active">Ativos ({counts.active})</ToggleButton>
            <ToggleButton value="inactive">Inativos ({counts.inactive})</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Box sx={{ mt: 2.5, borderTop: "1px solid #e3ebe8", borderBottom: "1px solid #e3ebe8" }}>
          <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "minmax(0,1.7fr) 120px 110px 110px", gap: 2, px: 1, py: 1.2 }}>
            {['Usuário', 'Perfil', 'Status', 'Ação'].map(label => <Typography key={label} sx={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 1.1, color: "#8a9a95", fontWeight: 800 }}>{label}</Typography>)}
          </Box>
          {loadingUsers ? <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>Carregando usuários...</Typography> : visibleUsers.map((account, index) => {
            const active = account.active !== false;
            const ownAccount = account.id === user.id;
            return <Box key={account.id} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr auto", md: "minmax(0,1.7fr) 120px 110px 110px" }, gap: { xs: 1.5, md: 2 }, alignItems: "center", px: 1, py: 1.65, borderTop: index || { xs: 0, md: 1 } ? "1px solid #edf1ef" : 0 }}>
              <Stack direction="row" gap={1.25} alignItems="center" minWidth={0}>
                <Avatar src={account.avatarUrl || undefined} sx={{ width: 38, height: 38, bgcolor: "#edf5f2", color: "#214d3f", fontSize: 14 }}>{account.name.charAt(0).toUpperCase()}</Avatar>
                <Box minWidth={0}><Typography fontWeight={750} fontSize={14} noWrap>{account.name}{ownAccount ? " (você)" : ""}</Typography><Typography color="text.secondary" fontSize={12.5} noWrap>{account.email}</Typography></Box>
              </Stack>
              <Chip label={account.role === "ADMIN" ? "Administrador" : "Usuário"} size="small" variant="outlined" sx={{ display: { xs: "none", md: "inline-flex" }, justifySelf: "start", borderColor: "#d7e5e0", color: "#49675d" }} />
              <Chip label={active ? "Ativo" : "Inativo"} size="small" sx={{ gridColumn: { xs: 2, md: "auto" }, gridRow: { xs: 1, md: "auto" }, justifySelf: "end", bgcolor: active ? "#e9f5f0" : "#f3f3f3", color: active ? "#23644f" : "#7c8884", fontWeight: 700 }} />
              <Button size="small" disabled={ownAccount || busyUserId === account.id} color={active ? "inherit" : "primary"} onClick={() => void toggleActive(account)} sx={{ gridColumn: { xs: "1 / -1", md: "auto" }, justifySelf: { xs: "start", md: "end" }, textTransform: "none", fontWeight: 700, minWidth: 0, px: .5 }}>
                {busyUserId === account.id ? "Salvando..." : active ? "Inativar" : "Ativar"}
              </Button>
            </Box>;
          })}
          {!loadingUsers && !visibleUsers.length && <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>Nenhum usuário encontrado com esse filtro.</Typography>}
        </Box>
      </Box> : <Box>
        <Typography component="h2" sx={{ fontSize: 24, fontWeight: 850, color: "#183f33" }}>Minha conta</Typography>
        <Typography sx={{ mt: 1, maxWidth: 560, color: "#687b74", lineHeight: 1.75 }}>Seu acesso ao Precify é administrado pela equipe responsável pela conta. Para alterar permissões ou dados de acesso, fale com um administrador.</Typography>
      </Box>}
    </Box>

    <Dialog open={createOpen} onClose={creating ? undefined : () => setCreateOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
      <Box component="form" onSubmit={submitCreate}>
        <DialogTitle sx={{ fontWeight: 850, pb: 1 }}>Novo usuário</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" fontSize={14} mb={2.5}>Crie um acesso para um novo integrante da equipe.</Typography>
          <Stack gap={2}>
            <TextField label="Nome" required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} slotProps={{ htmlInput: { maxLength: 100 } }} />
            <TextField label="E-mail" type="email" required value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} />
            <TextField label="Senha inicial" type="password" autoComplete="new-password" required value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} helperText="Pelo menos 8 caracteres." slotProps={{ htmlInput: { minLength: 8, maxLength: 72 } }} />
            <TextField select label="Perfil de acesso" value={form.role} onChange={event => setForm(current => ({ ...current, role: event.target.value as Account["role"] }))}>
              <MenuItem value="USER">Usuário</MenuItem><MenuItem value="ADMIN">Administrador</MenuItem>
            </TextField>
            <TextField label="URL do avatar (opcional)" type="url" value={form.avatarUrl} onChange={event => setForm(current => ({ ...current, avatarUrl: event.target.value }))} slotProps={{ htmlInput: { maxLength: 2048 } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancelar</Button><Button type="submit" variant="contained" loading={creating}>Criar usuário</Button></DialogActions>
      </Box>
    </Dialog>
  </Container>;
}
