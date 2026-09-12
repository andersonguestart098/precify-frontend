import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Alert, Box, Button, Chip, CircularProgress, Container, Divider, Stack, Typography } from "@mui/material";
import { clearHistory, listHistory, type SearchHistory } from "../services/api";

type HistoryRow = SearchHistory & { count?: number };

const relativeDate = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((start - target) / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" });
};

export default function HistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    listHistory()
      .then(value => { if (active) setRows(value as HistoryRow[]); })
      .catch(error => { if (active) setError(error instanceof Error ? error.message : "Não foi possível carregar o histórico."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  const recurring = useMemo(() => [...rows]
    .sort((a, b) => (b.count ?? 1) - (a.count ?? 1) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter(row => (row.count ?? 1) > 1)
    .slice(0, 5), [rows]);

  const clear = async () => {
    if (!window.confirm("Limpar todo o seu histórico de pesquisas?")) return;
    setBusy(true); setError("");
    try { await clearHistory(); setRows([]); }
    catch (error) { setError(error instanceof Error ? error.message : "Não foi possível limpar o histórico."); }
    finally { setBusy(false); }
  };

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 3, md: 6 } }}>
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} gap={2}>
        <Box>
          <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.4 }}>Sua atividade</Typography>
          <Typography component="h1" sx={{ mt: .4, fontSize: { xs: 34, md: 46 }, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-.045em",
            background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Histórico de buscas
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 640, lineHeight: 1.7 }}>
            Retome pesquisas recentes e acesse rapidamente os termos que você consulta com mais frequência.
          </Typography>
        </Box>
        <Button disabled={busy || !rows.length} onClick={() => void clear()} startIcon={<DeleteSweepOutlinedIcon />} color="inherit"
          sx={{ alignSelf: { xs: "flex-start", sm: "auto" }, textTransform: "none", color: "#6d7d77", fontWeight: 700 }}>
          Limpar histórico
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 2.5 }}>{error}</Alert>}

      {busy ? <Box minHeight={260} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box> : !rows.length ?
        <Box sx={{ mt: 5, py: 7, textAlign: "center", borderTop: "1px solid #e4ece9", borderBottom: "1px solid #e4ece9" }}>
          <HistoryRoundedIcon sx={{ fontSize: 40, color: "#8ca199" }} />
          <Typography fontWeight={850} color="#284d40" mt={1.2}>Nenhuma pesquisa por aqui ainda.</Typography>
          <Typography color="text.secondary" fontSize={14} mt={.5}>As buscas feitas no Precify vão aparecer automaticamente nesta página.</Typography>
          <Button component={Link} to="/produtos" variant="contained" sx={{ mt: 2.2, borderRadius: 999 }}>Explorar materiais</Button>
        </Box> : <>
          {recurring.length > 0 && <Box sx={{ mt: { xs: 4, md: 5 } }}>
            <Stack direction="row" alignItems="center" gap={.7} mb={1.5}>
              <LocalFireDepartmentRoundedIcon sx={{ color: "#d96c32", fontSize: 20 }} />
              <Typography sx={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 850, color: "#6c7f78" }}>Mais recorrentes</Typography>
            </Stack>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {recurring.map(row => <Chip key={row.id} component={Link} clickable to={`/produtos?q=${encodeURIComponent(row.query)}`}
                icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: "16px !important" }} />}
                label={`${row.query} · ${Math.max(2, row.count ?? 1)}x`}
                sx={{ height: 36, borderRadius: 999, bgcolor: "#f5f8f7", color: "#244b3e", border: "1px solid #e0e9e6", fontWeight: 700,
                  textDecoration: "none", "& .MuiChip-icon": { color: "#d96c32" }, "&:hover": { bgcolor: "#edf5f2" } }} />)}
            </Stack>
          </Box>}

          <Box sx={{ mt: { xs: 4, md: 5 } }}>
            <Stack direction="row" alignItems="center" gap={.7} mb={1.2}>
              <HistoryRoundedIcon sx={{ color: "#4f7769", fontSize: 19 }} />
              <Typography sx={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 850, color: "#6c7f78" }}>Pesquisas recentes</Typography>
            </Stack>
            <Box sx={{ borderTop: "1px solid #e3ebe8", borderBottom: "1px solid #e3ebe8" }}>
              {rows.map((row, index) => <Box key={row.id} component={Link} to={`/produtos?q=${encodeURIComponent(row.query)}`}
                sx={{ display: "grid", gridTemplateColumns: "38px minmax(0,1fr) auto", gap: 1.5, alignItems: "center", py: 1.65, px: { xs: .25, sm: .75 },
                  textDecoration: "none", color: "inherit", borderTop: index ? "1px solid #edf1ef" : 0, transition: "background-color 160ms ease", "&:hover": { bgcolor: "#f7faf9" } }}>
                <Box sx={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "#eef5f2", color: "#356554" }}>
                  <SearchRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box minWidth={0}>
                  <Typography fontWeight={750} color="#21483b" noWrap>{row.query}</Typography>
                  <Typography color="text.secondary" fontSize={12.5}>{(row.count ?? 1) > 1 ? `Pesquisado ${row.count} vezes` : "1 pesquisa"}</Typography>
                </Box>
                <Typography color="text.secondary" fontSize={12.5} whiteSpace="nowrap">{relativeDate(row.createdAt)}</Typography>
              </Box>)}
            </Box>
          </Box>
        </>}
    </Box>
  </Container>;
}
