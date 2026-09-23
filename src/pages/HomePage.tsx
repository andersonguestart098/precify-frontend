import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Box, ButtonBase, Container, Skeleton, Stack, Typography } from "@mui/material";
import { HouseLine, Buildings, BuildingApartment, Storefront, Factory, Bank, RoadHorizon, MapTrifold, Check, GraduationCap, Hospital, ForkKnife, Bed, Warehouse, Lightning, Broadcast, Drop, Tree } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AccountGreeting from "../components/AccountGreeting";
import { SegmentCarousel } from "../components/SegmentCarousel";
import QuickAccessStrip from "../components/QuickAccessStrip";
import type { CatalogMaterial } from "../domain/search";
import { getCachedCatalog, loadCatalogCached } from "../services/appWarmCache";

const projectTypeGroups = [
  {
    code: "1", segment: "Residencial", icon: HouseLine, types: [
      ["1.1", "Unifamiliar (casa térrea / sobrado)"],
      ["1.2", "Multifamiliar horizontal (condomínio de casas)"],
      ["1.3", "Multifamiliar vertical – padrão econômico"],
      ["1.4", "Multifamiliar vertical – padrão médio"],
      ["1.5", "Multifamiliar vertical – alto padrão"],
      ["1.6", "Loteamento / urbanização residencial"],
    ],
  },
  {
    code: "2", segment: "Comercial", icon: Storefront, types: [
      ["2.1", "Varejo / lojas"],
      ["2.2", "Edifícios corporativos / escritórios"],
      ["2.3", "Shopping centers"],
      ["2.4", "Hotelaria / flats"],
      ["2.5", "Restaurantes / food service"],
    ],
  },
  {
    code: "3", segment: "Institucional", icon: Bank, types: [
      ["3.1", "Educacional (escolas, universidades)"],
      ["3.2", "Saúde (hospitais, clínicas, UBS)"],
      ["3.3", "Público / administrativo"],
      ["3.4", "Religioso"],
      ["3.5", "Cultural / esportivo"],
    ],
  },
  {
    code: "4", segment: "Industrial", icon: Factory, types: [
      ["4.1", "Galpões industriais"],
      ["4.2", "Plantas fabris / produtivas"],
      ["4.3", "Armazéns / centros logísticos"],
      ["4.4", "Agroindustrial"],
    ],
  },
  {
    code: "5", segment: "Infraestrutura", icon: RoadHorizon, types: [
      ["5.1", "Viária (rodovias, pontes, pavimentação)"],
      ["5.2", "Saneamento (água, esgoto)"],
      ["5.3", "Energia (subestações, transmissão)"],
      ["5.4", "Telecomunicações"],
      ["5.5", "Urbana (drenagem, urbanização)"],
    ],
  },
] as const;

const projectIcons: Record<string, Icon> = {
  "1.1": HouseLine, "1.2": Buildings, "1.3": BuildingApartment, "1.4": BuildingApartment, "1.5": BuildingApartment, "1.6": MapTrifold,
  "2.2": Buildings, "2.4": Bed, "2.5": ForkKnife,
  "3.1": GraduationCap, "3.2": Hospital,
  "4.1": Warehouse, "4.3": Warehouse, "4.4": Tree,
  "5.2": Drop, "5.3": Lightning, "5.4": Broadcast, "5.5": MapTrifold,
};
const projectTypes = projectTypeGroups.flatMap(group => group.types.map(([value, label]) => ({
  value, label, segment: group.segment, icon: projectIcons[value] ?? group.icon,
})));

