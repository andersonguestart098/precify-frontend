import { ResultSkeletons } from "../components/SearchSkeleton";
import { SegmentCarousel } from "../components/SegmentCarousel";
import { catalogHeroSubtitleSx, catalogHeroTitleSx, catalogSectionTitleSx } from "../styles/catalogVisual";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, ButtonBase, CircularProgress, Container, Drawer, IconButton, Paper, Pagination, Skeleton, Stack, Typography } from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddIcon from "@mui/icons-material/Add";
import ViewAgendaRoundedIcon from "@mui/icons-material/ViewAgendaRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import AccountGreeting from "../components/AccountGreeting";
import { useAccount } from "../auth/session";
import { useFavorites } from "../hooks/useFavorites";
import { searchCatalogProducts } from "../services/api";
import { useWorkspaceFavorites } from "../hooks/useWorkspaceFavorites";
import { CatalogProductCard } from "../components/CatalogProductCard";
import { createCatalogCriteria } from "../data/familyConfig";
import type { CatalogMaterial, ProductSearchPage, TechnicalCriterion } from "../domain/search";
import { SearchFilters } from "../components/SearchFilters";
import { CatalogResultCard } from "../components/CatalogResultCard";
import { getCachedCatalog, loadCatalogCached } from "../services/appWarmCache";
import { PRODUCT_PAGE_SIZE, productResponseCache, productSearchKey } from "../services/productSearchCache";
import { pageEnterSx } from "../styles/pageEnter";

const resultToolsLabelSx = {
  fontSize: { xs: 10.8, md: 10.5, xl: 11.3 },
  fontWeight: 800,
  lineHeight: 1.1,
  letterSpacing: ".055em",
  textTransform: "uppercase",
} as const;

