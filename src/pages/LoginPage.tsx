import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Checkbox, Container, FormControlLabel, IconButton, InputAdornment, Link, Stack, TextField, Typography } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { authenticate } from "../services/api";
import { useSession } from "../auth/session";
export default function LoginPage() {
  const session = useSession(); const navigate = useNavigate(); const location = useLocation();
  const [email, setEmail] = useState(() => localStorage.getItem("precify-remembered-email") ?? "");
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem("precify-remembered-email")));
  const [password, setPassword] = useState(""); const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [help, setHelp] = useState(false);
  const from = (location.state as { from?: string } | null)?.from;
  const destination = from?.startsWith("/") && !from.startsWith("//") && !from.startsWith("/login") ? from : "/busca";
  if (session.user) return <Navigate to={destination} replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError("");
    try {
      const result = await authenticate(email.trim(), password);
      if (remember) localStorage.setItem("precify-remembered-email", email.trim());
      else localStorage.removeItem("precify-remembered-email");
      session.signIn(result); setPassword(""); navigate(destination, { replace: true });
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível entrar. Tente novamente."); }
    finally { setBusy(false); }
  };
  return <Box component="main" sx={{ minHeight: "100dvh", display: "grid", alignItems: "center",
    background: "radial-gradient(ellipse at 55% 54%, rgba(0,107,79,.055), transparent 65%), #f7f9f8", py: { xs: 4, md: 2.25, xl: 4 } }}>
    <Container maxWidth="sm" sx={{ px: { xs: 3, sm: 5, md: 3.5, xl: 5 }, maxWidth: { md: "410px !important", xl: "480px !important" } }}>
      <Box component="img" src="/precify-signature.png" alt="Precify" sx={{ display: "block", width: { xs: 220, sm: 260, md: 205, xl: 260 }, maxWidth: "100%", height: "auto", mb: { xs: 3, md: 2, xl: 3 }, mixBlendMode: "multiply" }} />
      <Typography component="h1" variant="h4" sx={{ fontSize: { xs: 24, sm: 27, md: 23, xl: 27 }, fontWeight: 800, letterSpacing: "-.045em", mb: .6 }}>Bem-vindo de volta</Typography>
      <Typography color="text.secondary" sx={{ fontSize: { xs: 14.5, md: 13.5, xl: 14.5 }, lineHeight: 1.55, mb: { xs: 3, md: 2, xl: 3 } }}>Entre com suas credenciais para acessar o sistema.</Typography>
      <Box component="form" onSubmit={submit}>
        <Stack gap={{ xs: 2, md: 1.35, xl: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField required fullWidth label="E-mail" type="email" autoComplete="username" placeholder="seu.email@empresa.com.br"
            value={email} onChange={e => setEmail(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailOutlineIcon sx={{ color: "#93a0ae", fontSize: { md: 20, xl: 24 } }} /></InputAdornment> } }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: { xs: 10, md: 8, xl: 10 }, height: { xs: 50, md: 44, xl: 50 } }, "& input": { fontSize: { xs: 15, md: 13.5, xl: 15 } }, "& .MuiInputLabel-root": { fontSize: { md: 13.5, xl: 16 } } }} />
          <TextField required fullWidth label="Senha" type={visible ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha"
            value={password} onChange={e => setPassword(e.target.value)}
            slotProps={{ input: {
              startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: "#93a0ae", fontSize: { md: 20, xl: 24 } }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton aria-label={visible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setVisible(!visible)} edge="end" size="small">{visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment>,
            } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: { xs: 10, md: 8, xl: 10 }, height: { xs: 50, md: 44, xl: 50 } }, "& input": { fontSize: { xs: 15, md: 13.5, xl: 15 } }, "& .MuiInputLabel-root": { fontSize: { md: 13.5, xl: 16 } } }} />
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} mt={.2} mb={{ xs: 2, md: 1.35, xl: 2 }} flexWrap="wrap">
          <FormControlLabel sx={{ mr: 0, "& .MuiFormControlLabel-label": { lineHeight: 1.1 } }} control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} size="small" />}
            label={<Typography variant="body2" sx={{ fontSize: { md: 12, xl: 14 } }}>Lembrar meu e-mail</Typography>} />
          <Link component="button" type="button" underline="hover" onClick={() => setHelp(!help)} sx={{ fontWeight: 700, fontSize: { md: 12, xl: 13 } }}>Esqueci minha senha</Link>
        </Stack>
        {help && <Alert severity="info" sx={{ mb: { xs: 2, md: 1.25, xl: 2 }, py: { md: .2, xl: .75 }, fontSize: { md: 12, xl: 14 } }}>Solicite a recuperação do acesso ao administrador do sistema.</Alert>}
        <Button type="submit" fullWidth size="large" loading={busy} loadingPosition="end" endIcon={<ArrowForwardIcon />}
          sx={{ height: { xs: 48, md: 43, xl: 48 }, borderRadius: { xs: 10, md: 8, xl: 10 }, textTransform: "none", fontSize: { xs: 16, md: 14, xl: 16 }, color: "#fff", fontWeight: 700,
            background: "linear-gradient(100deg,#006b4f,#218567)", boxShadow: "0 14px 32px rgba(0,107,79,.23)",
            "&:hover": { background: "linear-gradient(100deg,#13382e,#006b4f)" }, "&.Mui-disabled": { color: "#fff", opacity: .7 } }}>
          Entrar
        </Button>
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="center" gap={1} mt={{ xs: 3, md: 2, xl: 3 }} sx={{ color: "#929eaa" }}>
        <ShieldOutlinedIcon sx={{ fontSize: { md: 18, xl: 20 } }} /><Typography variant="body2" sx={{ fontSize: { md: 11.5, xl: 14 } }}>Acesso restrito a usuários autorizados</Typography>
      </Stack>
    </Container>
  </Box>;
}
