import { Box, Chip, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

const suggestions = [
  {
    icon: ConstructionOutlinedIcon,
    label: "Montar composição",
    description: "Crie e organize uma composição a partir dos materiais do catálogo.",
  },
  {
    icon: CompareArrowsOutlinedIcon,
    label: "Comparar produtos",
    description: "Compare características e encontre a melhor opção para a sua obra.",
  },
] as const;

export default function AiPage() {
  return <Box component="main" sx={{
    position: "relative",
    minHeight: { xs: "calc(100dvh - var(--header-height) - var(--bottom-nav-height))", md: "calc(100dvh - var(--header-height))" },
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    px: { xs: 2.2, sm: 3, md: 4 },
    pt: { xs: 5.5, sm: 6, md: 7.5, xl: 8.5 },
    pb: { xs: 4.5, md: 6, xl: 7 },
    color: "#fff",
    background: "radial-gradient(circle at 50% 22%,rgba(53,214,164,.20),transparent 18rem),radial-gradient(circle at 86% 72%,rgba(0,107,79,.18),transparent 24rem),linear-gradient(145deg,#0d2e27 0%,#153c33 45%,#172f2b 100%)",
    "&::before": {
      content: '""', position: "absolute", inset: 0, pointerEvents: "none",
      background: "linear-gradient(rgba(5,25,21,.18),rgba(5,25,21,.36)),radial-gradient(circle at 50% 24%,transparent 0 12%,rgba(112,235,194,.08) 12.2% 12.5%,transparent 12.7% 21%,rgba(112,235,194,.05) 21.2% 21.5%,transparent 21.7%)",
    },
    "&::after": {
      content: '""', position: "absolute", width: { xs: 360, md: 760 }, height: { xs: 360, md: 760 }, borderRadius: "50%",
      left: "50%", top: { xs: 54, md: -110 }, transform: "translateX(-50%)",
      border: "1px solid rgba(112,235,194,.09)", boxShadow: "0 0 0 90px rgba(112,235,194,.018),0 0 0 180px rgba(112,235,194,.012)",
      pointerEvents: "none",
    },
  }}>
    <Stack sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 980, mx: "auto", my: "auto" }} alignItems="center">
      <Box sx={{
        width: { xs: 78, md: 88, xl: 100 }, height: { xs: 78, md: 88, xl: 100 }, display: "grid", placeItems: "center",
        borderRadius: "50%", position: "relative", color: "#eafff8", mb: 1.4,
        background: "radial-gradient(circle at 35% 30%,#17694f,#0b3e31 72%)",
        boxShadow: "0 0 0 1px rgba(158,255,222,.30),0 0 24px rgba(74,229,178,.48),0 0 58px rgba(42,204,151,.30)",
        "&::before": {
          content: '""', position: "absolute", inset: -9, borderRadius: "50%",
          background: "conic-gradient(from 20deg,transparent,#5ee0b5,transparent 36%,#b9f4df 50%,transparent 66%,#39b98f,transparent)",
          filter: "blur(1px)", opacity: .8, zIndex: -1, animation: "aiHalo 11s linear infinite",
        },
        "@keyframes aiHalo": { to: { transform: "rotate(360deg)" } },
        "@media (prefers-reduced-motion: reduce)": { "&::before": { animation: "none" } },
      }}>
        <AutoAwesomeIcon sx={{ fontSize: { xs: 34, md: 38, xl: 44 }, filter: "drop-shadow(0 0 7px rgba(255,255,255,.42))" }} />
      </Box>

      <Chip label="Em breve" size="small" sx={{
        height: 22, mb: 1.6, bgcolor: "rgba(214,255,241,.95)", color: "#114537", fontWeight: 800,
        border: "1px solid rgba(255,255,255,.42)", boxShadow: "0 5px 16px rgba(0,0,0,.14)",
      }} />

      <Typography component="h1" textAlign="center" sx={{
        fontSize: { xs: 28, sm: 32, md: 32, xl: 40 }, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-.045em",
        textShadow: "0 4px 24px rgba(0,0,0,.22)",
      }}>
        Assistente IA do <Box component="span" sx={{ background: "linear-gradient(100deg,#cffff0,#59e4b5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Precify</Box>
      </Typography>

      <Typography textAlign="center" sx={{
        maxWidth: 620, mt: 1.1, color: "rgba(235,248,244,.72)", fontSize: { xs: 13.5, md: 13.5, xl: 15.5 }, lineHeight: 1.55,
      }}>
        Esta área será usada para transformar necessidades em ações dentro do catálogo do Precify.
      </Typography>

      <Paper elevation={0} sx={{
        width: "100%", maxWidth: 760, mt: { xs: 3, md: 3.2, xl: 3.6 }, p: { xs: .7, md: .8 }, borderRadius: 999,
        bgcolor: "rgba(255,255,255,.07)", border: "1px solid rgba(111,225,188,.30)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.06),0 12px 30px rgba(0,0,0,.12)", backdropFilter: "blur(14px)",
      }}>
        <TextField
          fullWidth
          disabled
          variant="standard"
          placeholder="Descreva o que você quer fazer..."
          slotProps={{
            input: {
              disableUnderline: true,
              endAdornment: <InputAdornment position="end">
                <Chip label="Em breve" size="small" sx={{
                  display: { xs: "none", sm: "inline-flex" }, mr: .5, height: 24,
                  bgcolor: "rgba(215,255,241,.12)", color: "rgba(235,255,248,.80)", border: "1px solid rgba(159,239,212,.18)", fontWeight: 700,
                }} />
                <IconButton disabled aria-label="Enviar mensagem" sx={{
                  width: 38, height: 38, color: "rgba(232,255,247,.48) !important",
                  bgcolor: "rgba(111,225,188,.08) !important",
                }}><SendRoundedIcon sx={{ fontSize: 18 }} /></IconButton>
              </InputAdornment>,
            },
          }}
          sx={{
            px: { xs: 1.1, md: 1.5 },
            "& .MuiInputBase-root": { minHeight: { xs: 42, md: 44 } },
            "& .MuiInputBase-input": { fontSize: { xs: 13, md: 13.5, xl: 14.5 } },
            "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "rgba(235,248,244,.68)" },
            "& input::placeholder": { color: "rgba(235,248,244,.68)", opacity: 1 },
          }}
        />
      </Paper>
      <Typography sx={{ mt: .8, color: "rgba(232,246,241,.48)", fontSize: { xs: 10.5, md: 11.5 } }}>
        O assistente conversacional será liberado em breve.
      </Typography>

      <Box sx={{
        width: "100%", mt: { xs: 3.2, md: 3.5, xl: 4 }, display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2,minmax(0,1fr))" }, gap: { xs: 1.5, md: 2.2 },
      }}>
        {suggestions.map(({ icon: Icon, label, description }) => <Paper
          key={label}
          aria-disabled="true"
          elevation={0}
          sx={{
            color: "inherit", p: { xs: 1.6, sm: 1.9, md: 2, xl: 2.4 }, borderRadius: { xs: 3, md: 3.5 },
            display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", alignItems: "center", gap: { xs: 1.4, md: 1.7 },
            bgcolor: "rgba(255,255,255,.055)", border: "1px solid rgba(102,220,181,.24)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.04),0 16px 34px rgba(0,0,0,.12)", backdropFilter: "blur(12px)",
            opacity: .76, cursor: "not-allowed", userSelect: "none",
          }}
        >
          <Box sx={{
            width: { xs: 50, md: 54, xl: 60 }, height: { xs: 50, md: 54, xl: 60 }, borderRadius: "50%", display: "grid", placeItems: "center",
            color: "#123e31", background: "linear-gradient(145deg,#eafff8,#bdf1df)",
            boxShadow: "0 0 0 1px rgba(255,255,255,.38),0 0 16px rgba(81,230,179,.25)",
          }}>
            <Icon sx={{ fontSize: { xs: 25, md: 27, xl: 30 } }} />
          </Box>
          <Box minWidth={0}>
            <Typography sx={{ fontSize: { xs: 16, md: 15.5, xl: 17.5 }, fontWeight: 850, letterSpacing: "-.02em" }}>{label}</Typography>
            <Typography sx={{ mt: .4, color: "rgba(236,248,244,.62)", fontSize: { xs: 12, md: 11.5, xl: 13 }, lineHeight: 1.4 }}>{description}</Typography>
          </Box>
          <Box sx={{
            width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", color: "rgba(223,255,244,.45)",
            bgcolor: "rgba(108,226,187,.08)", border: "1px solid rgba(151,244,213,.10)",
          }}>
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 15 }} />
          </Box>
        </Paper>)}
      </Box>

      <Stack direction="row" alignItems="center" gap={2} sx={{ width: "100%", mt: { xs: 3.5, md: 4.2 }, color: "rgba(232,246,241,.48)" }}>
        <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(232,246,241,.14)" }} />
        <Box component="img" src="/precify-logo-white.svg" alt="Precify" sx={{ width: { xs: 92, md: 108 }, opacity: .5 }} />
        <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(232,246,241,.14)" }} />
      </Stack>
    </Stack>
  </Box>;
}