function productCountLabel(page: ProductSearchPage | null) {
  const products = page?.productElements ?? page?.totalElements ?? 0;
  const materials = page?.materialElements ?? 0;
  // Only materials matched: count them instead of showing "0 produtos".
  const [count, noun] = !products && materials ? [materials, materials === 1 ? "material" : "materiais"] : [products, products === 1 ? "produto" : "produtos"];
  return `${count.toLocaleString("pt-BR")} ${noun} encontrado${count === 1 ? "" : "s"}`;
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
  const productFavorites = useWorkspaceFavorites();
  const [params, setParams] = useSearchParams();
  const brand = params.get("brand") ?? "";
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
  const [resultView, setResultView] = useState<"single" | "mosaic" | "list">("single");

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
    };
    window.addEventListener("precify-app-data-refreshed", syncFromCache);
    return () => {
      active = false;
      window.removeEventListener("precify-app-data-refreshed", syncFromCache);
    };
  }, []);

  const productKey = useMemo(() => productSearchKey({
    query, familyCode, segmentCode: params.get("segmentCode") ?? "", materialCode: params.get("materialCode") ?? "",
    brand, page, onlyFavorites, revision,
  }), [query, familyCode, params, brand, page, onlyFavorites, revision]);
  const [productResponse, setProductResponse] = useState<ProductSearchPage | null>(() => productResponseCache.get(productKey) ?? null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState("");

  useEffect(() => {
    const c = new AbortController();
    const cached = productResponseCache.get(productKey);
    setProductError("");
    if (cached) { setProductResponse(cached); setProductLoading(false); }
    else { setProductLoading(true); }
    const request = JSON.parse(productKey) as { query: string; familyCode: string; segmentCode: string; materialCode: string; brand: string; page: number; onlyFavorites: boolean };
    searchCatalogProducts({
      query: request.query, segmentCode: request.segmentCode, familyCode: request.familyCode,
      materialCode: request.materialCode, brand: request.brand, onlyFavorites: request.onlyFavorites,
    }, request.page, PRODUCT_PAGE_SIZE, c.signal)
      .then(data => { if (c.signal.aborted) return; productResponseCache.set(productKey, data); setProductResponse(data); })
      .catch(e => { if (!c.signal.aborted) setProductError(e.message); })
      .finally(() => { if (!c.signal.aborted) setProductLoading(false); });
    return () => c.abort();
  }, [productKey]);

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
    change(Object.fromEntries([["q", ""], ...criteria.map(c => [c.key, ""]), ["family", ""], ["scope", ""], ["brand", ""]]));
    setFilterOpen(false);
  };
  const hasFilters = Boolean(query) || onlyFavorites || Boolean(familyCode) || Boolean(brand) || criteria.some(c => c.value);
  const filters = <SearchFilters catalog={catalog} criteria={criteria} familyCode={familyCode} onlyFavorites={onlyFavorites}
    onOnlyFavoritesChange={value => change({ scope: value ? "favorites" : "" })}
    onCriterionChange={(index: number, update: Partial<TechnicalCriterion>) => change({
      [criteria[index].key]: update.value ?? "", ...(criteria[index].key === "materialCode" ? { optionCode: "", brand: "" } : {}),
    })}
    onFamilyChange={(family, segment) => change({ family, segmentCode: segment, materialCode: "", optionCode: "", brand: "" })}
    onClearFilters={clearFilters}
    mode="products" brand={brand} brands={productResponse?.brands} materialCounts={productResponse?.materialCounts}
    onBrandChange={next => change({ brand: next })}
    onMaterialChange={material => change({
      materialCode: material?.materialCode ?? "", optionCode: "", brand: "",
      ...(material ? { family: material.familyCode, segmentCode: material.segmentCode } : {}),
    })} />;

  const segmentRail = catalogLoading
    ? <SegmentRailSkeleton />
    : <SegmentCarousel catalog={catalog} selected={params.get("segmentCode") ?? ""}
      onSelect={segmentCode => change({ segmentCode, family: "", materialCode: "", optionCode: "", brand: "" })} />;

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
        onSelect={segmentCode => change({ segmentCode, family: "", materialCode: "", optionCode: "", brand: "" })} />}
    </Box>

    <Box sx={{ mb: { xs: 1.25, md: 2, xl: 3 }, pt: { xs: 1.5, md: 0 } }}>
      <AccountGreeting />
      <Box sx={pageEnterSx}>
        <Typography component="h1" sx={catalogHeroTitleSx}>
          Encontre o material pela especificação.
        </Typography>
        <Typography color="text.secondary" sx={catalogHeroSubtitleSx}>Filtre e compare produtos por especificação.</Typography>
      </Box>
    </Box>

    <Box sx={{ ...pageEnterSx, display: { xs: "none", md: "block" } }}>{segmentRail}</Box>

    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "250px minmax(0,1fr)", xl: "300px minmax(0,1fr)" }}
      gap={{ xs: 3, md: 2, xl: 3 }} alignItems="start" sx={pageEnterSx}>
      <Paper variant="outlined" sx={{
        display: { xs: "none", md: "block" }, borderRadius: { md: 3, xl: 4 }, overflow: "hidden", position: "sticky",
        top: { md: 78, xl: 95 }
      }}>{filters}</Paper>

      <Box minWidth={0}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }} gap={{ xs: .9, sm: 1 }} mb={{ xs: 1.2, md: 1.25, xl: 2 }}
          sx={{ display: { md: "grid" }, gridTemplateColumns: { md: "minmax(0,1fr) auto" } }}>
          <Box minWidth={0}>
            <Typography variant="overline" color="primary" sx={resultToolsLabelSx}>Resultados classificados</Typography>
            <Typography component="h2" sx={{ ...catalogSectionTitleSx, lineHeight: 1.2, mt: .25 }}>
              {productLoading && !productResponse ? "Buscando..." : productCountLabel(productResponse)}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" justifyContent={{ xs: "space-between", sm: "flex-end" }} gap={.65}
            sx={{ minWidth: 0, justifySelf: { md: "end" } }}>
            <Button variant="text" startIcon={<TuneOutlinedIcon />} onClick={() => setFilterOpen(true)}
              sx={{ ...resultToolsLabelSx, display: { xs: "inline-flex", md: "none" }, minWidth: 0, px: .65 }}>
              {hasFilters ? "Filtros ativos" : "Filtros"}
            </Button>
            <Stack direction="row" alignItems="center" gap={.4}>
              <Box sx={{
                display: "flex", alignItems: "center", gap: .12, p: .18,
                border: "1px solid rgba(0,107,79,.10)", borderRadius: "9px", bgcolor: "rgba(255,255,255,.78)",
                boxShadow: { xs: "0 2px 8px rgba(21,72,56,.035)", md: "none" },
              }}>
                <IconButton size="small" aria-label="Exibir produtos em uma coluna" aria-pressed={resultView === "single"}
                  onClick={() => setResultView("single")} sx={{
                    width: { xs: 32, md: 30 }, height: { xs: 32, md: 30 }, borderRadius: "7px",
                    color: resultView === "single" ? "#17664f" : "#789087",
                    bgcolor: resultView === "single" ? "#e8f4ef" : "transparent",
                  }}>
                  <ViewAgendaRoundedIcon sx={{ fontSize: { xs: 18, md: 17 } }} />
                </IconButton>
                <IconButton size="small" aria-label="Exibir produtos em duas colunas" aria-pressed={resultView === "mosaic"}
                  onClick={() => setResultView("mosaic")} sx={{
                    width: { xs: 32, md: 30 }, height: { xs: 32, md: 30 }, borderRadius: "7px",
                    color: resultView === "mosaic" ? "#17664f" : "#789087",
                    bgcolor: resultView === "mosaic" ? "#e8f4ef" : "transparent",
                  }}>
                  <ViewModuleRoundedIcon sx={{ fontSize: { xs: 18, md: 17 } }} />
                </IconButton>
                <IconButton size="small" aria-label="Exibir produtos em lista compacta" aria-pressed={resultView === "list"}
                  onClick={() => setResultView("list")} sx={{
                    width: { xs: 32, md: 30 }, height: { xs: 32, md: 30 }, borderRadius: "7px",
                    color: resultView === "list" ? "#17664f" : "#789087",
                    bgcolor: resultView === "list" ? "#e8f4ef" : "transparent",
                  }}>
                  <ViewListRoundedIcon sx={{ fontSize: { xs: 18, md: 17 } }} />
                </IconButton>
              </Box>
              {user.role === "ADMIN" && <IconButton aria-label="Cadastrar produto" component={RouterLink} to="/produtos/novo" color="primary"
                sx={{ width: { xs: 34, md: 34, xl: 40 }, height: { xs: 34, md: 34, xl: 40 } }}><AddIcon /></IconButton>}
            </Stack>
          </Stack>
        </Stack>

        {(productError || catalogError || productFavorites.error) && <Alert severity="error" sx={{ mb: 2 }}>{productError || catalogError || productFavorites.error}</Alert>}
        {productLoading && !productResponse ? <ResultSkeletons /> : <Box sx={{
          display: "grid",
          gridTemplateColumns: resultView === "mosaic" ? { xs: "repeat(2,minmax(0,1fr))", md: "repeat(2,minmax(0,1fr))" } : "1fr",
          gap: resultView === "list" ? { xs: .45, md: .65, xl: .8 } : resultView === "mosaic" ? { xs: .8, sm: 1, md: 1.25, xl: 2 } : { xs: 1.1, md: 1.25, xl: 2 },
          alignItems: "stretch", opacity: productLoading ? .6 : 1, transition: "opacity 160ms",
        }}>{productResponse?.content.map(result => {
          // The product's parent is the material: a material without products is shown as the material itself.
          if (result.type === "MATERIAL" && result.material) {
            const code = result.material.material.materialCode;
            return <CatalogResultCard key={`material:${code}`} result={result.material} layout={resultView}
              favorite={favorites.codes.has(code)} favoriteBusy={favorites.loading || favorites.busy.has(code)}
              onFavorite={() => { void favorites.toggle(code); }} />;
          }
          const product = result.product;
          if (!product) return null;
          return <CatalogProductCard key={product.productCode} result={{ ...result, product }} layout={resultView}
            material={catalog.find(item => item.materialCode === product.materialCode)}
            favorite={productFavorites.favorites.PRODUCT.has(product.productCode)}
            favoriteBusy={productFavorites.loading || productFavorites.isBusy("PRODUCT", product.productCode)}
            onFavorite={() => { void productFavorites.toggle("PRODUCT", product.productCode).then(saved => { if (saved && onlyFavorites) setRevision(n => n + 1); }); }} />;
        })}</Box>}
        {!productLoading && !productError && productResponse && !productResponse.content.length && <Alert severity="info">
          {onlyFavorites ? "Nenhum produto favorito corresponde aos filtros." : "Nenhum produto corresponde aos filtros. Tente ampliar sua busca."}
        </Alert>}
        {(productResponse?.totalPages ?? 0) > 1 && <Stack mt={{ xs: 3, md: 2, xl: 3 }} alignItems="center"><Pagination color="primary"
          count={productResponse!.totalPages} page={page + 1} disabled={productLoading}
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
          <ButtonBase onClick={() => setFilterOpen(false)} disabled={productLoading} aria-label="Ver resultados" sx={{
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
            {productLoading ? <CircularProgress size={18} sx={{ color: "inherit" }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 21 }} />}
          </ButtonBase>
        </Stack>
      </Box>
    </Drawer>
  </Container>;
}
