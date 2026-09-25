import { Link as RouterLink } from "react-router-dom";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddHomeWorkOutlinedIcon from "@mui/icons-material/AddHomeWorkOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { HardHat } from "@phosphor-icons/react";
import { catalogSectionTitleSx } from "../styles/catalogVisual";

const shortcuts = [
  {
    to: "/produtos",
    label: "Materiais",
    description: "Banco de materiais",
    icon: <Inventory2OutlinedIcon />,
    featured: false,
    art: "left",
    available: true,
  },
  {
    to: "/mao-de-obra",
    label: "Mão de obra",
    description: "Profissionais e serviços",
    icon: <HardHat size={22} weight="duotone" aria-hidden="true" />,
    featured: false,
    art: "right",
    available: true,
  },
  {
    to: "/ia",
    label: "IA",
    description: "Assistente Precify",
    icon: <AutoAwesomeIcon />,
    featured: true,
    art: "left",
    available: true,
  },
  {
    to: "/obras?new=1",
    label: "Criar obra",
    description: "Novo planejamento",
    icon: <AddHomeWorkOutlinedIcon />,
    featured: false,
    art: "right",
    available: true,
  },
  {
    to: "/composicoes",
    label: "Composições",
    description: "Materiais e custos",
    icon: <CalculateOutlinedIcon />,
    featured: false,
    art: "left",
    available: true,
  },
] as const;

