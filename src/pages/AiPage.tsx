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
    px: { xs: 2.2, sm: 3, md: 3.5, xl: 4 },
    pt: { xs: 5.5, sm: 6, md: 6.5, xl: 8 },
    pb: { xs: 4.5, md: 5.5, xl: 7 },
    color: "#fff",
    background: "radial-gradient(circle at 50% 20%,rgba(137,242,207,.26),transparent 20rem),radial-gradient(circle at 86% 72%,rgba(85,199,160,.18),transparent 26rem),linear-gradient(145deg,#155141 0%,#1c5f4d 46%,#174b3f 100%)",
    "&::before": {
      content: '""', position: "absolute", inset: 0, pointerEvents: "none",
      background: "linear-gradient(rgba(255,255,255,.025),rgba(4,52,41,.10)),radial-gradient(circle at 50% 24%,transparent 0 12%,rgba(198,255,236,.11) 12.2% 12.5%,transparent 12.7% 21%,rgba(198,255,236,.065) 21.2% 21.5%,transparent 21.7%)",
    },
    "&::after": {
      content: '""', position: "absolute", width: { xs: 360, md: 700, xl: 760 }, height: { xs: 360, md: 700, xl: 760 }, borderRadius: "50%",
      left: "50%", top: { xs: 54, md: -95, xl: -110 }, transform: "translateX(-50%)",
      border: "1px solid rgba(198,255,236,.12)", boxShadow: "0 0 0 90px rgba(198,255,236,.025),0 0 0 180px rgba(198,255,236,.016)",
      pointerEvents: "none",
    },
  }}>
    <Stack sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: { md: 900, xl: 980 }, mx: "auto", my: "auto" }} alignItems="center">
      <Box sx={{
        width: { xs: 78, md: 82, xl: 100 }, height: { xs: 78, md: 82, xl: 100 }, display: "grid", placeItems: "center",
        borderRadius: "50%", position: "relative", color: "#eafff8", mb: { xs: 1.4, md: 1.1, xl: 1.4 },
        background: "radial-gradient(circle at 35% 30%,#218665,#0b4f3d 72%)",
        boxShadow: "0 0 0 1px rgba(211,255,240,.34),0 0 24px rgba(103,237,192,.44),0 0 58px rgba(77,217,170,.25)",
        "&::before": {
          content: '""', position: "absolute", inset: -9, borderRadius: "50%",
          background: "conic-gradient(from 20deg,transparent,#7be8c4,transparent 36%,#d8f8ed 50%,transparent 66%,#52c79d,transparent)",
          filter: "blur(1px)", opacity: .8, zIndex: -1, animation: "aiHalo 11s linear infinite",
        },
        "@keyframes aiHalo": { to: { transform: "rotate(360deg)" } },
        "@media (prefers-reduced-motion: reduce)": { "&::before": { animation: "none" } },
      }}>
        <AutoAwesomeIcon sx={{ fontSize: { xs: 34, md: 36, xl: 44 }, filter: "drop-shadow(0 0 7px rgba(255,255,255,.42))" }} />
      </Box>

      <Chip label="Em breve" size="small" sx={{
        height: { xs: 22, md: 20, xl: 22 }, mb: { xs: 1.6, md: 1.25, xl: 1.6 }, bgcolor: "rgba(229,255,246,.96)", color: "#114537", fontWeight: 800,
        border: "1px solid rgba(255,255,255,.48)", boxShadow: "0 5px 16px rgba(0,0,0,.10)",
      }} />

      <Typography component="h1" textAlign="center" sx={{
        fontSize: { xs: 28, sm: 32, md: 30, xl: 40 }, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-.045em",
        textShadow: "0 4px 24px rgba(0,0,0,.15)",
      }}>
        Assistente IA do <Box component="span" sx={{ background: "linear-gradient(100deg,#ddfff3,#78e7c2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Precify</Box>
      </Typography>

      <Typography textAlign="center" sx={{
        maxWidth: 620, mt: { xs: 1.1, md: .9, xl: 1.1 }, color: "rgba(245,255,252,.78)", fontSize: { xs: 13.5, md: 12.8, xl: 15.5 }, lineHeight: 1.55,
      }}>
        Esta área será usada para transformar necessidades em ações dentro do catálogo do Precify.
      </Typography>

      <Paper elevation={0} sx={{
        width: "100%", maxWidth: { md: 700, xl: 760 }, mt: { xs: 3, md: 2.7, xl: 3.6 }, p: { xs: .7, md: .65, xl: .8 }, borderRadius: 999,
        bgcolor: "rgba(255,255,255,.105)", border: "1px solid rgba(196,255,235,.34)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.09),0 12px 30px rgba(0,0,0,.09)", backdropFilter: "blur(16px)",
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
                  display: { xs: "none", sm: "inline-flex" }, mr: .5, height: { md: 22, xl: 24 },
                  bgcolor: "rgba(229,255,246,.14)", color: "rgba(247,255,252,.86)", border: "1px solid rgba(209,255,240,.20)", fontWeight: 700,
                }} />
                <IconButton disabled aria-label="Enviar mensagem" sx={{
                  width: { xs: 38, md: 34, xl: 38 }, height: { xs: 38, md: 34, xl: 38 }, color: "rgba(244,255,251,.52) !important",
                  bgcolor: "rgba(223,255,245,.11) !important",
                }}><SendRoundedIcon sx={{ fontSize: { md: 16, xl: 18 } }} /></IconButton>
              </InputAdornment>,
            },
          }}
          sx={{
            px: { xs: 1.1, md: 1.35, xl: 1.5 },
            "& .MuiInputBase-root": { minHeight: { xs: 42, md: 40, xl: 44 } },
            "& .MuiInputBase-input": { fontSize: { xs: 13, md: 12.5, xl: 14.5 } },
            "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "rgba(247,255,252,.74)" },
            "& input::placeholder": { color: "rgba(247,255,252,.74)", opacity: 1 },
          }}
        />
      </Paper>
      <Typography sx={{ mt: .8, color: "rgba(244,255,251,.58)", fontSize: { xs: 10.5, md: 10.5, xl: 11.5 } }}>
        O assistente conversacional será liberado em breve.
      </Typography>

      <Box sx={{
        width: "100%", mt: { xs: 3.2, md: 2.9, xl: 4 }, display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2,minmax(0,1fr))" }, gap: { xs: 1.5, md: 1.8, xl: 2.2 },
      }}>
        {suggestions.map(({ icon: Icon, label, description }) => <Paper
          key={label}
          aria-disabled="true"
          elevation={0}
          sx={{
            color: "inherit", p: { xs: 1.6, sm: 1.9, md: 1.7, xl: 2.4 }, borderRadius: { xs: 3, md: 3.2, xl: 3.5 },
            display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", alignItems: "center", gap: { xs: 1.4, md: 1.5, xl: 1.7 },
            bgcolor: "rgba(255,255,255,.085)", border: "1px solid rgba(197,255,236,.28)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.07),0 16px 34px rgba(0,0,0,.09)", backdropFilter: "blur(14px)",
            opacity: .82, cursor: "not-allowed", userSelect: "none",
          }}
        >
          <Box sx={{
            width: { xs: 50, md: 48, xl: 60 }, height: { xs: 50, md: 48, xl: 60 }, borderRadius: "50%", display: "grid", placeItems: "center",
            color: "#123e31", background: "linear-gradient(145deg,#f1fff9,#c9f4e5)",
            boxShadow: "0 0 0 1px rgba(255,255,255,.42),0 0 16px rgba(108,236,194,.24)",
          }}>
            <Icon sx={{ fontSize: { xs: 25, md: 24, xl: 30 } }} />
          </Box>
          <Box minWidth={0}>
            <Typography sx={{ fontSize: { xs: 16, md: 14.5, xl: 17.5 }, fontWeight: 850, letterSpacing: "-.02em" }}>{label}</Typography>
            <Typography sx={{ mt: .35, color: "rgba(247,255,252,.70)", fontSize: { xs: 12, md: 10.8, xl: 13 }, lineHeight: 1.4 }}>{description}</Typography>
          </Box>
          <Box sx={{
            width: { xs: 34, md: 31, xl: 34 }, height: { xs: 34, md: 31, xl: 34 }, borderRadius: "50%", display: "grid", placeItems: "center", color: "rgba(235,255,248,.52)",
            bgcolor: "rgba(225,255,245,.10)", border: "1px solid rgba(218,255,243,.14)",
          }}>
            <ArrowForwardIosRoundedIcon sx={{ fontSize: { md: 14, xl: 15 } }} />
          </Box>
        </Paper>)}
      </Box>

      <Stack direction="row" alignItems="center" gap={2} sx={{ width: "100%", mt: { xs: 3.5, md: 3.4, xl: 4.2 }, color: "rgba(245,255,252,.58)" }}>
        <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(235,255,248,.18)" }} />
        <Box component="img" src="/precify-logo-white.svg" alt="Precify" sx={{ width: { xs: 92, md: 96, xl: 108 }, opacity: .62 }} />
        <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(235,255,248,.18)" }} />
      </Stack>
    </Stack>
  </Box>;
}
