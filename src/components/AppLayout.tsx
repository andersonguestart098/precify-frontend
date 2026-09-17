import { useEffect, useState, type FormEvent } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Box, Container, IconButton, Stack, TextField, Toolbar } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SearchIcon from "@mui/icons-material/Search";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import { BottomNav } from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import QuickAccessStrip from "./QuickAccessStrip";
import { rememberSearch } from "../services/api";

type GeoStatus = "idle" | "loading" | "ready" | "error";
const LOCATION_KEY = "precify-user-location";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const showSearch = location.pathname === "/inicio" || location.pathname === "/produtos";
  const isProducts = location.pathname === "/produtos";
  const keepWideCatalogLayout = location.pathname === "/inicio" || location.pathname.startsWith("/produtos");
  const [query, setQuery] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>(() => localStorage.getItem(LOCATION_KEY) ? "ready" : "idle");

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") ?? "");
  }, [location.pathname, location.search]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) void rememberSearch(query.trim()).catch(() => undefined);
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

  const requestLocation = () => {
    if (!navigator.geolocation || geoStatus === "loading") {
      if (!navigator.geolocation) setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(position => {
      const value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        updatedAt: Date.now(),
      };
      localStorage.setItem(LOCATION_KEY, JSON.stringify(value));
      setGeoStatus("ready");
      window.dispatchEvent(new CustomEvent("precify-location-changed", { detail: value }));
    }, () => setGeoStatus("error"), {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    });
  };

  return <Box minHeight="100dvh" sx={{
    "--header-height": { xs: "70px", md: "60px", xl: "70px" },
    "--sidebar-width": { md: "188px", xl: "224px" },
    "--bottom-nav-height": "70px", "--ai-overhang": "22px", "--content-clearance": "12px",
    background: location.pathname === "/ia"
      ? "#101614"
      : "radial-gradient(circle at 78% 8%,rgba(0,107,79,.06),transparent 24rem),#f7f9f8"
  }}>
    <DesktopSidebar />
    <Box sx={{ ml: { xs: 0, md: "var(--sidebar-width)" }, minWidth: 0, overflowX: "clip" }}>
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#006b4f", pt: "env(safe-area-inset-top, 0px)", borderBottom: 0 }}>
      <Toolbar sx={{ minHeight: "var(--header-height) !important", px: { xs: 2, sm: 3, md: 2.5, xl: 3 } }}>
        <Container maxWidth="xl" disableGutters>
          <Stack direction="row" alignItems="center" gap={{ xs: .45, md: 1.25, xl: 1.5 }}>
            {location.pathname !== "/inicio" && <IconButton
              aria-label="Voltar"
              onClick={() => navigate(-1)}
              sx={{
                width: 28,
                height: 28,
                p: 0,
                ml: -.35,
                mr: .1,
                color: "rgba(255,255,255,.86)",
                display: { xs: "inline-flex", md: "none" },
                transition: "background-color 160ms ease, color 160ms ease, transform 120ms ease",
                "&:hover": { bgcolor: "rgba(255,255,255,.08)", color: "#fff" },
                "&:active": { bgcolor: "rgba(255,255,255,.12)", transform: "scale(.94)" },
                "&.Mui-focusVisible": { outline: "2px solid rgba(255,255,255,.45)", outlineOffset: 1 }
              }}>
              <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
            </IconButton>}
            <Box component={RouterLink} to="/inicio" aria-label="Precify — início" sx={{ display: { xs: "flex", md: "none" }, flexShrink: 0, alignItems: "center", WebkitTapHighlightColor: "transparent" }}>
              <Box component="img" src={showSearch ? "/precify-mark.svg" : "/precify-logo-white.svg"} alt="Precify" sx={{
                width: showSearch ? 35 : { xs: 103, sm: 112 },
                height: showSearch ? 35 : 29,
                maxWidth: showSearch ? 35 : 112,
                objectFit: "contain",
              }} />
            </Box>

            <IconButton
              type="button"
              aria-label={geoStatus === "ready" ? "Localização atual ativada" : geoStatus === "loading" ? "Obtendo localização" : "Usar minha localização"}
              onClick={requestLocation}
              disabled={geoStatus === "loading"}
              sx={{
                display: { xs: "inline-flex", md: "none" }, width: 32, height: 32, p: .55, flexShrink: 0,
                color: geoStatus === "ready" ? "#d8fff1" : geoStatus === "error" ? "#ffd7d7" : "rgba(255,255,255,.82)",
                bgcolor: geoStatus === "ready" ? "rgba(255,255,255,.12)" : "transparent",
                border: geoStatus === "ready" ? "1px solid rgba(216,255,241,.24)" : "1px solid transparent",
                transition: "background-color 160ms ease,color 160ms ease,transform 160ms ease",
                "&:active": { transform: "scale(.94)" },
                "&.Mui-disabled": { color: "rgba(255,255,255,.48)" },
              }}
            >
              {geoStatus === "ready" ? <MyLocationRoundedIcon sx={{ fontSize: 18 }} /> : <LocationOnOutlinedIcon sx={{ fontSize: 19 }} />}
            </IconButton>

            {showSearch && <Box sx={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
              <Stack component="form" onSubmit={submitSearch} direction="row" alignItems="center" sx={{
                width: { xs: "100%", md: "82%", xl: "92%" }, maxWidth: { md: 600, xl: 680 }, minHeight: { xs: 40, md: 38, xl: 42 }, bgcolor: "rgba(255,255,255,.95)", borderRadius: 999, py: 0, pl: { xs: 1.25, md: 1.75, xl: 2 },
                pr: .2, boxShadow: "0 3px 12px rgba(19,56,46,.12)", border: "1px solid rgba(255,255,255,.42)",
                "& .MuiInputBase-input": { fontSize: { xs: "16px", md: 13, xl: 14 }, py: .65, WebkitTextSizeAdjust: "100%" },
                "& .MuiIconButton-root": { p: { xs: .58, md: .7, xl: .9 } },
                "& .MuiSvgIcon-root": { fontSize: { xs: 18, md: 19, xl: 21 } },
                touchAction: "manipulation",
              }}>
                <TextField fullWidth variant="standard" placeholder="Buscar materiais ou produtos" value={query} onChange={event => setQuery(event.target.value)}
                  slotProps={{ input: { disableUnderline: true }, htmlInput: { "aria-label": "Buscar materiais ou produtos", inputMode: "search" } }} />
                <IconButton
                  type="button"
                  aria-label="Abrir Assistente IA"
                  onClick={() => navigate("/ia")}
                  sx={{
                    color: "#007a59",
                    bgcolor: "transparent",
                    border: 0,
                    transition: "color 160ms ease, transform 160ms ease",
                    "& .MuiSvgIcon-root": {
                      filter: "drop-shadow(0 0 2px rgba(38,155,120,.42)) drop-shadow(0 0 5px rgba(38,155,120,.18))",
                      animation: "aiSparkle 2.4s ease-in-out infinite",
                    },
                    "&:hover": { bgcolor: "transparent", color: "#00906a", transform: "translateY(-1px)" },
                    "&:hover .MuiSvgIcon-root": { filter: "drop-shadow(0 0 3px rgba(38,155,120,.72)) drop-shadow(0 0 8px rgba(38,155,120,.32))" },
                    "&:active": { bgcolor: "transparent", transform: "scale(.95)" },
                    "@keyframes aiSparkle": {
                      "0%, 100%": { transform: "scale(1) rotate(0deg)", opacity: .92 },
                      "50%": { transform: "scale(1.08) rotate(5deg)", opacity: 1 },
                    },
                    "@media (prefers-reduced-motion: reduce)": { "& .MuiSvgIcon-root": { animation: "none" } },
                  }}
                ><AutoAwesomeIcon /></IconButton>
                <IconButton type="button" aria-label="Abrir filtros" onClick={openFilters} sx={{ color: "primary.dark" }}><TuneOutlinedIcon /></IconButton>
                <IconButton type="submit" aria-label="Buscar" sx={{ color: "primary.dark" }}><SearchIcon /></IconButton>
              </Stack>
            </Box>}

          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
    <Box key={location.pathname} sx={{
      pb: { xs: "calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))", md: 0 }, animation: "pageEnter 260ms cubic-bezier(.2,.8,.2,1) both",
      "@media (min-width:900px) and (max-width:1799.95px)": keepWideCatalogLayout ? {
        width: "119.05%",
        zoom: .84,
        translate: "0 0",
      } : {
        width: "119.05%",
        zoom: .84,
        translate: "-10.6% 0",
      },
      "@keyframes pageEnter": {
        from: { opacity: .55, transform: "translateY(5px)" },
        to: { opacity: 1, transform: "translateY(0)" }
      },
      "@media (prefers-reduced-motion: reduce)": { animation: "none" }
    }}>
      {location.pathname === "/inicio" && <QuickAccessStrip />}
      <Outlet />
    </Box>
    </Box>
    <BottomNav />
  </Box>;
}
