import { ResultSkeletons } from "../components/SearchSkeleton";
import { SegmentCarousel } from "../components/SegmentCarousel";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, ButtonBase, CircularProgress, Container, Drawer, IconButton, Paper, Pagination, Skeleton, Stack, Typography } from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddIcon from "@mui/icons-material/Add";
import AccountGreeting from "../components/AccountGreeting";
import { useAccount } from "../auth/session";
import { useFavorites } from "../hooks/useFavorites";
import { searchFavorites, searchProducts } from "../services/api";
import { createCatalogCriteria } from "../data/familyConfig";
import type { CatalogMaterial, CatalogSearchPage, TechnicalCriterion } from "../domain/search";
import { SearchFilters } from "../components/SearchFilters";
import { CatalogResultCard } from "../components/CatalogResultCard";
import {
  getCachedCatalog,
  getCachedInitialSearch,
  loadCatalogCached,
  saveCachedInitialSearch,
} from "../services/appWarmCache";

const searchResponseCache = new Map<string, CatalogSearchPage>();

function isInitialSearch(query: string, familyCode: string, criteria: TechnicalCriterion[], page: number, onlyFavorites: boolean) {
  return !query.trim() && !familyCode && page === 0 && !onlyFavorites && criteria.every(criterion => !criterion.value.trim());
}

