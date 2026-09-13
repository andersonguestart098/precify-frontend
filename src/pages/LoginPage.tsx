import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
  const [email, setEmail] = useState(() => localStorage.getItem("precify-remembered-email") ?? "");
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem("precify-remembered-email")));
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const destination = "/inicio";

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
    "--login-panel-width": "clamp(340px, 29vw, 480px)",
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
        content: '""', position: "absolute", width: 430, height: 430, borderRadius: "50%",
        left: -245, bottom: -215, background: "rgba(255,255,255,.045)",
      },
      "&::after": {
        content: '""', position: "absolute", width: 245, height: 245, borderRadius: "50%",
        right: -128, top: -105, background: "rgba(255,255,255,.04)",
      },
    }}>
      <Stack sx={{ position: "absolute", top: "6%", left: { md: 30, xl: 38 }, right: { md: 80, xl: 110 }, color: "#fff" }} gap={1.5}>
        <Typography sx={{ fontSize: { md: 21, xl: 24 }, lineHeight: 1.08, fontWeight: 800, letterSpacing: "-.035em" }}>
          Construindo obras melhores, juntos.
        </Typography>
        <Box sx={{ width: 36, height: 2, bgcolor: "rgba(255,255,255,.72)", borderRadius: 99 }} />
        <Typography sx={{ maxWidth: 225, color: "rgba(255,255,255,.72)", fontSize: { md: 12, xl: 13 }, lineHeight: 1.5 }}>
          Mais eficiência na escolha de materiais para a sua obra.
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" gap={.8} sx={{ position: "absolute", left: { md: 30, xl: 38 }, bottom: { md: 24, xl: 32 }, color: "rgba(255,255,255,.72)" }}>
        <ShieldOutlinedIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontSize: { md: 10, xl: 11 } }}>Seus dados estão seguros conosco.</Typography>
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
      <Stack alignItems="center" gap={1.5}>
        <Box component="img" src="/precify-logo-green.svg" alt="Precify" sx={{ width: { md: 240, xl: 280 }, height: "auto" }} />
        <Typography textAlign="center" sx={{ color: "#71817b", fontSize: { md: 13, xl: 14 }, lineHeight: 1.35 }}>
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
      width: { xs: "100%", sm: 430, md: 350, xl: 382 },
      maxWidth: "100%",
      bgcolor: "rgba(255,255,255,.98)",
      border: "1px solid rgba(19,56,46,.08)",
      borderRadius: { xs: 3, md: 2.5, xl: 2.7 },
      boxShadow: "0 24px 65px rgba(17,54,43,.16),0 3px 12px rgba(17,54,43,.08)",
      px: { xs: 3, sm: 4, md: 2.75, xl: 3.25 },
      py: { xs: 3.5, sm: 4.4, md: 4.2, xl: 4.6 },
    }}>
      <Box component="img" src="/precify-logo-green.svg" alt="Precify" sx={{ display: { xs: "block", md: "none" }, width: 172, height: "auto", mb: 3 }} />
      <Typography color="text.secondary" sx={{ mb: { xs: 3, md: 1.8, xl: 2.2 }, fontSize: { xs: 14, md: 12, xl: 13 }, lineHeight: 1.48 }}>
        Acesse sua conta e continue encontrando os melhores materiais para a sua obra.
      </Typography>

      <Box component="form" onSubmit={submit}>
        <Stack gap={{ xs: 1.6, md: 1.05, xl: 1.25 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            required fullWidth placeholder="Seu e-mail" type="email" autoComplete="username"
            value={email} onChange={e => setEmail(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailOutlineIcon sx={{ color: "#6f817a", fontSize: { xs: 20, md: 18, xl: 19 } }} /></InputAdornment> } }}
            sx={{
              "& .MuiOutlinedInput-root": { height: { xs: 50, md: 41, xl: 44 }, borderRadius: 2.15, bgcolor: "#fbfcfc" },
              "& input": { fontSize: { xs: 14.5, md: 12.5, xl: 13.5 } },
            }}
          />
          <TextField
            required fullWidth placeholder="Sua senha" type={visible ? "text" : "password"} autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)}
            slotProps={{ input: {
              startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: "#6f817a", fontSize: { xs: 20, md: 18, xl: 19 } }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton aria-label={visible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setVisible(!visible)} edge="end" size="small">{visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment>,
            } }}
            sx={{
              "& .MuiOutlinedInput-root": { height: { xs: 50, md: 41, xl: 44 }, borderRadius: 2.15, bgcolor: "#fbfcfc" },
              "& input": { fontSize: { xs: 14.5, md: 12.5, xl: 13.5 } },
            }}
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} mt={.25} mb={{ xs: 2, md: 1.25, xl: 1.5 }}>
          <FormControlLabel
            sx={{ mr: 0, "& .MuiFormControlLabel-label": { lineHeight: 1.1 } }}
            control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} size="small" />}
            label={<Typography variant="body2" sx={{ fontSize: { xs: 12, md: 10.5, xl: 11 } }}>Lembrar e-mail</Typography>}
          />
          <Link component="button" type="button" underline="hover" onClick={() => setHelp(!help)} sx={{ fontWeight: 700, fontSize: { xs: 12, md: 10.5, xl: 11 } }}>
            Recuperar acesso
          </Link>
        </Stack>

        {help && <Alert severity="info" sx={{ mb: 1.3, py: { md: .1, xl: .25 }, fontSize: { md: 11, xl: 11.5 } }}>
          Solicite a recuperação do acesso ao administrador do sistema.
        </Alert>}

        <Button
          type="submit" fullWidth loading={busy} loadingPosition="end" endIcon={<ArrowForwardIcon />}
          sx={{
            height: { xs: 48, md: 40, xl: 43 }, borderRadius: 2.15, textTransform: "none",
            fontSize: { xs: 15, md: 12.5, xl: 13.5 }, color: "#fff", fontWeight: 800,
            background: "linear-gradient(100deg,#006b4f,#218567)", boxShadow: "0 12px 28px rgba(0,107,79,.22)",
            "&:hover": { background: "linear-gradient(100deg,#075c46,#18785d)", boxShadow: "0 14px 32px rgba(0,107,79,.28)" },
            "&.Mui-disabled": { color: "#fff", opacity: .7 },
          }}
        >
          Entrar
        </Button>
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="center" gap={.6} mt={{ xs: 2.6, md: 1.5, xl: 1.8 }} sx={{ color: "#87958f" }}>
        <ShieldOutlinedIcon sx={{ fontSize: { xs: 17, md: 15, xl: 16 } }} />
        <Typography sx={{ fontSize: { xs: 11.5, md: 10, xl: 10.5 } }}>Acesso restrito a usuários autorizados</Typography>
      </Stack>
    </Box>
  </Box>;
}