export default function HomePage() {
  const navigate = useNavigate();
  const { geoStatus, geoLabel, locationText, requestLocation } = useOutletContext<{
    geoStatus: "idle" | "loading" | "ready" | "error";
    geoLabel: string;
    locationText: string;
    requestLocation: () => void;
  }>();
  const [projectType, setProjectType] = useState("");
  const [catalog, setCatalog] = useState<CatalogMaterial[]>(() => getCachedCatalog() ?? []);
  const [catalogLoading, setCatalogLoading] = useState(() => !getCachedCatalog());
  const [projectScrolling, setProjectScrolling] = useState(false);
  const projectRail = useRef<HTMLDivElement>(null);
  const projectScrollTimer = useRef<number | undefined>(undefined);

  const showProjectScrollbar = () => {
    setProjectScrolling(true);
    window.clearTimeout(projectScrollTimer.current);
    projectScrollTimer.current = window.setTimeout(() => setProjectScrolling(false), 700);
  };

  const moveProjectTypes = (direction: number) => {
    const rail = projectRail.current;
    if (rail) rail.scrollBy({
      left: direction * rail.clientWidth * .78,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

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

  useEffect(() => () => window.clearTimeout(projectScrollTimer.current), []);

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
          <Typography component="h1" sx={{
            maxWidth: { md: 690, xl: 820 },
            fontWeight: 900, fontSize: { xs: 35, md: 38, xl: 49 }, letterSpacing: "-.045em", lineHeight: 1.03,
            mb: { xs: 1, md: .65, xl: 1 },
            background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Encontre o material certo para a sua obra.
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
            <Typography sx={{
              fontSize: { xs: 14.8, md: 16, xl: 17.4 },
              fontWeight: 900,
              color: "#1f4c3d",
              letterSpacing: "-.02em",
            }}>Explore por segmento</Typography>
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

      <Box component="section" aria-labelledby="project-type-title" sx={{ maxWidth: { xs: 680, md: "100%" }, mt: { xs: 1.1, md: 1.55, xl: 1.9 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={{ xs: 1.1, md: .65, xl: 1.1 }}>
          <Typography id="project-type-title" sx={{
            fontSize: { xs: 14.8, md: 16, xl: 17.4 },
            fontWeight: 900,
            color: "#1f4c3d",
            letterSpacing: "-.02em",
          }}>O que você vai construir?</Typography>
          <Stack direction="row" gap={.25} sx={{ mr: { xs: 0, md: 6, xl: 0 } }}>
            <ButtonBase aria-label="Tipos anteriores" onClick={() => moveProjectTypes(-1)} sx={{ color: "#39725f", width: { md: 36, xl: 44 }, height: { md: 36, xl: 44 }, borderRadius: "50%", "&:focus-visible": { outline: "2px solid #006b4f" } }}>
              <ChevronLeftRoundedIcon sx={{ fontSize: { md: 20, xl: 24 } }} />
            </ButtonBase>
            <ButtonBase aria-label="Próximos tipos" onClick={() => moveProjectTypes(1)} sx={{ color: "#39725f", width: { md: 36, xl: 44 }, height: { md: 36, xl: 44 }, borderRadius: "50%", "&:focus-visible": { outline: "2px solid #006b4f" } }}>
              <ChevronRightRoundedIcon sx={{ fontSize: { md: 20, xl: 24 } }} />
            </ButtonBase>
          </Stack>
        </Stack>

        <Box ref={projectRail} role="group" aria-label="Tipos de obra" onScroll={showProjectScrollbar} sx={{
          display: "flex", gap: { xs: 1.05, md: .8, xl: 1.05 }, overflowX: "auto", px: .15, py: .45, scrollSnapType: "x proximity",
          WebkitOverflowScrolling: "touch", scrollbarWidth: "thin",
          scrollbarColor: projectScrolling ? "#a9d7c8 transparent" : "transparent transparent",
          "&::-webkit-scrollbar": { height: 3 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: projectScrolling ? "#a9d7c8" : "transparent", borderRadius: 999 }
        }}>
          {projectTypes.map(({ value, label, segment, icon: Icon }) => {
            const selected = projectType === value;
            return <ButtonBase key={value} aria-pressed={selected} onClick={() => setProjectType(selected ? "" : value)} sx={{
              width: { xs: 174, sm: 190, md: 158, xl: 190 }, minWidth: { xs: 174, sm: 190, md: 158, xl: 190 }, minHeight: { xs: 126, md: 104, xl: 126 }, px: { xs: 1.5, md: 1.2, xl: 1.5 }, py: { xs: 1.5, md: 1.05, xl: 1.5 }, borderRadius: "14px",
              scrollSnapAlign: "start", display: "flex", flexDirection: "column", gap: { xs: 1, md: .7, xl: 1 }, alignItems: "stretch", justifyContent: "flex-start", textAlign: "left",
              color: "#1a4f3e", border: "1px solid",
              borderColor: selected ? "rgba(0,107,79,.42)" : "rgba(0,107,79,.13)",
              background: selected
                ? "linear-gradient(145deg,#ffffff,#e8f3ed)"
                : "linear-gradient(145deg,rgba(255,255,255,.9),rgba(239,248,245,.74))",
              boxShadow: selected ? "0 0 0 3px rgba(38,155,120,.08),0 6px 16px rgba(0,107,79,.09)" : "0 3px 12px rgba(24,60,48,.045)",
              transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
              WebkitTapHighlightColor: "transparent",
              "@media (hover: hover)": { "&:hover": { transform: "translateY(-1px)", borderColor: "rgba(0,107,79,.3)", boxShadow: "0 6px 16px rgba(0,107,79,.08)" } },
              "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: 2 },
              "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } }
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ width: { xs: 40, md: 34, xl: 40 }, height: { xs: 40, md: 34, xl: 40 }, borderRadius: { xs: "12px", md: "10px", xl: "12px" }, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#edf8f4,#dff0ea)", color: "#295d4b", "& svg": { width: { md: 24, xl: 29 }, height: { md: 24, xl: 29 } } }}>
                  <Icon size={29} weight="duotone" aria-hidden="true" />
                </Box>
                <Box aria-hidden="true" sx={{ width: { xs: 18, md: 16, xl: 18 }, height: { xs: 18, md: 16, xl: 18 }, borderRadius: "50%", border: "1px solid", borderColor: selected ? "#70ad99" : "#dbe8e4", bgcolor: selected ? "#e8f3ed" : "transparent", display: "grid", placeItems: "center" }}>
                  {selected && <Check size={12} weight="bold" />}
                </Box>
              </Stack>
              <Box minWidth={0}>
                <Typography component="span" display="block" sx={{ color: "#55786c", fontSize: { xs: 10.5, md: 9.5, xl: 10.5 }, fontWeight: 600, lineHeight: 1.3 }}>{segment}</Typography>
                <Typography component="span" display="block" sx={{ fontSize: { xs: 12, md: 10.8, xl: 12 }, fontWeight: 700, lineHeight: 1.32, mt: .35 }}>{label}</Typography>
              </Box>
            </ButtonBase>;
          })}
        </Box>


      </Box>
    </Box>
  </Container>;
}
