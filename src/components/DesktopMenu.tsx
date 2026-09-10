import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import { useAccount } from "../auth/session";

const links = [
  { to: "/perfil", label: "Perfil", caption: "Conta e histórico", icon: PersonOutlineRoundedIcon },
  { to: "/sobre", label: "Sobre", caption: "Conheça o Precify", icon: InfoOutlinedIcon },
  { to: "/institucional", label: "Institucional", caption: "Missão e valores", icon: ApartmentOutlinedIcon },
  { to: "/contato", label: "Contato", caption: "Fale com a gente", icon: MailOutlineRoundedIcon },
] as const;

export function DesktopMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const user = useAccount();

  return <>
    <IconButton aria-label="Abrir menu" onClick={() => setOpen(true)} sx={{ color: "#fff", display: { xs: "none", md: "inline-flex" } }}>
      <MenuRoundedIcon />
    </IconButton>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: 360, maxWidth: "92vw", bgcolor: "#f8fbf9" } } }}>
      <Stack component="aside" height="100%" aria-label="Menu principal">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2.25, bgcolor: "#198a4a", color: "#fff" }}>
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box component="img" src="/precify-mark.svg" alt="" sx={{ width: 34, height: 34 }} />
            <Typography fontWeight={850}>Menu Precify</Typography>
          </Stack>
          <IconButton aria-label="Fechar menu" onClick={() => setOpen(false)} sx={{ color: "inherit" }}><CloseRoundedIcon /></IconButton>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ px: 3, py: 2.5 }}>
          <Avatar src={user.avatarUrl || undefined} alt={user.name} sx={{ width: 50, height: 50, border: "2px solid #b8dfc7", bgcolor: "#e5f4ea", color: "#0b6732" }}>{user.name.charAt(0).toUpperCase()}</Avatar>
          <Box minWidth={0}><Typography fontWeight={800} noWrap>{user.name}</Typography><Typography color="text.secondary" fontSize={12.5} noWrap>{user.email}</Typography></Box>
        </Stack>
        <Divider />
        <List sx={{ px: 1.5, py: 2 }}>
          {links.map(({ to, label, caption, icon: Icon }) => <ListItemButton key={to} component={RouterLink} to={to} selected={location.pathname === to} onClick={() => setOpen(false)} sx={{ borderRadius: 2.5, mb: .65, py: 1.15 }}>
            <ListItemIcon sx={{ minWidth: 43, color: "#17653a" }}><Icon /></ListItemIcon>
            <ListItemText primary={label} secondary={caption} primaryTypographyProps={{ fontWeight: 750 }} secondaryTypographyProps={{ fontSize: 12 }} />
          </ListItemButton>)}
        </List>
        <Box sx={{ mt: "auto", px: 3, py: 2.5 }}><Typography color="text.secondary" fontSize={11.5}>Inteligência aplicada aos custos da construção.</Typography></Box>
      </Stack>
    </Drawer>
  </>;
}
