import { Link as RouterLink } from "react-router-dom";
import { Box, ButtonBase, Container, Stack, Typography } from "@mui/material";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const shortcuts = [
  {
    to: "/mao-de-obra",
    label: "Mão de obra",
    description: "Encontre profissionais e serviços",
    icon: EngineeringOutlinedIcon,
    featured: true,
  },
  {
    to: "/composicoes",
    label: "Nova composição",
    description: "Organize materiais e custos",
    icon: CalculateOutlinedIcon,
  },
  {
    to: "/obras",
    label: "Minhas obras",
    description: "Acesse seus projetos",
    icon: HomeWorkOutlinedIcon,
  },
  {
    to: "/comparar",
    label: "Comparar",
    description: "Compare produtos lado a lado",
    icon: CompareArrowsRoundedIcon,
  },
] as const;

export default function QuickAccessStrip() {
  return <Box component="section" aria-labelledby="quick-access-title" sx={{ pt: { xs: 1.5, md: 1.65, xl: 2.1 } }}>
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 2.75, xl: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={{ xs: .85, md: .65, xl: .9 }}>
        <Box>
          <Typography id="quick-access-title" sx={{ fontSize: { xs: 13, md: 12.5, xl: 14 }, fontWeight: 850, color: "#244d40", letterSpacing: "-.01em" }}>
            Acessos rápidos
          </Typography>
          <Typography sx={{ display: { xs: "none", sm: "block" }, mt: .1, fontSize: { md: 10.5, xl: 11.5 }, color: "#80918b" }}>
            Continue de onde precisa, sem procurar pelo menu.
          </Typography>
        </Box>
      </Stack>

      <Box sx={{
        display: "flex", gap: { xs: .85, md: .75, xl: 1 }, overflowX: "auto", pb: .45, px: .1,
        scrollSnapType: "x proximity", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }
      }}>
        {shortcuts.map(({ to, label, description, icon: Icon, featured }) => <ButtonBase
          key={to}
          component={RouterLink}
          to={to}
          sx={{
            width: { xs: 154, sm: 176, md: 168, xl: 198 }, minWidth: { xs: 154, sm: 176, md: 168, xl: 198 },
            minHeight: { xs: 72, md: 66, xl: 76 }, px: { xs: 1.15, md: 1.1, xl: 1.3 }, py: { xs: 1, md: .85, xl: 1.05 },
            borderRadius: { xs: 2.7, md: 2.5, xl: 3 }, scrollSnapAlign: "start", textAlign: "left",
            display: "flex", alignItems: "center", justifyContent: "flex-start", gap: { xs: .9, md: .8, xl: 1 },
            color: featured ? "#fff" : "#1f5241",
            border: "1px solid",
            borderColor: featured ? "rgba(0,107,79,.30)" : "rgba(0,107,79,.12)",
            background: featured
              ? "linear-gradient(135deg,#0a7658 0%,#006b4f 58%,#174c3c 100%)"
              : "linear-gradient(145deg,rgba(255,255,255,.94),rgba(238,247,244,.82))",
            boxShadow: featured ? "0 8px 22px rgba(0,107,79,.16)" : "0 4px 14px rgba(24,60,48,.045)",
            transition: "transform 180ms ease,box-shadow 180ms ease,border-color 180ms ease",
            "@media (hover:hover)": { "&:hover": { transform: "translateY(-2px)", boxShadow: featured ? "0 11px 26px rgba(0,107,79,.22)" : "0 8px 20px rgba(0,107,79,.08)", borderColor: featured ? "rgba(0,107,79,.32)" : "rgba(0,107,79,.26)" } },
            "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: 2 },
          }}
        >
          <Box sx={{
            width: { xs: 36, md: 33, xl: 38 }, height: { xs: 36, md: 33, xl: 38 }, borderRadius: "12px", flexShrink: 0,
            display: "grid", placeItems: "center",
            bgcolor: featured ? "rgba(255,255,255,.13)" : "#e6f2ee",
            border: featured ? "1px solid rgba(255,255,255,.14)" : "1px solid rgba(0,107,79,.07)",
          }}><Icon sx={{ fontSize: { xs: 20, md: 18, xl: 21 } }} /></Box>
          <Box minWidth={0} flex={1}>
            <Typography noWrap sx={{ fontSize: { xs: 11.5, md: 10.8, xl: 12 }, fontWeight: 800 }}>{label}</Typography>
            <Typography sx={{ mt: .15, fontSize: { xs: 9.3, md: 8.8, xl: 9.8 }, lineHeight: 1.25, color: featured ? "rgba(255,255,255,.72)" : "#72867f" }}>
              {description}
            </Typography>
          </Box>
          <ArrowForwardRoundedIcon sx={{ fontSize: { xs: 15, md: 14, xl: 16 }, opacity: featured ? .8 : .52, flexShrink: 0 }} />
        </ButtonBase>)}
      </Box>
    </Container>
  </Box>;
}
