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

const accountLinks = [
  { to: "/perfil", label: "Perfil", caption: "Seus dados e informações da empresa", icon: PersonOutlineRoundedIcon },
] as const;

const institutionalLinks = [
  { to: "/sobre", label: "Sobre o Precify", caption: "O Precify e quem somos", icon: InfoOutlinedIcon },
  { to: "/institucional", label: "Institucional", caption: "Missão, visão e valores", icon: ApartmentOutlinedIcon },
  { to: "/contato", label: "Contato", caption: "Dúvidas, sugestões e demonstrações", icon: MailOutlineRoundedIcon },
] as const;

export function DesktopMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const user = useAccount();

  const renderLinks = (links: typeof accountLinks | typeof institutionalLinks) => links.map(({ to, label, caption, icon: Icon }) => (
    <ListItemButton
      key={to}
      component={RouterLink}
      to={to}
      selected={location.pathname === to}
      onClick={() => setOpen(false)}
      sx={{
        borderRadius: 2.5,
        mb: .65,
        py: 1.15,
        "&.Mui-selected": { bgcolor: "#e8f4f0" },
        "&.Mui-selected:hover": { bgcolor: "#e1f0eb" },
      }}
    >
      <ListItemIcon sx={{ minWidth: 43, color: "#1a4f3e" }}><Icon /></ListItemIcon>
      <ListItemText
        primary={label}
        secondary={caption}
        primaryTypographyProps={{ fontWeight: 750 }}
        secondaryTypographyProps={{ fontSize: 12, lineHeight: 1.35 }}
      />
    </ListItemButton>
  ));

  return <>
    <IconButton
      aria-label="Abrir menu"
      onClick={() => setOpen(true)}
      sx={{
        color: "#fff",
        display: "inline-flex",
        ml: "auto",
        flexShrink: 0,
        width: 40,
        height: 40,
        "&:hover": { bgcolor: "rgba(255,255,255,.1)" },
      }}
    >
      <MenuRoundedIcon />
    </IconButton>

    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      slotProps={{ paper: { sx: { width: { xs: 326, sm: 360 }, maxWidth: "92vw", bgcolor: "#f8fbfa" } } }}
    >
      <Stack component="aside" height="100%" aria-label="Menu principal">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 2.1, bgcolor: "#006b4f", color: "#fff" }}>
          <Stack direction="row" alignItems="center" gap={1.1}>
            <Box component="img" src="/precify-mark.svg" alt="" sx={{ width: 34, height: 34 }} />
            <Box>
              <Typography fontWeight={850} lineHeight={1.1}>Menu Precify</Typography>
              <Typography sx={{ opacity: .78, fontSize: 11.5, mt: .25 }}>Conta e informações institucionais</Typography>
            </Box>
          </Stack>
          <IconButton aria-label="Fechar menu" onClick={() => setOpen(false)} sx={{ color: "inherit" }}><CloseRoundedIcon /></IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" gap={1.5} sx={{ px: 2.5, py: 2.2 }}>
          <Avatar src={user.avatarUrl || undefined} alt={user.name} sx={{ width: 50, height: 50, border: "2px solid #b8dfd2", bgcolor: "#e5f4ef", color: "#13382e" }}>{user.name.charAt(0).toUpperCase()}</Avatar>
          <Box minWidth={0}>
            <Typography fontWeight={800} noWrap>{user.name}</Typography>
            <Typography color="text.secondary" fontSize={12.5} noWrap>{user.email}</Typography>
          </Box>
        </Stack>

        <Divider />
        <Box sx={{ px: 1.5, pt: 1.5, overflowY: "auto" }}>
          <Typography variant="overline" sx={{ display: "block", px: 1.5, pt: .5, pb: .4, color: "#809088", fontSize: 9.5, letterSpacing: 1.25, fontWeight: 800 }}>Minha conta</Typography>
          <List disablePadding>{renderLinks(accountLinks)}</List>

          <Typography variant="overline" sx={{ display: "block", px: 1.5, pt: 1.25, pb: .4, color: "#809088", fontSize: 9.5, letterSpacing: 1.25, fontWeight: 800 }}>Conheça o Precify</Typography>
          <List disablePadding>{renderLinks(institutionalLinks)}</List>
        </Box>

        <Box sx={{ mt: "auto", px: 2.5, py: 2.5 }}>
          <Typography color="text.secondary" fontSize={11.5}>Inteligência aplicada aos custos da construção.</Typography>
        </Box>
      </Stack>
    </Drawer>
  </>;
}
