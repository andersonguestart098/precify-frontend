import { Link as RouterLink, useLocation } from "react-router-dom";
import { Avatar, Container, Divider, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAccount, useSession } from "../auth/session";
export default function ProfilePage() {
  const user = useAccount(); const { signOut } = useSession(); const location = useLocation();
  const listSx = {
    bgcolor: "background.paper", borderRadius: 4, border: "1px solid #e6ecea", overflow: "hidden", p: 0,
    "& .MuiListItemButton-root": { px: 2, py: 1.5, gap: 1.5, transition: "background-color 180ms ease", "&:hover": { bgcolor: "#eef6f3" }, "&.Mui-selected": { bgcolor: "#edf6f3" } },
    "& .MuiListItemIcon-root": { minWidth: 38, width: 38, height: 38, display: "grid", placeItems: "center", bgcolor: "#eef5f3", color: "#214d3f", borderRadius: "11px", border: "1px solid #e0ece8" },
    "& .MuiListItemText-primary": { fontSize: 14, fontWeight: 600, color: "#183c30" },
    "& .MuiListItemButton-root + .MuiListItemButton-root": { borderTop: "1px solid #edf1f0" }
  };
  return <Container maxWidth="sm" component="main" sx={{ py: { xs: 3, md: 5 } }}>
    <Stack direction="row" alignItems="center" gap={1.5} mb={.5}>
      <Avatar src={user.avatarUrl || undefined} alt={user.name} sx={{ width: 56, height: 56, bgcolor: "#e9f3f0", color: "#183c30", border: "2px solid #cfe4dd", fontWeight: 700 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
      <Stack minWidth={0}><Typography variant="overline" color="primary" fontWeight={800}>Perfil</Typography><Typography component="h1" variant="h6" fontWeight={800} noWrap>{user.name}</Typography><Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{user.email}</Typography></Stack>
    </Stack>

    <Typography variant="overline" color="text.secondary" sx={{ display: "block", mt: 3, mb: 1 }}>Trabalho</Typography>
    <List sx={listSx}>
      <ListItemButton component={RouterLink} to="/composicoes" selected={location.pathname === "/composicoes"}>
        <ListItemIcon><MenuBookOutlinedIcon /></ListItemIcon><ListItemText primary="Composições próprias" secondary="Listas de compra e valores" />
      </ListItemButton>
      <ListItemButton component={RouterLink} to="/obras"><ListItemIcon><ConstructionOutlinedIcon /></ListItemIcon><ListItemText primary="Grupos de composições / Obras" /></ListItemButton>
      <ListItemButton component={RouterLink} to="/comparar"><ListItemIcon><Inventory2OutlinedIcon /></ListItemIcon><ListItemText primary="Comparar produtos" /></ListItemButton>
      <ListItemButton component={RouterLink} to="/historico"><ListItemIcon><MenuBookOutlinedIcon /></ListItemIcon><ListItemText primary="Histórico de buscas" /></ListItemButton>
    </List>

    <Typography variant="overline" color="text.secondary" sx={{ display: "block", mt: 3, mb: 1 }}>Atalhos</Typography>
    <List sx={listSx}>
      <ListItemButton component={RouterLink} to="/inicio" selected={location.pathname === "/inicio"}><ListItemIcon><HomeOutlinedIcon /></ListItemIcon><ListItemText primary="Início" /></ListItemButton>
      <ListItemButton component={RouterLink} to="/produtos" selected={location.pathname === "/produtos"}><ListItemIcon><Inventory2OutlinedIcon /></ListItemIcon><ListItemText primary="Produtos" /></ListItemButton>
      <ListItemButton component={RouterLink} to="/favoritos"><ListItemIcon><StarOutlineIcon /></ListItemIcon><ListItemText primary="Favoritos" /></ListItemButton>
      <ListItemButton component={RouterLink} to="/ia"><ListItemIcon><AutoAwesomeOutlinedIcon /></ListItemIcon><ListItemText primary="IA" /></ListItemButton>
      {user.role === "ADMIN" && <ListItemButton component={RouterLink} to="/produtos/novo"><ListItemIcon><AddBoxOutlinedIcon /></ListItemIcon><ListItemText primary="Cadastrar produto" /></ListItemButton>}
      {user.role === "ADMIN" && <ListItemButton component={RouterLink} to="/usuarios"><ListItemIcon><GroupsOutlinedIcon /></ListItemIcon><ListItemText primary="Usuários" /></ListItemButton>}
    </List>

    <Divider sx={{ my: 3 }} />
    <ListItemButton onClick={signOut} sx={{ borderRadius: 3, border: "1px solid #f0d9d9", bgcolor: "#fdf4f4", px: 2, py: 1.5, gap: 1.5, "&:hover": { bgcolor: "#fbe9e9" } }}>
      <ListItemIcon sx={{ minWidth: 38, width: 38, height: 38, display: "grid", placeItems: "center", bgcolor: "#fbeaea", color: "#a13d3d", borderRadius: "11px" }}><LogoutIcon /></ListItemIcon>
      <ListItemText primary="Sair" primaryTypographyProps={{ fontSize: 14, fontWeight: 700, color: "#a13d3d" }} />
    </ListItemButton>
  </Container>;
}
