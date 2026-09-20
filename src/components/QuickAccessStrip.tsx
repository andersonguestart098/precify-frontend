import { Link as RouterLink } from "react-router-dom";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { HardHat } from "@phosphor-icons/react";

const shortcuts = [
  {
    to: "/mao-de-obra",
    label: "Mão de obra",
    description: "Profissionais e serviços",
    icon: <HardHat size={22} weight="duotone" aria-hidden="true" />,
    featured: true,
    art: "left",
    available: true,
  },
  {
    to: "/composicoes",
    label: "Composições",
    description: "Materiais e custos",
    icon: <CalculateOutlinedIcon />,
    featured: false,
    art: "right",
    available: true,
  },
  {
    to: "/obras",
    label: "Obras",
    description: "Seus projetos",
    icon: <HomeWorkOutlinedIcon />,
    featured: false,
    art: "left",
    available: true,
  },
  {
    to: "/comparar",
    label: "Comparar obras",
    description: "Obras, custos e M.O.",
    icon: <CompareArrowsRoundedIcon />,
    featured: false,
    art: "right",
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
        <Typography id="quick-access-title" sx={{
          fontSize: { xs: 14.2, md: 15.2, xl: 16.5 },
          fontWeight: 900,
          color: "#1f4c3d",
          letterSpacing: "-.02em",
        }}>
          Acessos rápidos
        </Typography>
        <Typography sx={{
          display: { xs: "none", sm: "block" }, mt: .15,
          fontSize: { sm: 9.8, md: 10.5, xl: 11.3 }, color: "#82948d",
        }}>
          atalhos principais para trabalhar mais rápido
        </Typography>
      </Box>
    </Stack>

    <Box sx={{
      display: "flex", gap: { xs: .95, md: 1.1, xl: 1.25 }, overflowX: "auto", pb: .65, px: .05,
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
          borderColor: featured ? "rgba(0,107,79,.22)" : "rgba(0,107,79,.095)",
          background: featured
            ? "linear-gradient(148deg,rgba(250,253,252,.99) 0%,rgba(231,245,240,.98) 58%,rgba(220,239,232,.94) 100%)"
            : "linear-gradient(148deg,rgba(255,255,255,.96) 0%,rgba(245,249,248,.9) 58%,rgba(237,246,243,.84) 100%)",
          boxShadow: featured
            ? "0 8px 22px rgba(0,107,79,.075), inset 0 1px 0 rgba(255,255,255,.9)"
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
          ...(available ? {
            "@media (hover:hover)": { "&:hover": {
              transform: "translateY(-2px)", borderColor: "rgba(0,107,79,.21)",
              boxShadow: featured ? "0 12px 26px rgba(0,107,79,.11)" : "0 10px 23px rgba(0,107,79,.065)",
            } },
          } : {}),
          "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: 2 },
          "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } },
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" position="relative" zIndex={1}>
          <Box sx={{
            width: { xs: 41, md: 42, xl: 46 }, height: { xs: 41, md: 42, xl: 46 }, borderRadius: { xs: "12px", md: "12px", xl: "14px" },
            display: "grid", placeItems: "center", color: "#285e4c",
            background: "linear-gradient(145deg,#eef8f4,#dfeee8)",
            border: "1px solid rgba(0,107,79,.06)",
            boxShadow: "0 2px 6px rgba(24,60,48,.035)",
            "& svg": { width: { xs: 22, md: 22, xl: 24 }, height: { xs: 22, md: 22, xl: 24 } },
          }}>{icon}</Box>
          <Box sx={{
            width: 28, height: 28, borderRadius: "10px", display: "grid", placeItems: "center", color: "#5c7a70",
            bgcolor: "rgba(255,255,255,.6)", border: "1px solid rgba(0,107,79,.065)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.72)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)",
          }}>
            <ArrowOutwardRoundedIcon sx={{ fontSize: 15.5 }} />
          </Box>
        </Stack>

        <Box minWidth={0} position="relative" zIndex={1}>
          <Typography sx={{ fontSize: { xs: 12.8, md: 12.8, xl: 13.8 }, fontWeight: 900, color: "#1f493b", lineHeight: 1.15, letterSpacing: "-.015em" }}>{label}</Typography>
          <Typography sx={{ mt: .34, fontSize: { xs: 9.7, md: 9.8, xl: 10.5 }, lineHeight: 1.3, color: "#74877f" }}>{description}</Typography>
        </Box>
      </ButtonBase>)}
    </Box>
  </Box>;
}
