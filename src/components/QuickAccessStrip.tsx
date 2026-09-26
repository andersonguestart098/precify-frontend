import { Link as RouterLink } from "react-router-dom";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddHomeWorkOutlinedIcon from "@mui/icons-material/AddHomeWorkOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
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
    to: "/favoritos",
    label: "Favoritos",
    description: "Tudo que você salvou",
    icon: <StarOutlineRoundedIcon />,
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
          width: featured
            ? { xs: 178, sm: 196, md: 204, lg: 220, xl: 236 }
            : { xs: 166, sm: 184, md: 190, lg: 204, xl: 224 },
          minWidth: featured
            ? { xs: 178, sm: 196, md: 204, lg: 220, xl: 236 }
            : { xs: 166, sm: 184, md: 190, lg: 204, xl: 224 },
          minHeight: featured
            ? { xs: 116, sm: 120, md: 124, xl: 132 }
            : { xs: 104, sm: 108, md: 110, xl: 120 },
          px: { xs: 1.3, md: 1.4, xl: 1.55 },
          py: featured ? { xs: 1.35, md: 1.4, xl: 1.5 } : { xs: 1.2, md: 1.25, xl: 1.4 },
          borderRadius: featured
            ? { xs: "22px 15px 22px 15px", md: "24px 16px 24px 16px" }
            : { xs: "16px", md: "16px", xl: "18px" },
          scrollSnapAlign: "start", textAlign: "left",
          display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "space-between", gap: 1,
          color: "#244d40", border: "1px solid",
          borderColor: featured ? "rgba(0,107,79,.26)" : "rgba(0,107,79,.095)",
          background: featured
            ? "linear-gradient(145deg,rgba(255,255,255,.995) 0%,rgba(239,250,246,.98) 48%,rgba(224,243,235,.96) 100%)"
            : "linear-gradient(148deg,rgba(255,255,255,.96) 0%,rgba(245,249,248,.9) 58%,rgba(237,246,243,.84) 100%)",
          boxShadow: featured
            ? "0 11px 28px rgba(0,107,79,.10), 0 0 0 1px rgba(38,155,120,.055), inset 0 1px 0 rgba(255,255,255,.92)"
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
          "&::after": featured ? {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: "linear-gradient(118deg,transparent 0%,transparent 34%,rgba(255,255,255,.58) 47%,rgba(255,255,255,.16) 54%,transparent 68%,transparent 100%)",
            transform: "translateX(-145%)",
            animation: "precifyAiSheen 3.15s ease-in-out infinite",
            pointerEvents: "none",
          } : {},
          "@keyframes precifyAiSheen": {
            "0%": { transform: "translateX(-145%)" },
            "52%": { transform: "translateX(145%)" },
            "100%": { transform: "translateX(145%)" },
          },
          ...(available ? {
            "@media (hover:hover)": { "&:hover": {
              transform: featured ? "translateY(-3px) scale(1.012)" : "translateY(-2px)",
              borderColor: featured ? "rgba(0,107,79,.40)" : "rgba(0,107,79,.21)",
              boxShadow: featured
                ? "0 15px 34px rgba(0,107,79,.14), 0 0 0 1px rgba(38,155,120,.08)"
                : "0 10px 23px rgba(0,107,79,.065)",
            } },
          } : {}),
          "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: 2 },
          "@media (prefers-reduced-motion: reduce)": { transition: "none", animation: "none", "&::after": { animation: "none", display: "none" }, "&:hover": { transform: "none" } },
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" position="relative" zIndex={1}>
          <Box sx={{
            width: { xs: 41, md: 42, xl: 46 }, height: { xs: 41, md: 42, xl: 46 },
            borderRadius: featured ? 0 : { xs: "12px", md: "12px", xl: "14px" },
            clipPath: featured
              ? "polygon(22% 0%, 78% 0%, 100% 22%, 100% 78%, 78% 100%, 22% 100%, 0% 78%, 0% 22%)"
              : "none",
            display: "grid", placeItems: "center", position: "relative", flexShrink: 0,
            overflow: "hidden",
            color: featured ? "#0f6b52" : "#285e4c",
            background: featured
              ? "linear-gradient(145deg,rgba(255,255,255,.98) 0%,rgba(233,247,240,.95) 52%,rgba(219,241,231,.92) 100%)"
              : "linear-gradient(145deg,#eef8f4,#dfeee8)",
            border: featured ? "1px solid rgba(16,115,88,.14)" : "1px solid rgba(0,107,79,.06)",
            boxShadow: featured
              ? "0 10px 22px rgba(0,107,79,.10), 0 0 0 1px rgba(38,155,120,.05), inset 0 1px 0 rgba(255,255,255,.92)"
              : "0 2px 6px rgba(24,60,48,.035)",
            backdropFilter: featured ? "blur(9px)" : "none",
            WebkitBackdropFilter: featured ? "blur(9px)" : "none",
            "&::before": featured ? {
              content: '""',
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 30% 25%,rgba(255,255,255,.75),transparent 42%),radial-gradient(circle at 75% 75%,rgba(38,155,120,.12),transparent 44%)",
              pointerEvents: "none",
            } : {},
            "&::after": featured ? {
              content: '""',
              position: "absolute",
              inset: 2,
              borderRadius: "inherit",
              border: "1px solid rgba(255,255,255,.38)",
              pointerEvents: "none",
            } : {},
            "& svg": {
              width: { xs: 22, md: 24, xl: 26 },
              height: { xs: 22, md: 24, xl: 26 },
              position: "relative",
              zIndex: 1,
              filter: featured ? "drop-shadow(0 2px 5px rgba(0,107,79,.14))" : "none",
              animation: featured ? "precifyAiIconFloat 2.2s ease-in-out infinite" : "none",
              transformOrigin: "center",
            },
            "@keyframes precifyAiIconFloat": {
              "0%,100%": { transform: "scale(1) translateY(0px)", opacity: .95 },
              "25%": { transform: "scale(1.06) translateY(-1px)", opacity: 1 },
              "50%": { transform: "scale(.98) translateY(0px)", opacity: .92 },
              "75%": { transform: "scale(1.04) translateY(-1px)", opacity: 1 },
            },
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
              "&::before": { animation: "none" },
              "& svg": { animation: "none" },
            },
          }}>{icon}</Box>
          <Box sx={{
            width: 28, height: 28, borderRadius: "10px", display: "grid", placeItems: "center",
            color: featured ? "#17664f" : "#5c7a70",
            bgcolor: featured ? "rgba(248,252,250,.9)" : "rgba(255,255,255,.6)",
            border: featured ? "1px solid rgba(0,107,79,.10)" : "1px solid rgba(0,107,79,.065)",
            boxShadow: featured ? "inset 0 1px 0 rgba(255,255,255,.9)" : "inset 0 1px 0 rgba(255,255,255,.72)",
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
