import { useEffect, useState } from "react";
import { Alert, Container, Pagination, Stack, Typography } from "@mui/material";
import { ResultSkeletons } from "../components/SearchSkeleton";
import { CatalogResultCard } from "../components/CatalogResultCard";
import { useFavorites } from "../hooks/useFavorites";
import { searchFavorites } from "../services/api";
import type { CatalogSearchPage } from "../domain/search";
export default function FavoritesPage() {
  const favorites = useFavorites();
  const [page, setPage] = useState(0);
  const [response, setResponse] = useState<CatalogSearchPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const c = new AbortController(); setLoading(true); setError("");
    searchFavorites({ familyCode: "", query: "", criteria: [], includeAlternatives: false }, page, 10, c.signal)
      .then(data => { if (!c.signal.aborted) setResponse(data); })
      .catch(e => { if (!c.signal.aborted) setError(e.message); })
      .finally(() => { if (!c.signal.aborted) setLoading(false); });
    return () => c.abort();
  }, [page, revision]);
  return <Container maxWidth="sm" component="main" sx={{ py: { xs: 3, md: 5 } }}>
    <Typography variant="overline" color="primary" fontWeight={800}>Favoritos</Typography>
    <Typography component="h1" variant="h5" fontWeight={800} mb={.5}>
      {loading ? "Carregando..." : `${response?.totalElements ?? 0} produto(s) salvo(s)`}
    </Typography>
    <Typography color="text.secondary" mb={3}>Seus materiais marcados com estrela, num único lugar.</Typography>
    {(error || favorites.error) && <Alert severity="error" sx={{ mb: 2 }}>{error || favorites.error}</Alert>}
    {loading ? <ResultSkeletons /> :
      <Stack gap={2}>{response?.content.map(result => <CatalogResultCard key={result.material.materialCode} result={result}
        favorite={favorites.codes.has(result.material.materialCode)} favoriteBusy={favorites.loading || favorites.busy.has(result.material.materialCode)}
        onFavorite={() => { void favorites.toggle(result.material.materialCode).then(saved => { if (saved) setRevision(n => n + 1); }); }} />)}</Stack>}
    {!loading && !error && !response?.content.length &&
      <Alert severity="info">Você ainda não favoritou nenhum material. Toque na estrela de um resultado da busca para salvá-lo aqui.</Alert>}
    {(response?.totalPages ?? 0) > 1 && <Stack mt={3} alignItems="center"><Pagination color="primary" count={response!.totalPages} page={page + 1} disabled={loading}
      onChange={(_, value) => setPage(value - 1)} /></Stack>}
  </Container>;
}
