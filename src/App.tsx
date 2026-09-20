import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Alert, Box, Button, Stack } from "@mui/material";
import { SessionProvider } from "./auth/SessionProvider";
import { useSession } from "./auth/session";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import AiPage from "./pages/AiPage";
import ProductPage from "./pages/ProductPage";
import ProductRegistrationPage from "./pages/ProductRegistrationPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import MyAreaPage from "./pages/MyAreaPage";
import CompositionsPage from "./pages/CompositionsPage";
import UsersPage from "./pages/UsersPage";
import AboutPage from "./pages/AboutPage";
import InstitutionalPage from "./pages/InstitutionalPage";
import ContactPage from "./pages/ContactPage";
import PlanningPage from "./pages/PlanningPage";
import LaborPage from "./pages/LaborPage";
import HistoryPage from "./pages/HistoryPage";
import ComparePage from "./pages/ComparePage";
import { refreshAppCache, warmAppCache } from "./services/appWarmCache";

function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user } = useSession(); const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (admin && user.role !== "ADMIN") return <Navigate to="/inicio" replace />;
  return <Outlet />;
}

function SplashScreen() {
  return <Stack minHeight="100dvh" alignItems="center" justifyContent="center" sx={{
    px: 3,
    overflow: "hidden",
    position: "relative",
    background: "linear-gradient(145deg,#004f3d 0%,#006b4f 52%,#087458 100%)",
    "&::before": {
      content: '""', position: "absolute", inset: 0,
      background: "radial-gradient(circle at 50% 42%,rgba(255,255,255,.075),transparent 34%)",
      pointerEvents: "none",
    },
    "&::after": {
      content: '""', position: "absolute", width: "70vw", height: "70vw", maxWidth: 720, maxHeight: 720,
      borderRadius: "50%", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
      background: "radial-gradient(circle,rgba(39,166,126,.10),transparent 68%)",
      filter: "blur(18px)", pointerEvents: "none",
    },
  }}>
    <Stack alignItems="center" gap={{ xs: 2.6, sm: 3 }} position="relative" zIndex={1}>
      <Box component="img" src="/precify-logo-white.svg" alt="Precify" sx={{
        width: { xs: "min(72vw,285px)", sm: 330, md: 360 },
        height: "auto",
        filter: "drop-shadow(0 10px 28px rgba(0,31,23,.16))",
        animation: "splashLogoIn .48s cubic-bezier(.2,.8,.2,1) both",
        "@keyframes splashLogoIn": {
          from: { opacity: 0, transform: "translateY(5px) scale(.975)" },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }} />
      <Box aria-label="Preparando o Precify" sx={{
        width: { xs: 96, sm: 112 }, height: 3, borderRadius: 999, overflow: "hidden",
        bgcolor: "rgba(255,255,255,.16)", boxShadow: "inset 0 1px 1px rgba(0,0,0,.05)",
      }}>
        <Box sx={{
          width: "42%", height: "100%", borderRadius: 999,
          background: "linear-gradient(90deg,rgba(255,255,255,.55),#fff,rgba(255,255,255,.72))",
          boxShadow: "0 0 9px rgba(255,255,255,.26)",
          animation: "splashLoad 1.05s ease-in-out infinite",
          "@keyframes splashLoad": {
            "0%": { transform: "translateX(-120%)" },
            "50%": { transform: "translateX(120%)" },
            "100%": { transform: "translateX(270%)" },
          },
          "@media (prefers-reduced-motion: reduce)": { animation: "none", width: "100%", opacity: .72 },
        }} />
      </Box>
    </Stack>
  </Stack>;
}

function SessionRoutes() {
  const { checking, error, retry, signOut, user } = useSession();
  const location = useLocation();
  const entryRedirectDone = useRef(false);
  const lastBackgroundRefresh = useRef(0);
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setCacheReady(false);
      entryRedirectDone.current = false;
      return;
    }

    let active = true;
    setCacheReady(false);
    const minimumSplash = new Promise<void>(resolve => window.setTimeout(resolve, 420));
    const cacheTimeout = new Promise<void>(resolve => window.setTimeout(resolve, 6500));

    void Promise.all([
      Promise.race([warmAppCache(user.id), cacheTimeout]),
      minimumSplash,
    ]).finally(() => {
      if (active) {
        lastBackgroundRefresh.current = Date.now();
        setCacheReady(true);
      }
    });

    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!user || !cacheReady) return;
    const refreshIfNeeded = () => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() - lastBackgroundRefresh.current < 5 * 60 * 1000) return;
      lastBackgroundRefresh.current = Date.now();
      void refreshAppCache(user.id);
    };
    window.addEventListener("focus", refreshIfNeeded);
    document.addEventListener("visibilitychange", refreshIfNeeded);
    return () => {
      window.removeEventListener("focus", refreshIfNeeded);
      document.removeEventListener("visibilitychange", refreshIfNeeded);
    };
  }, [user?.id, cacheReady]);

  if (checking || (user && !cacheReady)) return <SplashScreen />;
  if (error) return <Stack gap={2} sx={{ maxWidth: 440, mx: "auto", mt: 10, p: 3 }}>
    <Alert severity="error">Não foi possível validar sua sessão. Verifique sua conexão.</Alert>
    <Button variant="contained" onClick={retry}>Tentar novamente</Button><Button onClick={signOut}>Voltar ao login</Button>
  </Stack>;
  if (user && !entryRedirectDone.current) {
    entryRedirectDone.current = true;
    if (location.pathname !== "/inicio") return <Navigate to="/inicio" replace />;
  }
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/produtos" element={<SearchPage />} />
        <Route path="/ia" element={<AiPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/perfil" element={<MyAreaPage />} />
        <Route path="/conta" element={<ProfilePage />} />
        <Route path="/composicoes" element={<CompositionsPage />} />
        <Route path="/obras" element={<PlanningPage />} />
        <Route path="/mao-de-obra" element={<LaborPage />} />
        <Route path="/obras/:projectId/mao-de-obra" element={<LaborPage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="/comparar" element={<ComparePage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/institucional" element={<InstitutionalPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/produtos/:code" element={<ProductPage />} />
        <Route path="/busca" element={<Navigate to="/produtos" replace />} />
        <Route element={<ProtectedRoute admin />}>
          <Route path="/produtos/novo" element={<ProductRegistrationPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Route>
    </Route>
  </Routes>;
}

export default function App() {
  return <BrowserRouter><SessionProvider><SessionRoutes /></SessionProvider></BrowserRouter>;
}
