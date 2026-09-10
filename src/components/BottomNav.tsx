import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Paper, Stack, Typography } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonIcon from "@mui/icons-material/Person";

const items = [
  { to: "/inicio", label: "Início", icon: HomeOutlinedIcon, activeIcon: HomeIcon },
  { to: "/produtos", label: "Produtos", icon: Inventory2OutlinedIcon, activeIcon: Inventory2Icon },
  { to: "/ia", label: "IA", icon: AutoAwesomeIcon, activeIcon: AutoAwesomeIcon, featured: true },
  { to: "/favoritos", label: "Favoritos", icon: StarOutlineIcon, activeIcon: StarIcon },
  { to: "/perfil", label: "Perfil", icon: PersonOutlineIcon, activeIcon: PersonIcon },
];

export function BottomNav() {
  const location = useLocation();
  return <Paper elevation={0} sx={{
    display: { xs: "flex", md: "none" }, position: "fixed", left: 0, right: 0, bottom: 0, zIndex: theme => theme.zIndex.appBar,
    minHeight: 70, borderTop: "1px solid #e3ece6", borderRadius: 0, bgcolor: "#fff", pb: "env(safe-area-inset-bottom)", overflow: "visible"
  }}>
    <Stack direction="row" width="100%" alignItems="flex-end">
      {items.map(({ to, label, icon: Icon, activeIcon: ActiveIcon, featured }) => {
        const active = location.pathname === to || (to === "/produtos" && location.pathname.startsWith("/produtos/"));
        const DisplayIcon = active ? ActiveIcon : Icon;
        return <Stack key={to} component={RouterLink} to={to} flex={1} alignItems="center" justifyContent="center" gap={.25}
          aria-current={active ? "page" : undefined} sx={{
            position: "relative", minWidth: 0, minHeight: 70, py: 1.2, textDecoration: "none", color: active ? "#166b3b" : "#84928a",
            borderRadius: "16px 16px 0 0", WebkitTapHighlightColor: "transparent",
            transition: "color 180ms ease, background 180ms ease",
            "&::after": active ? {
              content: '""', position: "absolute", top: 0, left: "50%", width: 32, height: 3,
              borderRadius: "0 0 999px 999px", bgcolor: "#DDEFE5", transform: "translateX(-50%)"
            } : undefined,
            "&:hover": { color: "#0b6732", background: "linear-gradient(180deg,rgba(54,224,126,.13),rgba(25,138,74,.04))" },
            "&:focus-visible": { outline: "2px solid #36e07e", outlineOffset: -3 }
          }}>
          {featured ? <Box sx={{
            mt: -4.2, width: 58, height: 58, display: "grid", placeItems: "center", borderRadius: "50%", position: "relative",
            filter: "drop-shadow(0 5px 9px rgba(23,76,50,.16))",
            "&::before": {
              content: '""', position: "absolute", inset: 0, borderRadius: "inherit",
              background: "conic-gradient(from 0deg,#bfe9cf,#63d993,#198a4a,#78dfa1,#d8f4e2,#36b96c,#bfe9cf)",
              animation: "aiBorderOrbit 8s linear infinite"
            },
            "@keyframes aiBorderOrbit": { to: { transform: "rotate(360deg)" } },
            "@media (prefers-reduced-motion: reduce)": {
              "&::before": { animation: "none" },
              "& .ai-spark-icon, & .ai-spark-glow::before, & .ai-spark-glow::after": { animation: "none" }
            }
          }}>
            <Box sx={{
              width: 54, height: 54, display: "grid", placeItems: "center", borderRadius: "50%", color: "#fff",
              bgcolor: active ? "#166b3b" : "#198A4A", position: "relative", zIndex: 1,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,.24)"
            }}>
              <Box className="ai-spark-glow" sx={{
                position: "relative", display: "grid", placeItems: "center",
                "&::before, &::after": {
                  content: '""', position: "absolute", borderRadius: "50%", bgcolor: "#eafff1",
                  boxShadow: "0 0 5px rgba(255,255,255,.8)", animation: "aiTinySpark 3.6s ease-in-out infinite"
                },
                "&::before": { width: 3, height: 3, top: 1, right: 1 },
                "&::after": { width: 2, height: 2, bottom: 2, left: 2, animationDelay: "1.8s" },
                "@keyframes aiTinySpark": {
                  "0%, 100%": { opacity: .25, transform: "scale(.7)" },
                  "45%": { opacity: .9, transform: "scale(1.25)" }
                }
              }}>
                <DisplayIcon className="ai-spark-icon" sx={{
                  fontSize: 27, filter: "drop-shadow(0 0 0 rgba(255,255,255,0))",
                  animation: "aiSparkBreath 3.6s ease-in-out infinite",
                  "@keyframes aiSparkBreath": {
                    "0%, 100%": { opacity: .88, transform: "scale(.96)", filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" },
                    "50%": { opacity: 1, transform: "scale(1.04)", filter: "drop-shadow(0 0 4px rgba(255,255,255,.55))" }
                  }
                }} />
              </Box>
            </Box>
          </Box> : <DisplayIcon sx={{ fontSize: 22 }} />}
          <Typography noWrap sx={{ maxWidth: "100%", fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</Typography>
        </Stack>;
      })}
    </Stack>
  </Paper>;
}
