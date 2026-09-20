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
    background: "linear-gradient(145deg,#004f3d 0%,#006b4f 54%,#087458 100%)",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 50% 48%,rgba(255,255,255,.045),transparent 34%)",
      pointerEvents: "none",
    },
  }}>
    <Box component="img" src="/precify-logo-horizontal-white-exact.svg" alt="Precify" sx={{
      position: "relative",
      zIndex: 1,
      width: { xs: "min(78vw,330px)", sm: 380, md: 430 },
      height: "auto",
      animation: "splashLogoIn .46s cubic-bezier(.2,.8,.2,1) both",
      "@keyframes splashLogoIn": {
        from: { opacity: 0, transform: "translateY(5px) scale(.98)" },
        to: { opacity: 1, transform: "translateY(0) scale(1)" },
      },
      "@media (prefers-reduced-motion: reduce)": { animation: "none" },
    }} />
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
