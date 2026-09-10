import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Stack } from "@mui/material";
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
import CompositionsPage from "./pages/CompositionsPage";
import UsersPage from "./pages/UsersPage";
import LaborPage from "./pages/LaborPage";
import AboutPage from "./pages/AboutPage";
import InstitutionalPage from "./pages/InstitutionalPage";
import ContactPage from "./pages/ContactPage";
function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user } = useSession(); const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (admin && user.role !== "ADMIN") return <Navigate to="/inicio" replace />;
  return <Outlet />;
}
function SessionRoutes() {
  const { checking, error, retry, signOut } = useSession();
  if (checking) return <Box minHeight="100dvh" display="grid" sx={{ placeItems: "center" }}><CircularProgress aria-label="Validando sessão" /></Box>;
  if (error) return <Stack gap={2} sx={{ maxWidth: 440, mx: "auto", mt: 10, p: 3 }}>
    <Alert severity="error">Não foi possível validar sua sessão. Verifique sua conexão.</Alert>
    <Button variant="contained" onClick={retry}>Tentar novamente</Button><Button onClick={signOut}>Voltar ao login</Button>
  </Stack>;
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/produtos" element={<SearchPage />} />
        <Route path="/ia" element={<AiPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/composicoes" element={<CompositionsPage />} />
        <Route path="/mao-de-obra" element={<LaborPage />} />
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
