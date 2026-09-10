import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Container, Stack, Typography } from "@mui/material";
import { clearHistory, listHistory, type SearchHistory } from "../services/api";
export default function HistoryPage() {
  const [rows, setRows] = useState<SearchHistory[]>([]); const [error, setError] = useState(""); const [busy, setBusy] = useState(true);
  useEffect(() => { let active = true; listHistory().then(v => { if (active) setRows(v); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setBusy(false); }); return () => { active = false; }; }, []);
  const clear = async () => { if (!window.confirm("Limpar seu histórico de pesquisas?")) return; setBusy(true); try { await clearHistory(); setRows([]); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao limpar."); } finally { setBusy(false); } };
  return <Container maxWidth="md" sx={{ py: 4 }}><Typography component="h1" variant="h4" mb={2}>Histórico de buscas</Typography>{error && <Alert severity="error">{error}</Alert>}{busy ? <Typography role="status">Carregando…</Typography> : !rows.length && <Typography>Nenhuma pesquisa salva.</Typography>}<Stack gap={1} my={2}>{rows.map(row => <Button key={row.id} component={Link} to={`/produtos?q=${encodeURIComponent(row.query)}`} sx={{ justifyContent: "space-between", border: "1px solid #dce9df", borderRadius: 2 }}><span>{row.query}</span><Typography variant="caption">{new Date(row.createdAt).toLocaleDateString("pt-BR")}</Typography></Button>)}</Stack><Button disabled={busy || !rows.length} onClick={() => void clear()}>Limpar histórico</Button></Container>;
}
