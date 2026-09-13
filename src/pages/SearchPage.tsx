import { ResultSkeletons } from "../components/SearchSkeleton";
import { SegmentCarousel } from "../components/SegmentCarousel";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, Container, Drawer, IconButton, Paper, Pagination, Stack, Typography } from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddIcon from "@mui/icons-material/Add";
import AccountGreeting from "../components/AccountGreeting";
import { useAccount } from "../auth/session";
import { useFavorites } from "../hooks/useFavorites";
import { getCatalog, searchFavorites, searchProducts } from "../services/api";
import { createCatalogCriteria } from "../data/familyConfig";
import type { CatalogMaterial, CatalogSearchPage, TechnicalCriterion } from "../domain/search";
import { SearchFilters } from "../components/SearchFilters";
import { CatalogResultCard } from "../components/CatalogResultCard";

let catalogCache: CatalogMaterial[] | null = null;
const searchResponseCache = new Map<string, CatalogSearchPage>();

export default function SearchPage() {
  const user = useAccount();
  const favorites = useFavorites();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? ""; const familyCode = params.get("family") ?? "";
  const onlyFavorites = params.get("scope") === "favorites";
  const page = Math.min(1000000, Math.max(0, Number.parseInt(params.get("page") ?? "0") || 0));
  const criteria = useMemo(() => createCatalogCriteria(params.get("segmentCode") ?? "")
    .map(c => ({ ...c, value: params.get(c.key) ?? c.value })), [params]);
  const [catalogError, setCatalogError] = useState("");
  const [catalog, setCatalog] = useState<CatalogMaterial[]>(() => catalogCache ?? []);
  const [filterOpen, setFilterOpen] = useState(false);
  const [revision, setRevision] = useState(0);

  const searchKey = useMemo(() => JSON.stringify({
    query,
    familyCode,
    criteria: criteria.map(({ key, value }) => [key, value]),
    page,
    onlyFavorites,
    revision,
  }), [query, familyCode, criteria, page, onlyFavorites, revision]);

  const [response, setResponse] = useState<CatalogSearchPage | null>(() => searchResponseCache.get(searchKey) ?? null);
  const [loading, setLoading] = useState(() => !searchResponseCache.has(searchKey));
  const [error, setError] = useState("");

  const change = (values: Record<string, string>, reset = true) => setParams(current => {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(values)) { if (value) next.set(key, value); else next.delete(key); }
    if (reset) next.delete("page"); return next;
  }, { replace: true });

  useEffect(() => {
    if (catalogCache) {
      setCatalog(catalogCache);
      return;
    }
    const c = new AbortController();
    getCatalog(c.signal)
      .then(data => {
        if (c.signal.aborted) return;
        catalogCache = data;
        setCatalog(data);
      })
      .catch(e => { if (!c.signal.aborted) setCatalogError(e.message); });
    return () => c.abort();
  }, []);

  useEffect(() => {
    const c = new AbortController();
    const cached = searchResponseCache.get(searchKey);
    setError("");
    if (cached) {
      setResponse(cached);
      setLoading(false);
    } else {
      setResponse(null);
      setLoading(true);
    }

    const timer = window.setTimeout(() => {
      (onlyFavorites ? searchFavorites : searchProducts)({ familyCode, query, criteria, includeAlternatives: false }, page, 10, c.signal)
        .then(data => {
          if (c.signal.aborted) return;
          searchResponseCache.set(searchKey, data);
          setResponse(data);
        })
        .catch(e => { if (!c.signal.aborted) setError(e.message); })
        .finally(() => { if (!c.signal.aborted) setLoading(false); });
    }, 250);
    return () => { window.clearTimeout(timer); c.abort(); };
  }, [familyCode, query, criteria, page, onlyFavorites, revision, searchKey]);

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

  const clearFilters = () => change(Object.fromEntries([["q", ""], ...criteria.map(c => [c.key, ""]), ["family", ""], ["scope", ""]]));
  const hasFilters = Boolean(query) || onlyFavorites || Boolean(familyCode) || criteria.some(c => c.value);
  const filters = <SearchFilters catalog={catalog} criteria={criteria} familyCode={familyCode} onlyFavorites={onlyFavorites}
    onOnlyFavoritesChange={value => change({ scope: value ? "favorites" : "" })}
    onCriterionChange={(index: number, update: Partial<TechnicalCriterion>) => change({
      [criteria[index].key]: update.value ?? "", ...(criteria[index].key === "materialCode" ? { optionCode: "" } : {}),
    })}
    onFamilyChange={(family, segment) => change({ family, segmentCode: segment, materialCode: "", optionCode: "" })}
    onClearFilters={clearFilters} />;

  return <Container maxWidth="xl" sx={{
    pt: { xs: 2, md: 2.25, xl: 3.5 }, pb: { xs: 4, md: 3, xl: 5 }, px: { xs: 2, sm: 3, md: 2.75, xl: 3 }
  }}>
    <Box sx={{ display: "contents" }}>
      <Box sx={{ mb: { xs: 3, md: 2, xl: 3 } }}>
        <AccountGreeting />
        <Typography component="h1" sx={{
          maxWidth: { md: 720, xl: 940 }, fontWeight: 900, fontSize: { xs: 35, md: 38, xl: 49 }, letterSpacing: "-.045em", lineHeight: 1.03,
          mb: { xs: 1.5, md: .7, xl: 1.5 }, background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>Encontre o material certo pelas especificações.</Typography>
        <Typography color="text.secondary" sx={{ fontSize: { md: 13, xl: 16 } }}>Pesquise e compare as opções para o seu projeto.</Typography>
      </Box>
    </Box>

    <SegmentCarousel catalog={catalog} selected={params.get("segmentCode") ?? ""}
      onSelect={segmentCode => change({ segmentCode, family: "", materialCode: "", optionCode: "" })} />

    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "250px minmax(0,1fr)", xl: "300px minmax(0,1fr)" }}
      gap={{ xs: 3, md: 2, xl: 3 }} alignItems="start">
      <Paper variant="outlined" sx={{
        display: { xs: "none", md: "block" }, borderRadius: { md: 3, xl: 4 }, overflow: "hidden", position: "sticky",
        top: { md: 78, xl: 95 }
      }}>{filters}</Paper>

      <Box minWidth={0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} mb={{ xs: 2, md: 1.25, xl: 2 }}>
          <Box>
            <Typography variant="overline" color="primary" fontWeight={800} sx={{ fontSize: { md: 9.5, xl: 12 } }}>Resultados classificados</Typography>
            <Typography variant="h5" fontWeight={800} sx={{ fontSize: { md: 18, xl: 24 } }}>
              {loading && !response ? "Buscando..." : `${response?.totalElements ?? 0} materiais encontrados`}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" gap={.5}>
            <Button variant="text" startIcon={<TuneOutlinedIcon />} onClick={() => setFilterOpen(true)} sx={{ display: { xs: "inline-flex", md: "none" }, minWidth: 0, px: 1.25 }}>{hasFilters ? "Filtros ativos" : "Filtros"}</Button>
            {user.role === "ADMIN" && <IconButton aria-label="Cadastrar produto" component={RouterLink} to="/produtos/novo" color="primary"
              sx={{ width: { md: 34, xl: 40 }, height: { md: 34, xl: 40 } }}><AddIcon /></IconButton>}
          </Stack>
        </Stack>

        {(error || catalogError || favorites.error) && <Alert severity="error" sx={{ mb: 2 }}>{error || catalogError || favorites.error}</Alert>}
        {loading && !response ? <ResultSkeletons /> :
          <Stack gap={{ xs: 2, md: 1.25, xl: 2 }}>{response?.content.map(result => <CatalogResultCard key={result.material.materialCode} result={result}
            favorite={favorites.codes.has(result.material.materialCode)} favoriteBusy={favorites.loading || favorites.busy.has(result.material.materialCode)}
            onFavorite={() => { void favorites.toggle(result.material.materialCode).then(saved => { if (saved && onlyFavorites) setRevision(n => n + 1); }); }} />)}</Stack>}
        {!loading && !error && !response?.content.length && <Alert severity="info">{onlyFavorites ? "Nenhum favorito corresponde aos filtros selecionados." : "Nenhum material corresponde aos filtros. Tente ampliar sua busca."}</Alert>}
        {(response?.totalPages ?? 0) > 1 && <Stack mt={{ xs: 3, md: 2, xl: 3 }} alignItems="center"><Pagination color="primary" count={response!.totalPages} page={page + 1} disabled={loading}
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
