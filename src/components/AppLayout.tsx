import { useEffect, useState, type FormEvent } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Box, Container, IconButton, Stack, TextField, Toolbar } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SearchIcon from "@mui/icons-material/Search";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { BottomNav } from "./BottomNav";
import { DesktopExploreNav } from "./DesktopExploreNav";
import { DesktopMenu } from "./DesktopMenu";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const showSearch = location.pathname === "/inicio" || location.pathname === "/produtos";
  const isProducts = location.pathname === "/produtos";
  const [query, setQuery] = useState("");

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") ?? "");
  }, [location.pathname, location.search]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = isProducts ? new URLSearchParams(location.search) : new URLSearchParams();
    if (query.trim()) params.set("q", query.trim()); else params.delete("q");
    params.delete("page");
    navigate(`/produtos${params.size ? `?${params}` : ""}`);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const openFilters = () => {
    if (isProducts) {
      window.dispatchEvent(new CustomEvent("open-product-filters"));
      return;
    }
    navigate("/produtos?filters=open");
  };

  return <Box minHeight="100dvh" sx={{ background: "radial-gradient(circle at 78% 8%,rgba(25,138,74,.06),transparent 24rem),#f4f7fb" }}>
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#198A4A" }}>
      <Toolbar sx={{ minHeight: "70px !important", px: { xs: 2.5, sm: 3 } }}>
        <Container maxWidth="xl" disableGutters>
          <Stack direction="row" alignItems="center" gap={{ xs: .75, md: 1.5 }}>
            {!showSearch && <IconButton aria-label="Voltar" onClick={() => navigate(-1)} sx={{ color: "#fff", ml: -.8, p: .8, display: { xs: "inline-flex", md: "none" } }}>
              <ArrowBackIosNewIcon sx={{ fontSize: 19 }} />
            </IconButton>}
            <Box component={RouterLink} to="/inicio" aria-label="Precify — início" sx={{ display: "flex", flexShrink: 0, alignItems: "center", WebkitTapHighlightColor: "transparent" }}>
              <Box component="img" src="/precify-mark.svg" alt="Precify" sx={{ width: 39, height: 39 }} />
            </Box>

            {showSearch && <Box sx={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
              <Stack component="form" onSubmit={submitSearch} direction="row" alignItems="center" sx={{
                width: { xs: "94%", md: "92%" }, maxWidth: 680, minHeight: { xs: 38, md: 42 }, bgcolor: "rgba(255,255,255,.95)", borderRadius: 999, py: 0, pl: { xs: 1.5, md: 2 },
                pr: .25, boxShadow: "0 3px 12px rgba(11,103,50,.12)", border: "1px solid rgba(255,255,255,.42)",
                "& .MuiInputBase-input": { fontSize: { xs: 13, md: 14 }, py: .7 }, "& .MuiIconButton-root": { p: { xs: .7, md: 1 } }, "& .MuiSvgIcon-root": { fontSize: { xs: 20, md: 22 } }
              }}>
                <TextField fullWidth variant="standard" placeholder="Buscar materiais ou produtos" value={query} onChange={event => setQuery(event.target.value)}
                  slotProps={{ input: { disableUnderline: true }, htmlInput: { "aria-label": "Buscar materiais ou produtos" } }} />
                <IconButton type="button" aria-label="Abrir filtros" onClick={openFilters} sx={{ color: "primary.dark" }}><TuneOutlinedIcon /></IconButton>
                <IconButton type="submit" aria-label="Buscar" sx={{ color: "primary.dark" }}><SearchIcon /></IconButton>
              </Stack>
            </Box>}

            <Box sx={{ ml: showSearch ? 0 : "auto" }}><DesktopMenu /></Box>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
    <DesktopExploreNav />
    <Box key={location.pathname} sx={{
      pb: { xs: 10, md: 0 }, animation: "pageEnter 260ms cubic-bezier(.2,.8,.2,1) both",
      "@keyframes pageEnter": {
        from: { opacity: .55, transform: "translateY(5px)" },
        to: { opacity: 1, transform: "translateY(0)" }
      },
      "@media (prefers-reduced-motion: reduce)": { animation: "none" }
    }}><Outlet /></Box>
    <BottomNav />
  </Box>;
}