function SegmentRailSkeleton({ compact = false }: { compact?: boolean }) {
  return <Box aria-label="Carregando segmentos" sx={{
    display: "flex", overflow: "hidden", gap: compact ? { xs: .55, sm: .65 } : { md: 1.15, xl: 1.6 },
    py: compact ? .12 : { md: .45, xl: .8 }, px: compact ? .08 : 0,
  }}>
    {Array.from({ length: compact ? 6 : 8 }).map((_, index) => <Box key={index} sx={{
      width: compact ? { xs: 82, sm: 88 } : { md: 68, xl: 78 },
      minWidth: compact ? { xs: 82, sm: 88 } : { md: 68, xl: 78 },
      minHeight: compact ? 36 : { md: 78, xl: 94 },
      display: "flex", flexDirection: compact ? "row" : "column", alignItems: "center", justifyContent: compact ? "flex-start" : "center",
      gap: compact ? .45 : { md: .65, xl: 1 }, px: compact ? .5 : 0,
      borderRadius: compact ? "8px" : 2, border: compact ? "1px solid rgba(0,107,79,.055)" : 0,
      bgcolor: compact ? "rgba(255,255,255,.18)" : "transparent", flexShrink: 0,
    }}>
      <Skeleton variant="rounded" animation="wave" width={compact ? 22 : 44} height={compact ? 22 : 44} sx={{ borderRadius: compact ? "6px" : "50%", bgcolor: "rgba(0,107,79,.07)" }} />
      <Skeleton variant="rounded" animation="wave" width={compact ? 42 : 48} height={compact ? 7 : 9} sx={{ borderRadius: 999, bgcolor: "rgba(0,107,79,.055)" }} />
    </Box>)}
  </Box>;
}

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
  const [catalog, setCatalog] = useState<CatalogMaterial[]>(() => getCachedCatalog() ?? []);
  const [catalogLoading, setCatalogLoading] = useState(() => !getCachedCatalog());
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

  const initialCachedResponse = isInitialSearch(query, familyCode, criteria, page, onlyFavorites) ? getCachedInitialSearch() : null;
  const [response, setResponse] = useState<CatalogSearchPage | null>(() => searchResponseCache.get(searchKey) ?? initialCachedResponse);
  const [loading, setLoading] = useState(() => !(searchResponseCache.has(searchKey) || initialCachedResponse));
  const [error, setError] = useState("");

  const change = (values: Record<string, string>, reset = true) => setParams(current => {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(values)) { if (value) next.set(key, value); else next.delete(key); }
    if (reset) next.delete("page"); return next;
  }, { replace: true });

  useEffect(() => {
    let active = true;
    setCatalogLoading(!getCachedCatalog());
    loadCatalogCached()
      .then(data => { if (active) setCatalog(data); })
      .catch(e => { if (active) setCatalogError(e.message); })
      .finally(() => { if (active) setCatalogLoading(false); });

    const syncFromCache = () => {
      const cachedCatalog = getCachedCatalog();
      if (cachedCatalog) setCatalog(cachedCatalog);
      if (isInitialSearch(query, familyCode, criteria, page, onlyFavorites)) {
        const cachedInitial = getCachedInitialSearch();
        if (cachedInitial) {
          setResponse(cachedInitial);
          setLoading(false);
        }
      }
    };
    window.addEventListener("precify-app-data-refreshed", syncFromCache);
    return () => {
      active = false;
      window.removeEventListener("precify-app-data-refreshed", syncFromCache);
    };
  }, [query, familyCode, criteria, page, onlyFavorites]);

  useEffect(() => {
    const c = new AbortController();
    const defaultSearch = isInitialSearch(query, familyCode, criteria, page, onlyFavorites);
    const cached = searchResponseCache.get(searchKey) ?? (defaultSearch ? getCachedInitialSearch() : null);
    setError("");
    if (cached) {
      searchResponseCache.set(searchKey, cached);
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
          if (defaultSearch) saveCachedInitialSearch(data);
          setResponse(data);
        })
        .catch(e => { if (!c.signal.aborted) setError(e.message); })
        .finally(() => { if (!c.signal.aborted) setLoading(false); });
    }, cached ? 500 : 250);
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

  const clearFilters = () => {
    change(Object.fromEntries([["q", ""], ...criteria.map(c => [c.key, ""]), ["family", ""], ["scope", ""]]));
    setFilterOpen(false);
  };
  const hasFilters = Boolean(query) || onlyFavorites || Boolean(familyCode) || criteria.some(c => c.value);
  const filters = <SearchFilters catalog={catalog} criteria={criteria} familyCode={familyCode} onlyFavorites={onlyFavorites}
    onOnlyFavoritesChange={value => change({ scope: value ? "favorites" : "" })}
    onCriterionChange={(index: number, update: Partial<TechnicalCriterion>) => change({
      [criteria[index].key]: update.value ?? "", ...(criteria[index].key === "materialCode" ? { optionCode: "" } : {}),
    })}
    onFamilyChange={(family, segment) => change({ family, segmentCode: segment, materialCode: "", optionCode: "" })}
    onClearFilters={clearFilters} />;

  const segmentRail = catalogLoading
    ? <SegmentRailSkeleton />
    : <SegmentCarousel catalog={catalog} selected={params.get("segmentCode") ?? ""}
      onSelect={segmentCode => change({ segmentCode, family: "", materialCode: "", optionCode: "" })} />;

  return <Container maxWidth="xl" sx={{
    pt: { xs: 0, md: 2.25, xl: 3.5 }, pb: { xs: 4, md: 3, xl: 5 }, px: { xs: 2, sm: 3, md: 2.75, xl: 3 }
  }}>
    <Box sx={{
      display: { xs: "flex", md: "none" }, position: "sticky",
      top: "calc(var(--header-height) + env(safe-area-inset-top, 0px))", zIndex: theme => theme.zIndex.appBar - 1,
      mx: { xs: -2, sm: -3 }, px: { xs: 1.2, sm: 2 }, py: 0,
      minHeight: "var(--mobile-context-height)", alignItems: "center",
      bgcolor: "#f7f9f8", borderBottom: "1px solid rgba(0,107,79,.07)",
      "& > section": { width: "100%" }
    }}>
      {catalogLoading ? <SegmentRailSkeleton compact /> : <SegmentCarousel compactMobile catalog={catalog} selected={params.get("segmentCode") ?? ""}
        onSelect={segmentCode => change({ segmentCode, family: "", materialCode: "", optionCode: "" })} />}
    </Box>

    <Box sx={{ mb: { xs: 1.8, md: 2, xl: 3 }, pt: { xs: 2, md: 0 } }}>
      <AccountGreeting />
      <Typography component="h1" sx={{
        maxWidth: { md: 690, xl: 820 }, fontWeight: 900, fontSize: { xs: 35, md: 38, xl: 49 }, letterSpacing: "-.045em", lineHeight: 1.03,
        mb: { xs: 1, md: .65, xl: 1 }, background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
      }}>
        <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>Encontre o material certo.</Box>
        <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>Encontre o material certo pelas especificações.</Box>
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: { xs: 16, md: 13, xl: 16 } }}>Filtre e compare produtos por especificação.</Typography>
    </Box>

    <Box sx={{ display: { xs: "none", md: "block" } }}>{segmentRail}</Box>

    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "250px minmax(0,1fr)", xl: "300px minmax(0,1fr)" }}
      gap={{ xs: 3, md: 2, xl: 3 }} alignItems="start">
      <Paper variant="outlined" sx={{
        display: { xs: "none", md: "block" }, borderRadius: { md: 3, xl: 4 }, overflow: "hidden", position: "sticky",
        top: { md: 78, xl: 95 }
      }}>{filters}</Paper>

      <Box minWidth={0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} mb={{ xs: 1.2, md: 1.25, xl: 2 }}>
          <Box minWidth={0}>
            <Typography variant="overline" color="primary" fontWeight={800} sx={{ fontSize: { xs: 8.2, md: 9.5, xl: 12 }, lineHeight: 1.1 }}>Resultados classificados</Typography>
            <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: 14.5, sm: 15.5, md: 18, xl: 24 }, lineHeight: 1.2, mt: .2 }}>
              {loading && !response ? "Buscando..." : `${response?.totalElements ?? 0} materiais encontrados`}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" gap={.5}>
            <Button variant="text" startIcon={<TuneOutlinedIcon />} onClick={() => setFilterOpen(true)} sx={{ display: { xs: "inline-flex", md: "none" }, minWidth: 0, px: .8, fontSize: 11.5 }}>{hasFilters ? "Filtros ativos" : "Filtros"}</Button>
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
      {filters}<Box sx={{
        px: 2.5, py: 1.35, position: "sticky", bottom: 0, bgcolor: "rgba(255,255,255,.98)",
        borderTop: "1px solid #eef3f1", backdropFilter: "blur(10px)",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={.8}>
          <Typography sx={{
            fontSize: 12.5, fontWeight: 830, color: "#2f5c4c", letterSpacing: "-.01em",
          }}>
            Ver resultados
          </Typography>
          <ButtonBase onClick={() => setFilterOpen(false)} disabled={loading} aria-label="Ver resultados" sx={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            color: "#17664f",
            background: "linear-gradient(145deg,rgba(255,255,255,.98),rgba(232,244,239,.96))",
            border: "1px solid rgba(0,107,79,.14)",
            boxShadow: "0 4px 12px rgba(24,60,48,.08), inset 0 1px 0 rgba(255,255,255,.92)",
            transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",
            "&:active": { transform: "scale(.96)" },
            "&.Mui-disabled": { opacity: .5, boxShadow: "none" },
            "&.Mui-focusVisible": { outline: "2px solid rgba(38,155,120,.35)", outlineOffset: 3 },
            "@media (hover:hover)": {
              "&:hover": {
                transform: "translateY(-1px)", borderColor: "rgba(0,107,79,.24)",
                background: "linear-gradient(145deg,#ffffff,#e3f1ec)",
                boxShadow: "0 6px 15px rgba(24,60,48,.11), inset 0 1px 0 rgba(255,255,255,.96)",
              },
            },
            "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } },
          }}>
            {loading ? <CircularProgress size={18} sx={{ color: "inherit" }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 21 }} />}
          </ButtonBase>
        </Stack>
      </Box>
    </Drawer>
  </Container>;
}
