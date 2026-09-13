import { Link as RouterLink } from "react-router-dom";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

const suggestions = [
  {
    icon: ConstructionOutlinedIcon,
    label: "Montar composição",
    description: "Crie e organize uma composição a partir dos materiais do catálogo.",
    to: "/composicoes",
  },
  {
    icon: CompareArrowsOutlinedIcon,
    label: "Comparar produtos",
    description: "Compare características e encontre a melhor opção para a sua obra.",
    to: "/comparar",
  },
] as const;

export default function AiPage() {
  return <Box component="main" sx={{
    position: "relative",
    minHeight: { xs: "calc(100dvh - var(--header-height) - var(--bottom-nav-height))", md: "calc(100dvh - var(--header-height))" },
    overflow: "hidden",
    px: { xs: 2.2, sm: 3, md: 4 },
    py: { xs: 3.5, md: 5, xl: 6 },
    color: "#fff",
    background: "radial-gradient(circle at 50% 22%,rgba(53,214,164,.20),transparent 18rem),radial-gradient(circle at 86% 72%,rgba(0,107,79,.18),transparent 24rem),linear-gradient(145deg,#0d2e27 0%,#153c33 45%,#172f2b 100%)",
    "&::before": {
      content: '""', position: "absolute", inset: 0, pointerEvents: "none",
      background: "linear-gradient(rgba(5,25,21,.18),rgba(5,25,21,.36)),radial-gradient(circle at 50% 24%,transparent 0 12%,rgba(112,235,194,.08) 12.2% 12.5%,transparent 12.7% 21%,rgba(112,235,194,.05) 21.2% 21.5%,transparent 21.7%)",
    },
    "&::after": {
      content: '""', position: "absolute", width: { xs: 360, md: 760 }, height: { xs: 360, md: 760 }, borderRadius: "50%",
      left: "50%", top: { xs: 32, md: -155 }, transform: "translateX(-50%)",
      border: "1px solid rgba(112,235,194,.09)", boxShadow: "0 0 0 90px rgba(112,235,194,.018),0 0 0 180px rgba(112,235,194,.012)",
      pointerEvents: "none",
    },
  }}>
    <Stack sx={{ position: "relative", zIndex: 1, maxWidth: 1040, mx: "auto" }} alignItems="center">
      <Box sx={{
        width: { xs: 78, md: 92, xl: 106 }, height: { xs: 78, md: 92, xl: 106 }, display: "grid", placeItems: "center",
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
        <AutoAwesomeIcon sx={{ fontSize: { xs: 34, md: 40, xl: 46 }, filter: "drop-shadow(0 0 7px rgba(255,255,255,.42))" }} />
      </Box>

      <Chip label="Em breve" size="small" sx={{
        height: 22, mb: 1.6, bgcolor: "rgba(214,255,241,.95)", color: "#114537", fontWeight: 800,
        border: "1px solid rgba(255,255,255,.42)", boxShadow: "0 5px 16px rgba(0,0,0,.14)",
      }} />

      <Typography component="h1" textAlign="center" sx={{
        fontSize: { xs: 28, sm: 32, md: 34, xl: 42 }, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-.045em",
        textShadow: "0 4px 24px rgba(0,0,0,.22)",
      }}>
        Assistente IA do <Box component="span" sx={{ background: "linear-gradient(100deg,#cffff0,#59e4b5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Precify</Box>
      </Typography>

      <Typography textAlign="center" sx={{
        maxWidth: 620, mt: 1.2, color: "rgba(235,248,244,.72)", fontSize: { xs: 13.5, md: 14, xl: 16 }, lineHeight: 1.55,
      }}>
        Esta área será usada para transformar necessidades em ações dentro do catálogo do Precify.
      </Typography>

      <Box sx={{
        width: "100%", mt: { xs: 4, md: 4.5, xl: 5.5 }, display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2,minmax(0,1fr))" }, gap: { xs: 1.5, md: 2.2 },
      }}>
        {suggestions.map(({ icon: Icon, label, description, to }) => <Paper
          key={label}
          component={RouterLink}
          to={to}
          elevation={0}
          sx={{
            textDecoration: "none", color: "inherit", p: { xs: 1.6, sm: 1.9, md: 2.2, xl: 2.6 }, borderRadius: { xs: 3, md: 3.5 },
            display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", alignItems: "center", gap: { xs: 1.4, md: 1.8 },
            bgcolor: "rgba(255,255,255,.065)", border: "1px solid rgba(102,220,181,.34)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.05),0 18px 38px rgba(0,0,0,.14)", backdropFilter: "blur(12px)",
            transition: "transform 180ms ease,border-color 180ms ease,background 180ms ease,box-shadow 180ms ease",
            "&:hover": { transform: "translateY(-2px)", bgcolor: "rgba(255,255,255,.09)", borderColor: "rgba(114,236,196,.66)", boxShadow: "0 20px 42px rgba(0,0,0,.19),0 0 28px rgba(58,207,157,.10)" },
          }}
        >
          <Box sx={{
            width: { xs: 50, md: 58, xl: 64 }, height: { xs: 50, md: 58, xl: 64 }, borderRadius: "50%", display: "grid", placeItems: "center",
            color: "#123e31", background: "linear-gradient(145deg,#eafff8,#bdf1df)",
            boxShadow: "0 0 0 1px rgba(255,255,255,.45),0 0 20px rgba(81,230,179,.36)",
          }}>
            <Icon sx={{ fontSize: { xs: 25, md: 29, xl: 31 } }} />
          </Box>
          <Box minWidth={0}>
            <Typography sx={{ fontSize: { xs: 16, md: 16, xl: 18 }, fontWeight: 850, letterSpacing: "-.02em" }}>{label}</Typography>
            <Typography sx={{ mt: .4, color: "rgba(236,248,244,.68)", fontSize: { xs: 12, md: 12, xl: 13.5 }, lineHeight: 1.4 }}>{description}</Typography>
          </Box>
          <Box sx={{
            width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", color: "#dffff4",
            bgcolor: "rgba(108,226,187,.14)", border: "1px solid rgba(151,244,213,.14)",
          }}>
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 17 }} />
          </Box>
        </Paper>)}
      </Box>

      <Stack direction="row" alignItems="center" gap={2} sx={{ width: "100%", mt: { xs: 4, md: 5 }, color: "rgba(232,246,241,.48)" }}>
        <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(232,246,241,.14)" }} />
        <Box component="img" src="/precify-logo-white.svg" alt="Precify" sx={{ width: { xs: 92, md: 108 }, opacity: .5 }} />
        <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(232,246,241,.14)" }} />
      </Stack>
    </Stack>
  </Box>;
}
