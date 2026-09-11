import { SearchSkeleton, ResultSkeletons } from "../components/SearchSkeleton";
import { SegmentCarousel } from "../components/SegmentCarousel";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Alert, Avatar, Box, Button, Container, Drawer, IconButton, Paper, Pagination, Stack, Typography } from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useAccount } from "../auth/session";
import { useFavorites } from "../hooks/useFavorites";
import { getCatalog, searchFavorites, searchProducts } from "../services/api";
import { createCatalogCriteria } from "../data/familyConfig";
import type { CatalogMaterial, CatalogSearchPage, TechnicalCriterion } from "../domain/search";
import { SearchFilters } from "../components/SearchFilters";
import { CatalogResultCard } from "../components/CatalogResultCard";
export default function SearchPage() {
  const user = useAccount(); const favorites = useFavorites();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? ""; const familyCode = params.get("family") ?? "";
  const onlyFavorites = params.get("scope") === "favorites";
  const page = Math.min(1000000, Math.max(0, Number.parseInt(params.get("page") ?? "0") || 0));
  const criteria = useMemo(() => createCatalogCriteria(params.get("segmentCode") ?? "")
    .map(c => ({ ...c, value: params.get(c.key) ?? c.value })), [params]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [catalog, setCatalog] = useState<CatalogMaterial[]>([]);
  const [response, setResponse] = useState<CatalogSearchPage | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const change = (values: Record<string, string>, reset = true) => setParams(current => {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(values)) { if (value) next.set(key, value); else next.delete(key); }
    if (reset) next.delete("page"); return next;
  }, { replace: true });
  useEffect(() => {
    const c = new AbortController();
    getCatalog(c.signal).then(setCatalog).catch(e => { if (!c.signal.aborted) setCatalogError(e.message); })
      .finally(() => { if (!c.signal.aborted) setCatalogLoading(false); });
    return () => c.abort();
  }, []);
  useEffect(() => {
    const c = new AbortController(); setLoading(true); setError("");
    const timer = window.setTimeout(() => {
      (onlyFavorites ? searchFavorites : searchProducts)({ familyCode, query, criteria, includeAlternatives: false }, page, 10, c.signal)
        .then(data => { if (!c.signal.aborted) setResponse(data); })
        .catch(e => { if (!c.signal.aborted) setError(e.message); })
        .finally(() => { if (!c.signal.aborted) setLoading(false); });
    }, 250);
    return () => { window.clearTimeout(timer); c.abort(); };
  }, [familyCode, query, criteria, page, onlyFavorites, revision]);
  useEffect(() => {
    const openFilters = () => setFilterOpen(true);
    window.addEventListener("open-product-filters", openFilters);
    return () => window.removeEventListener("open-product-filters", openFilters);
  }, []);
  useEffect(() => {
    if (params.get("filters") !== "open") return;
    setFilterOpen(true);
    setParams(current => {
      const next = new URLSearchParams(current);
      next.delete("filters");
      return next;
    }, { replace: true });
  }, [params, setParams]);
  if (catalogLoading || (loading && response === null)) return <SearchSkeleton />;
  const clearFilters = () => change(Object.fromEntries([["q", ""], ...criteria.map(c => [c.key, ""]), ["family", ""], ["scope", ""]]));
  const hasFilters = Boolean(query) || onlyFavorites || Boolean(familyCode) || criteria.some(c => c.value);
  const filters = <SearchFilters catalog={catalog} criteria={criteria} familyCode={familyCode} onlyFavorites={onlyFavorites}
    onOnlyFavoritesChange={value => change({ scope: value ? "favorites" : "" })}
    onCriterionChange={(index: number, update: Partial<TechnicalCriterion>) => change({
      [criteria[index].key]: update.value ?? "", ...(criteria[index].key === "materialCode" ? { optionCode: "" } : {}),
    })}
    onFamilyChange={(family, segment) => change({ family, segmentCode: segment, materialCode: "", optionCode: "" })}
    onClearFilters={clearFilters} />;
  return <Container maxWidth="xl" sx={{ py: { xs: 4, md: 5 } }}>
    <Box sx={{ display: "contents" }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" gap={2} alignItems="center" mb={2.5}>
          <Avatar src={user.avatarUrl || undefined} alt={user.name} sx={{ bgcolor: "#e3f2ed", color: "primary.dark", border: "2px solid #006b4f", width: 68, height: 68, boxShadow: "0 5px 16px #183c3026" }}>{user.name.charAt(0).toUpperCase()}</Avatar>
          <Box><Typography variant="body2">Olá,</Typography><Typography fontWeight={800} color="primary.dark">{user.name}!</Typography></Box>
        </Stack>
        <Typography component="h1" sx={{ fontWeight: 900, fontSize: { xs: 35, md: 49 }, letterSpacing: "-.045em", lineHeight: 1.05, mb: 1.5,
          background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Encontre o material certo pelas especificações.</Typography>
        <Typography color="text.secondary">Pesquise e compare as opções para o seu projeto.</Typography>
      </Box>
    </Box>
    <SegmentCarousel catalog={catalog} selected={params.get("segmentCode") ?? ""}
      onSelect={segmentCode => change({ segmentCode, family: "", materialCode: "", optionCode: "" })} />
    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "300px minmax(0,1fr)" }} gap={3} alignItems="start">
      <Paper variant="outlined" sx={{ display: { xs: "none", md: "block" }, borderRadius: 4, overflow: "hidden", position: "sticky", top: 95 }}>{filters}</Paper>
      <Box minWidth={0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} mb={2}>
          <Box><Typography variant="overline" color="primary" fontWeight={800}>Resultados classificados</Typography>
            <Typography variant="h5" fontWeight={800}>{loading ? "Buscando..." : `${response?.totalElements ?? 0} materiais encontrados`}</Typography></Box>
          <Stack direction="row" alignItems="center" gap={.5}>
            <Button variant="text" startIcon={<TuneOutlinedIcon />} onClick={() => setFilterOpen(true)} sx={{ display: { xs: "inline-flex", md: "none" }, minWidth: 0, px: 1.25 }}>{hasFilters ? "Filtros ativos" : "Filtros"}</Button>
            {user.role === "ADMIN" && <IconButton aria-label="Cadastrar produto" component={RouterLink} to="/produtos/novo" color="primary"><AddIcon /></IconButton>}
          </Stack>
        </Stack>
        {(error || catalogError || favorites.error) && <Alert severity="error" sx={{ mb: 2 }}>{error || catalogError || favorites.error}</Alert>}
        {loading ? <ResultSkeletons /> :
          <Stack gap={2}>{response?.content.map(result => <CatalogResultCard key={result.material.materialCode} result={result}
            favorite={favorites.codes.has(result.material.materialCode)} favoriteBusy={favorites.loading || favorites.busy.has(result.material.materialCode)}
            onFavorite={() => { void favorites.toggle(result.material.materialCode).then(saved => { if (saved && onlyFavorites) setRevision(n => n + 1); }); }} />)}</Stack>}
        {!loading && !error && !response?.content.length && <Alert severity="info">{onlyFavorites ? "Nenhum favorito corresponde aos filtros selecionados." : "Nenhum material corresponde aos filtros. Tente ampliar sua busca."}</Alert>}
        {(response?.totalPages ?? 0) > 1 && <Stack mt={3} alignItems="center"><Pagination color="primary" count={response!.totalPages} page={page + 1} disabled={loading}
          onChange={(_, value) => change({ page: String(value - 1) }, false)} /></Stack>}
      </Box>
    </Box>
    <Drawer anchor="bottom" open={filterOpen} onClose={() => setFilterOpen(false)} slotProps={{ paper: { sx: { borderRadius: "24px 24px 0 0", maxHeight: "85dvh" } } }}>
      {filters}<Box sx={{ p: 2, position: "sticky", bottom: 0, bgcolor: "background.paper" }}>
        <Button variant="contained" disableElevation fullWidth loading={loading} loadingPosition="start" startIcon={<VisibilityOutlinedIcon />} sx={{ minHeight: 52, borderRadius: "999px", textTransform: "none", fontWeight: 700, background: "linear-gradient(110deg,#1b5e47,#006b4f)", boxShadow: "0 5px 14px #006b4f20", "&:hover": { background: "#175641" } }} onClick={() => setFilterOpen(false)}>Ver resultados</Button>
      </Box>
    </Drawer>
  </Container>;
}
