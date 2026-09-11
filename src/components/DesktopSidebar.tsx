import { Link as RouterLink, useLocation } from "react-router-dom";
import { Avatar, Box, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import StarOutline from "@mui/icons-material/StarOutline";
import CalculateOutlined from "@mui/icons-material/CalculateOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { useAccount } from "../auth/session";

const links = [
  { to: "/inicio", label: "Início", icon: HomeOutlined },
  { to: "/produtos", label: "Materiais", icon: Inventory2Outlined },
  { to: "/composicoes", label: "Composições", icon: CalculateOutlined },
  { to: "/favoritos", label: "Favoritos", icon: StarOutline },
  { to: "/ia", label: "Assistente IA", icon: AutoAwesome },
  { to: "/perfil", label: "Meu perfil", icon: PersonOutline },
  { to: "/obras", label: "Obra", icon: HomeOutlined },
  { to: "/comparar", label: "Comparar produtos", icon: Inventory2Outlined },
  { to: "/historico", label: "Histórico de buscas", icon: StarOutline },
];

export default function DesktopSidebar() {
  const { pathname } = useLocation();
  const user = useAccount();
  return <Box component="aside" sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", position: "fixed", inset: "0 auto 0 0", width: 224, zIndex: theme => theme.zIndex.appBar + 1, bgcolor: "#fff", borderRight: 0, boxShadow: "6px 0 24px rgba(19,56,46,.10), 1px 0 4px rgba(19,56,46,.06)", overflowY: "auto" }}>
    <Stack component={RouterLink} to="/inicio" direction="row" alignItems="center" gap={1} sx={{ minHeight: 70, flexShrink: 0, px: 2.5, bgcolor: "#006b4f", color: "white", textDecoration: "none" }}>
      <Box component="img" src="/precify-logo-white.svg" alt="Precify" sx={{ width: 156, maxHeight: 42, objectFit: "contain" }} />
    </Stack>
    <Typography variant="overline" sx={{ px: 2.5, pt: 3, pb: 1, color: "#819088", fontSize: 10, letterSpacing: 1.5 }}>Área de trabalho</Typography>
    <List component="nav" aria-label="Navegação desktop" sx={{ px: 1.5 }}>
      {links.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || (to === "/produtos" && pathname.startsWith("/produtos/"));
        return <ListItemButton key={to} component={RouterLink} to={to} selected={active} aria-current={active ? "page" : undefined} sx={{ mb: .6, borderRadius: 2, minHeight: 46, color: active ? "#13382e" : "#576a64", "&.Mui-selected": { background: "linear-gradient(100deg,#e4f4ef,#f2f9f7)" } }}>
          <ListItemIcon sx={{ minWidth: 35, color: "inherit" }}><Icon sx={{ fontSize: 21 }} /></ListItemIcon>
          <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 750 : 550 }} />
        </ListItemButton>;
      })}
    </List>
    <Stack component={RouterLink} to="/perfil" direction="row" gap={1.2} alignItems="center" sx={{ mt: "auto", p: 2, borderTop: "1px solid #eaf0ee", textDecoration: "none", color: "inherit" }}>
      <Avatar src={user.avatarUrl || undefined} sx={{ width: 36, height: 36 }}>{user.name.charAt(0)}</Avatar>
      <Box minWidth={0}><Typography noWrap fontWeight={700} fontSize={12}>{user.name}</Typography><Typography noWrap fontSize={10} color="text.secondary">Minha conta</Typography></Box>
    </Stack>
  </Box>;
}