export default function QuickAccessStrip() {
  return <Box component="section" aria-labelledby="quick-access-title" sx={{
    mt: { xs: .9, md: 1.15, xl: 1.5 },
    pb: { xs: .5, md: .8 },
  }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={{ xs: .9, md: 1 }}>
      <Box>
        <Stack direction="row" alignItems="center" gap={.45}>
          <Typography id="quick-access-title" sx={{ ...catalogSectionTitleSx, lineHeight: 1.1 }}>
            Acessos rápidos
          </Typography>
          <LocalFireDepartmentRoundedIcon aria-hidden="true" sx={{
            fontSize: { xs: 16, md: 17, xl: 18.5 },
            color: "#d96c32",
            filter: "drop-shadow(0 2px 4px rgba(217,108,50,.12))",
          }} />
        </Stack>
        <Typography sx={{
          display: { xs: "none", sm: "block" }, mt: .15,
          fontSize: { sm: 9.8, md: 10.5, xl: 11.3 }, color: "#82948d",
        }}>
          atalhos principais para trabalhar mais rápido
        </Typography>
      </Box>
    </Stack>

    <Box sx={{
      display: "flex", gap: { xs: .95, md: 1.1, xl: 1.25 }, overflowX: "auto", pt: .75, pb: .75, px: .5,
      scrollSnapType: "x proximity", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }
    }}>
      {shortcuts.map(({ to, label, description, icon, featured, art, available }, index) => <ButtonBase
        key={to}
        component={RouterLink}
        to={to}
        aria-disabled={!available}
        onClick={available ? undefined : event => event.preventDefault()}
        sx={{
          position: "relative", overflow: "hidden",
          width: { xs: 166, sm: 184, md: 190, lg: 204, xl: 224 }, minWidth: { xs: 166, sm: 184, md: 190, lg: 204, xl: 224 },
          minHeight: { xs: 104, sm: 108, md: 110, xl: 120 }, px: { xs: 1.3, md: 1.4, xl: 1.55 }, py: { xs: 1.2, md: 1.25, xl: 1.4 },
          borderRadius: { xs: "16px", md: "16px", xl: "18px" }, scrollSnapAlign: "start", textAlign: "left",
          display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "space-between", gap: 1,
          color: "#244d40", border: "1px solid",
          borderColor: featured ? "rgba(0,107,79,.48)" : "rgba(0,107,79,.095)",
          background: featured
            ? "linear-gradient(142deg,#f7fdfa 0%,#e4f5ee 56%,#d5eee4 100%)"
            : "linear-gradient(148deg,rgba(255,255,255,.96) 0%,rgba(245,249,248,.9) 58%,rgba(237,246,243,.84) 100%)",
          boxShadow: featured
            ? "0 10px 28px rgba(0,107,79,.14), 0 0 0 2px rgba(38,155,120,.07), inset 0 1px 0 rgba(255,255,255,.94)"
            : "0 5px 16px rgba(24,60,48,.03), inset 0 1px 0 rgba(255,255,255,.78)",
          cursor: available ? "pointer" : "default",
          transition: "transform 180ms ease,box-shadow 180ms ease,border-color 180ms ease,background 180ms ease",
          "&::before": {
            content: '""', position: "absolute",
            width: { xs: 88, md: 82, xl: 96 }, height: { xs: 88, md: 82, xl: 96 },
            borderRadius: index % 2 === 0 ? "46% 54% 65% 35% / 42% 38% 62% 58%" : "63% 37% 45% 55% / 55% 61% 39% 45%",
            right: art === "right" ? -34 : -26,
            top: art === "right" ? -37 : -31,
            background: featured
              ? "radial-gradient(circle at 38% 38%,rgba(38,155,120,.115),rgba(0,107,79,.035) 58%,transparent 72%)"
              : "radial-gradient(circle at 38% 38%,rgba(38,155,120,.07),rgba(38,155,120,.018) 60%,transparent 73%)",
            transform: `rotate(${index % 2 === 0 ? 16 : -12}deg)`, pointerEvents: "none",
          },
          ...(featured ? {
            animation: "aiCardBreath 3.6s ease-in-out infinite",
            "@keyframes aiCardBreath": {
              "0%,100%": {
                borderColor: "rgba(0,107,79,.46)",
                boxShadow: "0 10px 28px rgba(0,107,79,.13), 0 0 0 2px rgba(38,155,120,.06), inset 0 1px 0 rgba(255,255,255,.94)",
              },
              "50%": {
                borderColor: "rgba(38,155,120,.72)",
                boxShadow: "0 13px 34px rgba(0,107,79,.20), 0 0 0 4px rgba(38,155,120,.11), inset 0 1px 0 rgba(255,255,255,.98)",
              },
            },
            "&::after": {
              content: '""', position: "absolute", inset: -1, borderRadius: "inherit", zIndex: 0,
              pointerEvents: "none", opacity: .58,
              background: "linear-gradient(112deg,transparent 22%,rgba(255,255,255,.5) 46%,rgba(214,242,233,.24) 52%,transparent 70%)",
              transform: "translateX(-135%)",
              animation: "aiSoftSweep 5.4s ease-in-out infinite",
            },
            "@keyframes aiSoftSweep": {
              "0%,68%": { transform: "translateX(-135%)" },
              "86%,100%": { transform: "translateX(135%)" },
            },
          } : {}),
          ...(available ? {
            "@media (hover:hover)": { "&:hover": {
              transform: "translateY(-2px)",
              borderColor: featured ? "rgba(38,155,120,.72)" : "rgba(0,107,79,.21)",
              boxShadow: featured
                ? "0 14px 36px rgba(0,107,79,.22), 0 0 0 4px rgba(38,155,120,.11)"
                : "0 10px 23px rgba(0,107,79,.065)",
            } },
          } : {}),
          "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: 2 },
          "@media (prefers-reduced-motion: reduce)": { transition: "none", animation: "none", "&::after": { animation: "none", display: "none" }, "&:hover": { transform: "none" } },
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" position="relative" zIndex={1}>
          <Box sx={{
            width: { xs: 41, md: 42, xl: 46 }, height: { xs: 41, md: 42, xl: 46 }, borderRadius: { xs: "12px", md: "12px", xl: "14px" },
            display: "grid", placeItems: "center",
            color: featured ? "#0a7257" : "#285e4c",
            background: featured
              ? "linear-gradient(145deg,#f4fbf8,#d7eee5)"
              : "linear-gradient(145deg,#eef8f4,#dfeee8)",
            border: featured ? "1px solid rgba(38,155,120,.22)" : "1px solid rgba(0,107,79,.06)",
            boxShadow: featured ? "0 3px 10px rgba(0,107,79,.10)" : "0 2px 6px rgba(24,60,48,.035)",
            ...(featured ? {
              animation: "aiIconPulse 2.8s ease-in-out infinite",
              "@keyframes aiIconPulse": {
                "0%,100%": { transform: "scale(1)", boxShadow: "0 3px 10px rgba(0,107,79,.10)" },
                "50%": { transform: "scale(1.055)", boxShadow: "0 4px 14px rgba(38,155,120,.24), 0 0 0 3px rgba(38,155,120,.07)" },
              },
              "& svg": {
                animation: "aiSparkle 2.8s ease-in-out infinite",
                filter: "drop-shadow(0 0 0 rgba(38,155,120,0))",
              },
              "@keyframes aiSparkle": {
                "0%,100%": { transform: "rotate(0deg) scale(1)", filter: "drop-shadow(0 0 0 rgba(38,155,120,0))" },
                "50%": { transform: "rotate(7deg) scale(1.08)", filter: "drop-shadow(0 2px 4px rgba(38,155,120,.28))" },
              },
            } : {}),
            "& svg": { width: { xs: 22, md: 24, xl: 26 }, height: { xs: 22, md: 24, xl: 26 } },
            "@media (prefers-reduced-motion: reduce)": { animation: "none", "& svg": { animation: "none" } },
          }}>{icon}</Box>
          <Box sx={{
            width: 28, height: 28, borderRadius: "10px", display: "grid", placeItems: "center",
            color: featured ? "#087458" : "#5c7a70",
            bgcolor: featured ? "rgba(241,252,247,.88)" : "rgba(255,255,255,.6)",
            border: featured ? "1px solid rgba(38,155,120,.18)" : "1px solid rgba(0,107,79,.065)",
            boxShadow: featured ? "0 2px 8px rgba(0,107,79,.08), inset 0 1px 0 rgba(255,255,255,.9)" : "inset 0 1px 0 rgba(255,255,255,.72)",
            backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)",
          }}>
            <ArrowOutwardRoundedIcon sx={{ fontSize: { xs: 16, xl: 18 } }} />
          </Box>
        </Stack>

        <Box minWidth={0} position="relative" zIndex={1}>
          <Typography sx={{ fontSize: { xs: 12.8, md: 13.2, xl: 14 }, fontWeight: 900, color: featured ? "#0b624b" : "#1f493b", lineHeight: 1.15, letterSpacing: "-.015em" }}>{label}</Typography>
          <Typography sx={{ mt: .34, fontSize: { xs: 9.7, md: 10.5, xl: 11.2 }, lineHeight: 1.3, color: "#74877f" }}>{description}</Typography>
        </Box>
      </ButtonBase>)}
    </Box>
  </Box>;
}
