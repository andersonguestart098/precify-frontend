import { Link as RouterLink } from "react-router-dom";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";

const shortcuts = [
  {
    to: "/mao-de-obra",
    label: "Mão de obra",
    description: "Profissionais e serviços",
    icon: EngineeringOutlinedIcon,
    featured: true,
  },
  {
    to: "/composicoes",
    label: "Composições",
    description: "Materiais e custos",
    icon: CalculateOutlinedIcon,
    featured: false,
  },
  {
    to: "/obras",
    label: "Obras",
    description: "Seus projetos",
    icon: HomeWorkOutlinedIcon,
    featured: false,
  },
  {
    to: "/comparar",
    label: "Comparar",
    description: "Produtos lado a lado",
    icon: CompareArrowsRoundedIcon,
    featured: false,
  },
] as const;

export default function QuickAccessStrip() {
  return <Box component="section" aria-labelledby="quick-access-title" sx={{ mt: { xs: 1.35, md: 1.4, xl: 1.8 }, pb: { xs: .35, md: .6 } }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={{ xs: .8, md: .7 }}>
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
      display: "flex", gap: { xs: .85, md: .9, xl: 1 }, overflowX: "auto", pb: .45, px: .05,
      scrollSnapType: "x proximity", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }
    }}>
      {shortcuts.map(({ to, label, description, icon: Icon, featured }) => <ButtonBase
        key={to}
        component={RouterLink}
        to={to}
        sx={{
          position: "relative", overflow: "hidden",
          width: { xs: 150, sm: 164, md: 158, xl: 184 }, minWidth: { xs: 150, sm: 164, md: 158, xl: 184 },
          minHeight: { xs: 94, sm: 98, md: 92, xl: 104 }, px: { xs: 1.15, md: 1.2, xl: 1.35 }, py: { xs: 1.05, md: 1.05, xl: 1.2 },
          borderRadius: { xs: "15px", md: "14px", xl: "16px" }, scrollSnapAlign: "start", textAlign: "left",
          display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "space-between", gap: .9,
          color: "#244d40", border: "1px solid",
          borderColor: featured ? "rgba(0,107,79,.24)" : "rgba(0,107,79,.105)",
          background: featured
            ? "linear-gradient(145deg,rgba(246,252,249,.98) 0%,rgba(225,242,236,.96) 100%)"
            : "linear-gradient(145deg,rgba(255,255,255,.94) 0%,rgba(241,248,246,.84) 100%)",
          boxShadow: featured ? "0 7px 20px rgba(0,107,79,.08)" : "0 4px 15px rgba(24,60,48,.035)",
          transition: "transform 180ms ease,box-shadow 180ms ease,border-color 180ms ease",
          "&::before": {
            content: '""', position: "absolute", width: { xs: 70, md: 64, xl: 76 }, height: { xs: 70, md: 64, xl: 76 },
            borderRadius: "48% 52% 58% 42% / 44% 45% 55% 56%", right: -27, top: -29,
            background: featured ? "rgba(0,107,79,.07)" : "rgba(38,155,120,.045)", transform: "rotate(18deg)", pointerEvents: "none",
          },
          "&::after": featured ? {
            content: '""', position: "absolute", left: 0, top: 18, bottom: 18, width: 3, borderRadius: "0 999px 999px 0",
            background: "linear-gradient(180deg,#269b78,#006b4f)", opacity: .9,
          } : undefined,
          "@media (hover:hover)": { "&:hover": { transform: "translateY(-2px)", borderColor: "rgba(0,107,79,.23)", boxShadow: "0 10px 24px rgba(0,107,79,.08)" } },
          "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: 2 },
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" position="relative" zIndex={1}>
          <Box sx={{
            width: { xs: 37, md: 36, xl: 40 }, height: { xs: 37, md: 36, xl: 40 }, borderRadius: { xs: "11px", md: "10px", xl: "12px" },
            display: "grid", placeItems: "center", color: featured ? "#fff" : "#285e4c",
            background: featured ? "linear-gradient(145deg,#178767,#006b4f)" : "linear-gradient(145deg,#edf7f3,#dfeee8)",
            border: featured ? "1px solid rgba(0,107,79,.2)" : "1px solid rgba(0,107,79,.065)",
            boxShadow: featured ? "0 4px 10px rgba(0,107,79,.13)" : "none",
          }}><Icon sx={{ fontSize: { xs: 20, md: 19, xl: 21 } }} /></Box>
          <Box sx={{ width: 27, height: 27, borderRadius: "9px", display: "grid", placeItems: "center", color: "#5e7d72", bgcolor: "rgba(255,255,255,.58)", border: "1px solid rgba(0,107,79,.07)" }}>
            <ArrowOutwardRoundedIcon sx={{ fontSize: 15 }} />
          </Box>
        </Stack>

        <Box minWidth={0} position="relative" zIndex={1}>
          <Typography sx={{ fontSize: { xs: 12.2, md: 11.8, xl: 12.7 }, fontWeight: 850, color: "#214b3d", lineHeight: 1.15 }}>{label}</Typography>
          <Typography sx={{ mt: .3, fontSize: { xs: 9.5, md: 9.2, xl: 10 }, lineHeight: 1.25, color: "#74877f" }}>{description}</Typography>
        </Box>
      </ButtonBase>)}
    </Box>
  </Box>;
}
