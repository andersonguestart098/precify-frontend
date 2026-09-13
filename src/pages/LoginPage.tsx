import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Checkbox, FormControlLabel, IconButton, InputAdornment, Link,
  Stack, TextField, Typography,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { authenticate } from "../services/api";
import { useSession } from "../auth/session";

export default function LoginPage() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(() => localStorage.getItem("precify-remembered-email") ?? "");
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem("precify-remembered-email")));
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const from = (location.state as { from?: string } | null)?.from;
  const destination = from?.startsWith("/") && !from.startsWith("//") && !from.startsWith("/login") ? from : "/busca";

  if (session.user) return <Navigate to={destination} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await authenticate(email.trim(), password);
      if (remember) localStorage.setItem("precify-remembered-email", email.trim());
      else localStorage.removeItem("precify-remembered-email");
      session.signIn(result);
      setPassword("");
      navigate(destination, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return <Box component="main" sx={{
    "--login-panel-width": "clamp(360px, 31vw, 520px)",
    minHeight: "100dvh",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: { xs: "center", md: "flex-start" },
    px: { xs: 2, sm: 3, md: 0 },
    py: { xs: 3, md: 0 },
    bgcolor: "#f7faf9",
    background: "radial-gradient(circle at 78% 50%,rgba(0,107,79,.06),transparent 31rem),linear-gradient(135deg,#fbfdfc,#f5f9f7)",
  }}>
    <Box aria-hidden sx={{
      display: { xs: "none", md: "block" },
      position: "absolute",
      inset: "0 auto 0 0",
      width: "var(--login-panel-width)",
      overflow: "hidden",
      background: "linear-gradient(150deg,#006b4f 0%,#08795a 48%,#004d3a 100%)",
      "&::before": {
        content: '""', position: "absolute", width: 520, height: 520, borderRadius: "50%",
        left: -310, bottom: -250, border: "72px solid rgba(255,255,255,.045)",
      },
      "&::after": {
        content: '""', position: "absolute", width: 300, height: 300, borderRadius: "50%",
        right: -190, top: -120, border: "54px solid rgba(255,255,255,.035)",
      },
    }}>
      <Stack sx={{ position: "absolute", top: "14%", left: { md: 34, xl: 58 }, right: 120, color: "#fff" }} gap={2.2}>
        <Typography sx={{ fontSize: { md: 25, xl: 31 }, lineHeight: 1.08, fontWeight: 800, letterSpacing: "-.035em" }}>
          Construindo obras melhores, juntos.
        </Typography>
        <Box sx={{ width: 42, height: 2, bgcolor: "rgba(255,255,255,.72)", borderRadius: 99 }} />
        <Typography sx={{ maxWidth: 240, color: "rgba(255,255,255,.72)", fontSize: { md: 13, xl: 15 }, lineHeight: 1.55 }}>
          Mais eficiência na escolha de materiais para a sua obra.
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" gap={1} sx={{ position: "absolute", left: { md: 34, xl: 58 }, bottom: { md: 28, xl: 44 }, color: "rgba(255,255,255,.72)" }}>
        <ShieldOutlinedIcon sx={{ fontSize: 20 }} />
        <Typography sx={{ fontSize: { md: 10.5, xl: 12 } }}>Seus dados estão seguros conosco.</Typography>
      </Stack>
    </Box>

    <Box sx={{
      display: { xs: "none", md: "flex" },
      position: "absolute",
      left: "var(--login-panel-width)",
      right: 0,
      insetBlock: 0,
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
    }}>
      <Stack alignItems="center" gap={2}>
        <Box component="img" src="/precify-logo-green.svg" alt="Precify" sx={{ width: { md: 280, xl: 350 }, height: "auto" }} />
        <Typography textAlign="center" sx={{ color: "#71817b", fontSize: { md: 15, xl: 18 }, lineHeight: 1.35 }}>
          Inteligência em materiais<br />para decisões melhores.
        </Typography>
      </Stack>
    </Box>

    <Box sx={{
      position: { xs: "relative", md: "absolute" },
      zIndex: 2,
      left: { md: "var(--login-panel-width)" },
      top: { md: "50%" },
      transform: { md: "translate(-50%,-50%)" },
      width: { xs: "100%", sm: 430, md: 382, xl: 430 },
      maxWidth: "100%",
      bgcolor: "rgba(255,255,255,.98)",
      border: "1px solid rgba(19,56,46,.08)",
      borderRadius: { xs: 4, md: 3.5, xl: 4 },
      boxShadow: "0 24px 65px rgba(17,54,43,.16),0 3px 12px rgba(17,54,43,.08)",
      p: { xs: 3, sm: 4, md: 3.25, xl: 4 },
    }}>
      <Box component="img" src="/precify-logo-green.svg" alt="Precify" sx={{ display: { xs: "block", md: "none" }, width: 172, height: "auto", mb: 3 }} />
      <Typography component="h1" sx={{ fontSize: { xs: 26, md: 25, xl: 28 }, fontWeight: 850, letterSpacing: "-.035em", color: "#13382e" }}>
        Entrar no Precify
      </Typography>
      <Typography color="text.secondary" sx={{ mt: .8, mb: { xs: 3, md: 2.4, xl: 3 }, fontSize: { xs: 14, md: 13, xl: 14 }, lineHeight: 1.5 }}>
        Acesse sua conta e continue encontrando os melhores materiais para a sua obra.
      </Typography>

      <Box component="form" onSubmit={submit}>
        <Stack gap={{ xs: 1.6, md: 1.25, xl: 1.6 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            required fullWidth placeholder="Seu e-mail" type="email" autoComplete="username"
            value={email} onChange={e => setEmail(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailOutlineIcon sx={{ color: "#6f817a", fontSize: 20 }} /></InputAdornment> } }}
            sx={{
              "& .MuiOutlinedInput-root": { height: { xs: 50, md: 45, xl: 50 }, borderRadius: 2.3, bgcolor: "#fbfcfc" },
              "& input": { fontSize: { xs: 14.5, md: 13.5, xl: 14.5 } },
            }}
          />
          <TextField
            required fullWidth placeholder="Sua senha" type={visible ? "text" : "password"} autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)}
            slotProps={{ input: {
              startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: "#6f817a", fontSize: 20 }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton aria-label={visible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setVisible(!visible)} edge="end" size="small">{visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment>,
            } }}
            sx={{
              "& .MuiOutlinedInput-root": { height: { xs: 50, md: 45, xl: 50 }, borderRadius: 2.3, bgcolor: "#fbfcfc" },
              "& input": { fontSize: { xs: 14.5, md: 13.5, xl: 14.5 } },
            }}
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} mt={.4} mb={{ xs: 2, md: 1.45, xl: 2 }}>
          <FormControlLabel
            sx={{ mr: 0, "& .MuiFormControlLabel-label": { lineHeight: 1.1 } }}
            control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} size="small" />}
            label={<Typography variant="body2" sx={{ fontSize: { xs: 12, md: 11, xl: 12 } }}>Lembrar e-mail</Typography>}
          />
          <Link component="button" type="button" underline="hover" onClick={() => setHelp(!help)} sx={{ fontWeight: 700, fontSize: { xs: 12, md: 11, xl: 12 } }}>
            Recuperar acesso
          </Link>
        </Stack>

        {help && <Alert severity="info" sx={{ mb: 1.6, py: { md: .15, xl: .6 }, fontSize: { md: 11.5, xl: 13 } }}>
          Solicite a recuperação do acesso ao administrador do sistema.
        </Alert>}

        <Button
          type="submit" fullWidth loading={busy} loadingPosition="end" endIcon={<ArrowForwardIcon />}
          sx={{
            height: { xs: 48, md: 43, xl: 48 }, borderRadius: 2.3, textTransform: "none",
            fontSize: { xs: 15, md: 13.5, xl: 15 }, color: "#fff", fontWeight: 800,
            background: "linear-gradient(100deg,#006b4f,#218567)", boxShadow: "0 12px 28px rgba(0,107,79,.22)",
            "&:hover": { background: "linear-gradient(100deg,#075c46,#18785d)", boxShadow: "0 14px 32px rgba(0,107,79,.28)" },
            "&.Mui-disabled": { color: "#fff", opacity: .7 },
          }}
        >
          Entrar
        </Button>
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="center" gap={.7} mt={{ xs: 2.6, md: 2, xl: 2.6 }} sx={{ color: "#87958f" }}>
        <ShieldOutlinedIcon sx={{ fontSize: 17 }} />
        <Typography sx={{ fontSize: { xs: 11.5, md: 10.5, xl: 11.5 } }}>Acesso restrito a usuários autorizados</Typography>
      </Stack>
    </Box>
  </Box>;
}
