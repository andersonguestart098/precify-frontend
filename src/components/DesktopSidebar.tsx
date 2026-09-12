import { Link as RouterLink, useLocation } from "react-router-dom";
import { Avatar, Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import StarOutline from "@mui/icons-material/StarOutline";
import CalculateOutlined from "@mui/icons-material/CalculateOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import MailOutline from "@mui/icons-material/MailOutline";
import { useAccount } from "../auth/session";

const workspaceLinks = [
  { to: "/inicio", label: "Início", icon: HomeOutlined },
  { to: "/produtos", label: "Materiais", icon: Inventory2Outlined },
  { to: "/composicoes", label: "Composições", icon: CalculateOutlined },
  { to: "/favoritos", label: "Favoritos", icon: StarOutline },
  { to: "/ia", label: "Assistente IA", icon: AutoAwesome },
  { to: "/perfil", label: "Meu perfil", icon: PersonOutline },
  { to: "/obras", label: "Obra", icon: HomeOutlined },
  { to: "/comparar", label: "Comparar produtos", icon: Inventory2Outlined },
  { to: "/historico", label: "Histórico de buscas", icon: StarOutline },
] as const;

const institutionalLinks = [
  { to: "/sobre", label: "Sobre o Precify", icon: InfoOutlined },
  { to: "/institucional", label: "Institucional", icon: ApartmentOutlined },
  { to: "/contato", label: "Contato", icon: MailOutline },
] as const;

export default function DesktopSidebar() {
  const { pathname } = useLocation();
  const user = useAccount();

  const renderLinks = (links: typeof workspaceLinks | typeof institutionalLinks) => links.map(({ to, label, icon: Icon }) => {
    const active = pathname === to || (to === "/produtos" && pathname.startsWith("/produtos/"));
    return <ListItemButton
      key={to}
      component={RouterLink}
      to={to}
      selected={active}
      aria-current={active ? "page" : undefined}
      sx={{
        mb: { md: .18, xl: .6 },
        borderRadius: { md: 1.7, xl: 2 },
        minHeight: { md: 34, xl: 46 },
        px: { md: 1.15, xl: 2 },
        py: { md: .25, xl: .7 },
        color: active ? "#13382e" : "#576a64",
        "&.Mui-selected": { background: "linear-gradient(100deg,#e4f4ef,#f2f9f7)" },
        "@media (max-height: 720px)": { minHeight: 31, py: 0, mb: .08 },
      }}
    >
      <ListItemIcon sx={{ minWidth: { md: 29, xl: 35 }, color: "inherit" }}><Icon sx={{ fontSize: { md: 18, xl: 21 } }} /></ListItemIcon>
      <ListItemText primary={label} primaryTypographyProps={{ fontSize: { md: 11.5, xl: 13 }, fontWeight: active ? 750 : 550, lineHeight: 1.15 }} />
    </ListItemButton>;
  });

  return <Box component="aside" sx={{
    display: { xs: "none", md: "flex" }, flexDirection: "column", position: "fixed", inset: "0 auto 0 0",
    width: "var(--sidebar-width)", zIndex: theme => theme.zIndex.appBar + 1, bgcolor: "#fff", borderRight: 0,
    boxShadow: "6px 0 24px rgba(19,56,46,.10), 1px 0 4px rgba(19,56,46,.06)", overflow: "hidden"
  }}>
    <Stack component={RouterLink} to="/inicio" direction="row" alignItems="center" gap={1} sx={{ minHeight: "var(--header-height)", flexShrink: 0, px: { md: 2, xl: 2.5 }, bgcolor: "#006b4f", color: "white", textDecoration: "none" }}>
      <Box component="img" src="/precify-logo-white.svg" alt="Precify" sx={{ width: { md: 124, xl: 156 }, maxHeight: { md: 34, xl: 42 }, objectFit: "contain" }} />
    </Stack>

    <Typography variant="overline" sx={{ px: { md: 1.75, xl: 2.5 }, pt: { md: 1.7, xl: 3 }, pb: { md: .45, xl: 1 }, color: "#819088", fontSize: { md: 8.5, xl: 10 }, letterSpacing: { md: 1.2, xl: 1.5 }, "@media (max-height: 720px)": { pt: 1, pb: .2 } }}>Área de trabalho</Typography>
    <List component="nav" aria-label="Navegação desktop" sx={{ px: { md: .8, xl: 1.5 }, pb: { md: .55, xl: 1.25 } }}>
      {renderLinks(workspaceLinks)}
    </List>

    <Box sx={{ px: { md: 1.75, xl: 2.5 }, py: { md: .45, xl: 1 }, "@media (max-height: 720px)": { py: .2 } }}>
      <Divider sx={{ borderColor: "rgba(19,56,46,.08)" }} />
    </Box>

    <Typography variant="overline" sx={{ px: { md: 1.75, xl: 2.5 }, pt: { md: .55, xl: 1.25 }, pb: { md: .3, xl: 1 }, color: "#9aa7a2", fontSize: { md: 8.2, xl: 9.5 }, letterSpacing: { md: 1.15, xl: 1.35 }, "@media (max-height: 720px)": { pt: .3, pb: .15 } }}>Sobre o Precify</Typography>
    <List component="nav" aria-label="Institucional" sx={{ px: { md: .8, xl: 1.5 }, pb: { md: .45, xl: 1.5 } }}>
      {renderLinks(institutionalLinks)}
    </List>

    <Stack component={RouterLink} to="/perfil" direction="row" gap={{ md: .8, xl: 1.2 }} alignItems="center" sx={{ mt: "auto", p: { md: 1.15, xl: 2 }, minHeight: { md: 48, xl: 68 }, borderTop: "1px solid #eaf0ee", textDecoration: "none", color: "inherit", flexShrink: 0 }}>
      <Avatar src={user.avatarUrl || undefined} sx={{ width: { md: 30, xl: 36 }, height: { md: 30, xl: 36 } }}>{user.name.charAt(0)}</Avatar>
      <Box minWidth={0}><Typography noWrap fontWeight={700} fontSize={{ md: 10.5, xl: 12 }}>{user.name}</Typography><Typography noWrap fontSize={{ md: 9, xl: 10 }} color="text.secondary">Minha conta</Typography></Box>
    </Stack>
  </Box>;
}
