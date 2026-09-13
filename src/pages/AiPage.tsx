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
    px: { xs: 2, sm: 2.5, md: 3, xl: 3.5 },
    pt: { xs: 4.5, sm: 5, md: 5.3, xl: 6.5 },
    pb: { xs: 3.5, md: 4.2, xl: 5.2 },
    color: "#fff",
    background: "linear-gradient(180deg,#111816 0%,#151d1a 52%,#101614 100%)",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: "radial-gradient(circle at 50% 27%,rgba(58,190,145,.11) 0%,rgba(58,190,145,.055) 18%,rgba(58,190,145,.018) 34%,transparent 58%)",
    },
  }}>
    <Stack sx={{
      position: "relative",
      zIndex: 1,
      width: "100%",
      maxWidth: { xs: 520, md: 760, xl: 900 },
      mx: "auto",
      my: "auto",
    }} alignItems="center">
      <Box sx={{
        width: { xs: 64, md: 68, xl: 82 },
        height: { xs: 64, md: 68, xl: 82 },
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        position: "relative",
        color: "#eafff8",
        mb: { xs: 1, md: .9, xl: 1.1 },
        background: "radial-gradient(circle at 35% 30%,#218665,#0b4f3d 72%)",
        boxShadow: "0 0 0 1px rgba(211,255,240,.28),0 0 18px rgba(103,237,192,.32),0 0 42px rgba(77,217,170,.16)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -7,
          borderRadius: "50%",
          background: "conic-gradient(from 20deg,transparent,#7be8c4,transparent 36%,#d8f8ed 50%,transparent 66%,#52c79d,transparent)",
          filter: "blur(1px)",
          opacity: .72,
          zIndex: -1,
          animation: "aiHalo 11s linear infinite",
        },
        "@keyframes aiHalo": { to: { transform: "rotate(360deg)" } },
        "@media (prefers-reduced-motion: reduce)": { "&::before": { animation: "none" } },
      }}>
        <AutoAwesomeIcon sx={{ fontSize: { xs: 28, md: 29, xl: 34 }, filter: "drop-shadow(0 0 5px rgba(255,255,255,.36))" }} />
      </Box>

      <Chip label="Em breve" size="small" sx={{
        height: { xs: 20, md: 19, xl: 20 },
        mb: { xs: 1.2, md: 1, xl: 1.2 },
        bgcolor: "rgba(229,255,246,.95)",
        color: "#114537",
        fontWeight: 800,
        fontSize: { xs: 10, md: 9.5, xl: 10 },
        border: "1px solid rgba(255,255,255,.42)",
        boxShadow: "0 4px 12px rgba(0,0,0,.10)",
      }} />

      <Typography component="h1" textAlign="center" sx={{
        fontSize: { xs: 24, sm: 26, md: 26, xl: 32 },
        lineHeight: 1.06,
        fontWeight: 900,
        letterSpacing: "-.04em",
        textShadow: "0 3px 18px rgba(0,0,0,.14)",
      }}>
        Assistente IA do <Box component="span" sx={{ background: "linear-gradient(100deg,#ddfff3,#78e7c2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Precify</Box>
      </Typography>

      <Typography textAlign="center" sx={{
        maxWidth: 560,
        mt: { xs: .85, md: .7, xl: .85 },
        color: "rgba(245,255,252,.74)",
        fontSize: { xs: 12, md: 11.8, xl: 13.5 },
        lineHeight: 1.5,
      }}>
        Esta área será usada para transformar necessidades em ações dentro do catálogo do Precify.
      </Typography>

      <Paper elevation={0} sx={{
        width: "100%",
        maxWidth: { md: 620, xl: 680 },
        mt: { xs: 2.4, md: 2.2, xl: 2.8 },
        p: { xs: .5, md: .5, xl: .6 },
        borderRadius: 999,
        bgcolor: "rgba(255,255,255,.05)",
        border: "1px solid rgba(196,255,235,.16)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.045),0 10px 26px rgba(0,0,0,.14)",
        backdropFilter: "blur(14px)",
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
                  display: { xs: "none", sm: "inline-flex" },
                  mr: .4,
                  height: { md: 20, xl: 22 },
                  fontSize: { md: 9, xl: 10 },
                  bgcolor: "rgba(229,255,246,.09)",
                  color: "rgba(247,255,252,.80)",
                  border: "1px solid rgba(209,255,240,.14)",
                  fontWeight: 700,
                }} />
                <IconButton disabled aria-label="Enviar mensagem" sx={{
                  width: { xs: 32, md: 30, xl: 32 },
                  height: { xs: 32, md: 30, xl: 32 },
                  color: "rgba(244,255,251,.44) !important",
                  bgcolor: "rgba(223,255,245,.07) !important",
                }}>
                  <SendRoundedIcon sx={{ fontSize: { xs: 15, md: 14, xl: 15 } }} />
                </IconButton>
              </InputAdornment>,
            },
          }}
          sx={{
            px: { xs: .9, md: 1.1, xl: 1.2 },
            "& .MuiInputBase-root": { minHeight: { xs: 36, md: 36, xl: 38 } },
            "& .MuiInputBase-input": { fontSize: { xs: 11.5, md: 11.2, xl: 12.5 } },
            "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "rgba(247,255,252,.68)" },
            "& input::placeholder": { color: "rgba(247,255,252,.68)", opacity: 1 },
          }}
        />
      </Paper>

      <Typography sx={{ mt: .65, color: "rgba(244,255,251,.46)", fontSize: { xs: 9.5, md: 9.5, xl: 10.5 } }}>
        O assistente conversacional será liberado em breve.
      </Typography>

      <Box sx={{
        width: "100%",
        mt: { xs: 2.6, md: 2.4, xl: 3 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2,minmax(0,1fr))" },
        gap: { xs: 1.15, md: 1.4, xl: 1.7 },
      }}>
        {suggestions.map(({ icon: Icon, label, description }) => <Paper
          key={label}
          aria-disabled="true"
          elevation={0}
          sx={{
            color: "inherit",
            p: { xs: 1.25, sm: 1.35, md: 1.35, xl: 1.7 },
            borderRadius: { xs: 2.6, md: 2.8, xl: 3 },
            display: "grid",
            gridTemplateColumns: "auto minmax(0,1fr) auto",
            alignItems: "center",
            gap: { xs: 1.1, md: 1.2, xl: 1.4 },
            bgcolor: "rgba(255,255,255,.042)",
            border: "1px solid rgba(197,255,236,.15)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.04),0 12px 28px rgba(0,0,0,.13)",
            backdropFilter: "blur(12px)",
            opacity: .80,
            cursor: "not-allowed",
            userSelect: "none",
          }}
        >
          <Box sx={{
            width: { xs: 44, md: 42, xl: 50 },
            height: { xs: 44, md: 42, xl: 50 },
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "#123e31",
            background: "linear-gradient(145deg,#f1fff9,#c9f4e5)",
            boxShadow: "0 0 0 1px rgba(255,255,255,.36),0 0 13px rgba(108,236,194,.18)",
          }}>
            <Icon sx={{ fontSize: { xs: 21, md: 20, xl: 24 } }} />
          </Box>
          <Box minWidth={0}>
            <Typography sx={{ fontSize: { xs: 14.5, md: 13.5, xl: 15.5 }, fontWeight: 850, letterSpacing: "-.02em" }}>{label}</Typography>
            <Typography sx={{ mt: .25, color: "rgba(247,255,252,.66)", fontSize: { xs: 11, md: 10.2, xl: 11.5 }, lineHeight: 1.35 }}>{description}</Typography>
          </Box>
          <Box sx={{
            width: { xs: 30, md: 28, xl: 30 },
            height: { xs: 30, md: 28, xl: 30 },
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "rgba(235,255,248,.46)",
            bgcolor: "rgba(225,255,245,.075)",
            border: "1px solid rgba(218,255,243,.10)",
          }}>
            <ArrowForwardIosRoundedIcon sx={{ fontSize: { xs: 13, md: 12, xl: 13 } }} />
          </Box>
        </Paper>)}
      </Box>

      <Stack direction="row" alignItems="center" gap={1.5} sx={{
        width: "100%",
        mt: { xs: 2.8, md: 2.8, xl: 3.4 },
        color: "rgba(245,255,252,.50)",
      }}>
        <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(235,255,248,.12)" }} />
        <Box component="img" src="/precify-logo-white.svg" alt="Precify" sx={{ width: { xs: 76, md: 84, xl: 94 }, opacity: .54 }} />
        <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(235,255,248,.12)" }} />
      </Stack>
    </Stack>
  </Box>;
}
