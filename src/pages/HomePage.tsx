import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Box, ButtonBase, Container, Skeleton, Stack, Typography } from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AccountGreeting from "../components/AccountGreeting";
import { SegmentCarousel } from "../components/SegmentCarousel";
import QuickAccessStrip from "../components/QuickAccessStrip";
import { catalogHeroTitleSx, catalogSectionTitleSx } from "../styles/catalogVisual";
import type { CatalogMaterial } from "../domain/search";
import { getCachedCatalog, loadCatalogCached } from "../services/appWarmCache";

export default function HomePage() {
  const navigate = useNavigate();
  const { geoStatus, geoLabel, locationText, requestLocation } = useOutletContext<{
    geoStatus: "idle" | "loading" | "ready" | "error";
    geoLabel: string;
    locationText: string;
    requestLocation: () => void;
  }>();
  const [catalog, setCatalog] = useState<CatalogMaterial[]>(() => getCachedCatalog() ?? []);
  const [catalogLoading, setCatalogLoading] = useState(() => !getCachedCatalog());
  useEffect(() => {
    let mounted = true;
    setCatalogLoading(!getCachedCatalog());
    loadCatalogCached()
      .then(data => { if (mounted) setCatalog(data); })
      .catch(() => undefined)
      .finally(() => { if (mounted) setCatalogLoading(false); });

    const syncFromCache = () => {
      const cached = getCachedCatalog();
      if (cached) setCatalog(cached);
    };
    window.addEventListener("precify-app-data-refreshed", syncFromCache);
    return () => {
      mounted = false;
      window.removeEventListener("precify-app-data-refreshed", syncFromCache);
    };
  }, []);

  return <Container maxWidth="xl" component="main" sx={{
    minHeight: { xs: "calc(100dvh - var(--header-height) - var(--mobile-context-height) - env(safe-area-inset-top, 0px) - var(--bottom-nav-height) - env(safe-area-inset-bottom, 0px))", md: "calc(100dvh - var(--header-height))" },
    pt: { xs: 2, md: 2.25, xl: 3.5 }, pb: { xs: "calc(var(--ai-overhang) + var(--content-clearance))", md: 2.5, xl: 4 },
    px: { xs: 2, sm: 3, md: 2.75, xl: 3 }, display: "flex", flexDirection: "column"
  }}>
    <AccountGreeting />

    <Box sx={{
      flex: { xs: 1, md: "initial" }, minHeight: 0, display: "flex", flexDirection: "column",
      justifyContent: { xs: "flex-end", md: "flex-start" },
    }}>
      <Box sx={{
        display: { xs: "block", md: "grid" },
        width: "100%",
        maxWidth: { md: 980, lg: 1100, xl: "none" },
        gridTemplateColumns: {
          md: "minmax(0,1fr) minmax(190px,214px)",
          lg: "minmax(0,1fr) minmax(210px,250px)",
          xl: "minmax(0,820px) minmax(275px,314px)",
        },
        alignItems: "start",
        columnGap: { md: 2, lg: 3, xl: 7 },
      }}>
        <Box minWidth={0}>
          <Typography component="h1" sx={catalogHeroTitleSx}>
            Encontre o custo certo para a sua obra.
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { md: 13, xl: 16 }, maxWidth: { md: 690, xl: 820 } }}
            mb={{ xs: 2.25, md: 1.75, xl: 3 }}>
            Pesquise e compare as opções para o seu projeto.
          </Typography>
        </Box>

        <ButtonBase
          onClick={requestLocation}
          disabled={geoStatus === "loading"}
          aria-label={geoStatus === "ready" ? `Localização atual: ${geoLabel}. Clique para atualizar.` : locationText}
          sx={{
            display: { xs: "none", md: "flex" },
            width: "100%", minWidth: 0, maxWidth: { md: 214, lg: 250, xl: 314 },
            justifySelf: "end", alignSelf: "start",
            mt: { md: .4, lg: .8, xl: 1.1 }, p: .35, gap: { md: .8, xl: 1 },
            alignItems: "center", justifyContent: "flex-start", textAlign: "left",
            color: "inherit", bgcolor: "transparent", borderRadius: "8px",
            transition: "transform 160ms ease,opacity 160ms ease",
            "@media (hover:hover)": {
              "&:hover": { transform: "translateY(-1px)" },
              "&:hover .location-pin": { transform: "translateY(-1px) scale(1.07)", filter: "drop-shadow(0 5px 8px rgba(0,107,79,.22))" },
              "&:hover .location-refresh": { transform: "rotate(26deg)", color: "#087458" },
              "&:hover .location-city": { color: "#006b4f" },
            },
            "&.Mui-disabled": { opacity: .68 },
            "&.Mui-focusVisible": { outline: "2px solid rgba(38,155,120,.42)", outlineOffset: 3 },
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
              "&:hover": { transform: "none" },
              "&:hover .location-pin, &:hover .location-refresh": { transform: "none" },
            },
          }}
        >
          <LocationOnRoundedIcon className="location-pin" sx={{
            fontSize: { md: 23, lg: 26, xl: 31 }, flexShrink: 0,
            color: geoStatus === "error" ? "#a55c56" : "#087458",
            filter: geoStatus === "error" ? "none" : "drop-shadow(0 3px 6px rgba(0,107,79,.17))",
            transition: "transform 160ms ease,filter 160ms ease",
          }} />

          <Box minWidth={0} flex={1}>
            <Stack direction="row" alignItems="center" gap={.45} minWidth={0}>
              <Typography sx={{
                fontSize: { md: 7.7, lg: 8.2, xl: 9.2 }, fontWeight: 850,
                letterSpacing: ".07em", textTransform: "uppercase", lineHeight: 1,
                color: geoStatus === "error" ? "#8d5a54" : "#638078",
              }}>
                Localização de referência
              </Typography>
              <RefreshRoundedIcon className="location-refresh" sx={{
                ml: "auto", fontSize: { md: 13, xl: 15 }, flexShrink: 0,
                color: geoStatus === "error" ? "#9c655f" : "#7c948c",
                transition: "transform 180ms ease,color 180ms ease",
              }} />
            </Stack>

            <Typography className="location-city" noWrap sx={{
              mt: .42, fontSize: { md: 10.6, lg: 11.5, xl: 13.2 }, fontWeight: 850,
              letterSpacing: "-.012em", lineHeight: 1.14,
              color: geoStatus === "error" ? "#8f504a" : "#214b3d",
              transition: "color 160ms ease",
            }}>
              {geoStatus === "loading" ? "Identificando sua região..." : geoStatus === "ready" ? geoLabel : geoStatus === "error" ? "Tentar identificar novamente" : "Definir minha localização"}
            </Typography>

            <Typography noWrap sx={{
              mt: .3, fontSize: { md: 7.8, lg: 8.4, xl: 9.6 }, lineHeight: 1.1, color: "#8a9994",
            }}>
              {geoStatus === "ready" ? "Base local para preços e resultados" : "Melhora preços e resultados por região"}
            </Typography>
          </Box>
        </ButtonBase>
      </Box>

      <QuickAccessStrip />

      <Box sx={{ mt: { xs: .7, md: .95, xl: 1.15 }, pb: { xs: .15, md: .45, xl: .7 } }}>
        {catalogLoading ? <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={catalogSectionTitleSx}>Explore por segmento</Typography>
            <Skeleton variant="rounded" width={58} height={24} sx={{ bgcolor: "rgba(0,107,79,.06)" }} />
          </Stack>
          <Stack direction="row" gap={{ xs: 2.5, sm: 4, md: 2.75, xl: 4 }} sx={{ minHeight: { xs: 92, md: 78, xl: 92 }, overflow: "hidden", px: .5 }}>
            {[0, 1, 2, 3].map(item => <Stack key={item} alignItems="center" gap={.8} flexShrink={0}>
              <Skeleton variant="circular" width={52} height={52} sx={{ bgcolor: "rgba(0,107,79,.09)" }} />
              <Skeleton variant="rounded" width={58} height={10} sx={{ bgcolor: "rgba(0,107,79,.07)" }} />
            </Stack>)}
          </Stack>
        </> : <SegmentCarousel catalog={catalog} selected="" onSelect={segmentCode => navigate(`/produtos?segmentCode=${encodeURIComponent(segmentCode)}`)} />}
      </Box>

      
    </Box>
  </Container>;
}
