import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Container, Stack, Tooltip, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MicNoneRoundedIcon from "@mui/icons-material/MicNoneRounded";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

const items = [
  {
    to: "/produtos",
    label: "Materiais",
    description: "Pesquise materiais, produtos, fabricantes, fornecedores, preços e regiões em um único catálogo.",
    icon: Inventory2OutlinedIcon,
    featured: false,
  },
  {
    to: "/mao-de-obra",
    label: "Mão de obra",
    description: "Explore serviços por especialidade, localização, estrutura e disponibilidade de cotação.",
    icon: EngineeringOutlinedIcon,
    featured: false,
  },
  {
    to: "/ia",
    label: "IA",
    description: "Converse por texto ou voz para identificar materiais, comparar opções e montar composições.",
    icon: AutoAwesomeIcon,
    featured: true,
  },
  {
    to: "/composicoes",
    label: "Composições",
    description: "Crie composições de preços e organize os custos conforme o tipo de projeto e obra.",
    icon: CalculateOutlinedIcon,
    featured: false,
  },
  {
    to: "/perfil",
    label: "Meu espaço",
    description: "Acesse seu histórico, favoritos, composições, projetos e dados da conta.",
    icon: PersonOutlineRoundedIcon,
    featured: false,
  },
] as const;

export function DesktopExploreNav() {
  const location = useLocation();

  return <Box component="nav" aria-label="Explore o Precify" sx={{
    display: { xs: "none", md: "block" }, position: "sticky", top: 70, zIndex: theme => theme.zIndex.appBar - 1,
    bgcolor: "rgba(255,255,255,.9)", borderBottom: "1px solid rgba(0,107,79,.12)", backdropFilter: "blur(16px)",
    boxShadow: "0 9px 28px rgba(19,56,46,.045)",
  }}>
    <Container maxWidth="lg">
      <Stack direction="row" justifyContent="center" alignItems="stretch" sx={{ minHeight: 82 }}>
        {items.map(({ to, label, description, icon: Icon, featured }) => {
          const active = location.pathname === to || (to === "/produtos" && location.pathname.startsWith("/produtos/"));
          return <Tooltip key={to} arrow placement="bottom" enterDelay={350} title={<Box sx={{ p: .4, maxWidth: 270 }}>
            <Typography fontWeight={800} fontSize={13} mb={.35}>{label}</Typography>
            <Typography fontSize={12} lineHeight={1.45}>{description}</Typography>
          </Box>}>
            <Stack component={RouterLink} to={to} aria-current={active ? "page" : undefined}
              alignItems="center" justifyContent="center" gap={.45} sx={{
                position: "relative", width: { md: 142, lg: 164 }, color: active ? "#13382e" : "#5e716b",
                textDecoration: "none", isolation: "isolate", transition: "color 220ms ease, transform 220ms ease",
                "&::before": {
                  content: '""', position: "absolute", inset: "10px 8px", zIndex: -1, borderRadius: 3,
                  opacity: active ? 1 : 0, transform: active ? "scale(1)" : "scale(.94)",
                  background: featured
                    ? "linear-gradient(135deg,rgba(0,107,79,.18),rgba(38,155,120,.1))"
                    : "linear-gradient(135deg,rgba(38,155,120,.13),rgba(0,107,79,.055))",
                  transition: "opacity 220ms ease, transform 220ms ease",
                },
                "&::after": active && !featured ? {
                  content: '""', position: "absolute", left: "25%", right: "25%", bottom: 0, height: 3,
                  borderRadius: "999px 999px 0 0", background: "linear-gradient(90deg,transparent,#399274,#13382e,#399274,transparent)",
                } : undefined,
                "&:hover": { color: "#13382e", transform: "translateY(-2px)", "&::before": { opacity: 1, transform: "scale(1)" } },
                "&:focus-visible": { outline: "2px solid #269b78", outlineOffset: -4, borderRadius: 3 },
                "@media (prefers-reduced-motion: reduce)": { transition: "none", "&::before": { transition: "none" }, "&:hover": { transform: "none" } },
              }}>
              <Box sx={featured ? {
                mt: -2.1, width: 58, height: 58, borderRadius: "50%", display: "grid", placeItems: "center", color: "#fff",
                background: "linear-gradient(140deg,#13382e,#006b4f 58%,#269b78)", border: "3px solid #fff",
                boxShadow: "0 8px 22px rgba(0,107,79,.26)", position: "relative",
              } : { height: 32, display: "grid", placeItems: "center" }}>
                <Icon sx={{ fontSize: featured ? 27 : 26 }} />
                {featured ? <MicNoneRoundedIcon sx={{ position: "absolute", right: -8, bottom: 1, fontSize: 17, p: .25, boxSizing: "content-box", borderRadius: "50%", bgcolor: "#fff", color: "#13382e", boxShadow: "0 2px 7px rgba(19,56,46,.15)" }} /> : null}
              </Box>
              <Typography fontSize={12.5} fontWeight={active ? 800 : 650}>{label}</Typography>
            </Stack>
          </Tooltip>;
        })}
      </Stack>
    </Container>
  </Box>;
}
