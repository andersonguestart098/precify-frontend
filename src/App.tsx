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
import { warmAppCache } from "./services/appWarmCache";

function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user } = useSession(); const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (admin && user.role !== "ADMIN") return <Navigate to="/inicio" replace />;
  return <Outlet />;
}

function SplashScreen() {
  return <Stack minHeight="100dvh" alignItems="center" justifyContent="center" sx={{
    bgcolor: "#006b4f", px: 3, overflow: "hidden", position: "relative",
    "&::before": { content: '""', position: "absolute", width: 320, height: 320, borderRadius: "50%", top: "18%", right: "-38%", background: "radial-gradient(circle,rgba(255,255,255,.07),transparent 68%)" },
    "&::after": { content: '""', position: "absolute", width: 260, height: 260, borderRadius: "50%", bottom: "12%", left: "-34%", background: "radial-gradient(circle,rgba(38,155,120,.24),transparent 70%)" },
  }}>
    <Stack alignItems="center" gap={2.3} position="relative" zIndex={1}>
      <Box component="img" src="/precify-logo-white.svg" alt="Precify" sx={{ width: "min(58vw,205px)", height: "auto" }} />
      <Box aria-label="Preparando o Precify" sx={{ width: 88, height: 3, borderRadius: 999, overflow: "hidden", bgcolor: "rgba(255,255,255,.16)" }}>
        <Box sx={{ width: "42%", height: "100%", borderRadius: 999, bgcolor: "rgba(255,255,255,.88)", animation: "splashLoad 1.05s ease-in-out infinite",
          "@keyframes splashLoad": { "0%": { transform: "translateX(-120%)" }, "50%": { transform: "translateX(120%)" }, "100%": { transform: "translateX(270%)" } },
          "@media (prefers-reduced-motion: reduce)": { animation: "none", width: "100%", opacity: .72 }
        }} />
      </Box>
    </Stack>
  </Stack>;
}

function SessionRoutes() {
  const { checking, error, retry, signOut, user } = useSession();
  const location = useLocation();
  const entryRedirectDone = useRef(false);
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
    const cacheTimeout = new Promise<void>(resolve => window.setTimeout(resolve, 3500));

    void Promise.all([
      Promise.race([warmAppCache(), cacheTimeout]),
      minimumSplash,
    ]).finally(() => {
      if (active) setCacheReady(true);
    });

    return () => { active = false; };
  }, [user?.id]);

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
