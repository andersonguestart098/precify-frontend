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
    label: "Comparar",
    description: "Produtos lado a lado",
    icon: <CompareArrowsRoundedIcon />,
    featured: false,
    art: "right",
    available: true,
  },
] as const;

export default function QuickAccessStrip() {
  return <Box component="section" aria-labelledby="quick-access-title" sx={{ mt: { xs: 1.45, md: 1.5, xl: 1.9 }, pb: { xs: .45, md: .65 } }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={{ xs: .8, md: .72 }}>
      <Box>
        <Typography id="quick-access-title" sx={{ fontSize: { xs: 13, md: 12.8, xl: 14.2 }, fontWeight: 850, color: "#244d40", letterSpacing: "-.015em" }}>
          Acessos rápidos
        </Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, mt: .1, fontSize: { sm: 9.6, md: 10.2, xl: 11 }, color: "#899892" }}>
          caminhos que você usa com mais frequência
        </Typography>
      </Box>
    </Stack>

    <Box sx={{
      display: "flex", gap: { xs: .9, md: .95, xl: 1.05 }, overflowX: "auto", pb: .55, px: .05,
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
          width: { xs: 154, sm: 168, md: 162, xl: 188 }, minWidth: { xs: 154, sm: 168, md: 162, xl: 188 },
          minHeight: { xs: 98, sm: 101, md: 94, xl: 106 }, px: { xs: 1.2, md: 1.25, xl: 1.4 }, py: { xs: 1.1, md: 1.08, xl: 1.22 },
          borderRadius: { xs: "16px", md: "15px", xl: "17px" }, scrollSnapAlign: "start", textAlign: "left",
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
            width: { xs: 39, md: 38, xl: 42 }, height: { xs: 39, md: 38, xl: 42 }, borderRadius: { xs: "12px", md: "11px", xl: "13px" },
            display: "grid", placeItems: "center", color: "#285e4c",
            background: "linear-gradient(145deg,#eef8f4,#dfeee8)",
            border: "1px solid rgba(0,107,79,.06)",
            boxShadow: "0 2px 6px rgba(24,60,48,.035)",
            "& svg": { width: { xs: 21, md: 20, xl: 22 }, height: { xs: 21, md: 20, xl: 22 } },
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
          <Typography sx={{ fontSize: { xs: 12.3, md: 11.9, xl: 12.8 }, fontWeight: 850, color: "#214b3d", lineHeight: 1.15, letterSpacing: "-.012em" }}>{label}</Typography>
          <Typography sx={{ mt: .32, fontSize: { xs: 9.55, md: 9.25, xl: 10 }, lineHeight: 1.28, color: "#74877f" }}>{description}</Typography>
        </Box>
      </ButtonBase>)}
    </Box>
  </Box>;
}
