import { Link as RouterLink } from "react-router-dom";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

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
  return <Box component="section" aria-labelledby="quick-access-title" sx={{ mt: { xs: 1.1, md: 1.25, xl: 1.6 }, pb: { xs: .25, md: .5 } }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={{ xs: .7, md: .65 }}>
      <Typography id="quick-access-title" sx={{ fontSize: { xs: 12.5, md: 12.5, xl: 14 }, fontWeight: 800, color: "#31594c", letterSpacing: "-.01em" }}>
        Acessos rápidos
      </Typography>
      <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: { md: 10.5, xl: 11.5 }, color: "#8a9994" }}>
        atalhos do seu dia a dia
      </Typography>
    </Stack>

    <Box sx={{
      display: "flex", gap: { xs: .65, md: .75, xl: .9 }, overflowX: "auto", pb: .35, px: .05,
      scrollSnapType: "x proximity", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }
    }}>
      {shortcuts.map(({ to, label, description, icon: Icon, featured }) => <ButtonBase
        key={to}
        component={RouterLink}
        to={to}
        sx={{
          width: { xs: 126, sm: 145, md: 150, xl: 172 }, minWidth: { xs: 126, sm: 145, md: 150, xl: 172 },
          minHeight: { xs: 52, md: 54, xl: 58 }, px: { xs: .8, md: .9, xl: 1 }, py: { xs: .65, md: .7 },
          borderRadius: { xs: 2.25, md: 2.4 }, scrollSnapAlign: "start", textAlign: "left",
          display: "flex", alignItems: "center", justifyContent: "flex-start", gap: { xs: .65, md: .75 },
          color: "#274f42", border: "1px solid",
          borderColor: featured ? "rgba(0,107,79,.22)" : "rgba(0,107,79,.095)",
          background: featured ? "rgba(0,107,79,.055)" : "rgba(255,255,255,.48)",
          boxShadow: featured ? "inset 3px 0 0 #0a7a5b" : "none",
          transition: "transform 160ms ease,background-color 160ms ease,border-color 160ms ease",
          "@media (hover:hover)": { "&:hover": { transform: "translateY(-1px)", background: "rgba(255,255,255,.82)", borderColor: "rgba(0,107,79,.2)" } },
          "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: 2 },
        }}
      >
        <Box sx={{
          width: { xs: 31, md: 32, xl: 34 }, height: { xs: 31, md: 32, xl: 34 }, borderRadius: { xs: "9px", md: "10px" }, flexShrink: 0,
          display: "grid", placeItems: "center", color: featured ? "#fff" : "#2b6451",
          background: featured ? "linear-gradient(145deg,#168366,#006b4f)" : "linear-gradient(145deg,#edf7f3,#e2f0eb)",
          border: featured ? "1px solid rgba(0,107,79,.18)" : "1px solid rgba(0,107,79,.06)",
        }}><Icon sx={{ fontSize: { xs: 18, md: 18, xl: 19 } }} /></Box>
        <Box minWidth={0} flex={1}>
          <Typography noWrap sx={{ fontSize: { xs: 10.7, md: 10.8, xl: 11.6 }, fontWeight: 800, color: "#244c3f" }}>{label}</Typography>
          <Typography noWrap sx={{ display: { xs: "none", sm: "block" }, mt: .05, fontSize: { sm: 8.8, md: 8.8, xl: 9.4 }, color: "#7b8d86" }}>
            {description}
          </Typography>
        </Box>
        <ArrowForwardIosRoundedIcon sx={{ fontSize: { xs: 11, md: 11.5 }, opacity: .42, flexShrink: 0 }} />
      </ButtonBase>)}
    </Box>
  </Box>;
}
