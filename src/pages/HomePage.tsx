import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, ButtonBase, Container, Skeleton, Stack, Typography } from "@mui/material";
import { HouseLine, Buildings, BuildingApartment, Storefront, Factory, Bank, RoadHorizon, MapTrifold, Check, GraduationCap, Hospital, ForkKnife, Bed, Warehouse, Lightning, Broadcast, Drop, Tree } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AccountGreeting from "../components/AccountGreeting";
import { SegmentCarousel } from "../components/SegmentCarousel";
import { getCatalog } from "../services/api";
import type { CatalogMaterial } from "../domain/search";

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

let catalogCache: CatalogMaterial[] | null = null;

export default function HomePage() {
  const navigate = useNavigate();
  const [projectType, setProjectType] = useState("");
  const [catalog, setCatalog] = useState<CatalogMaterial[]>(catalogCache ?? []);
  const [catalogLoading, setCatalogLoading] = useState(!catalogCache);
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
    if (catalogCache) return;
    const controller = new AbortController();
    getCatalog(controller.signal)
      .then(data => { catalogCache = data; setCatalog(data); })
      .catch(() => undefined)
      .finally(() => { if (!controller.signal.aborted) setCatalogLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => () => window.clearTimeout(projectScrollTimer.current), []);

  return <Container maxWidth="xl" component="main" sx={{
    minHeight: { xs: "calc(100dvh - var(--header-height) - env(safe-area-inset-top, 0px) - var(--bottom-nav-height) - env(safe-area-inset-bottom, 0px))", md: "calc(100dvh - var(--header-height))" },
    pt: { xs: 2, md: 2.25, xl: 3.5 }, pb: { xs: "calc(var(--ai-overhang) + var(--content-clearance))", md: 2.5, xl: 4 },
    px: { xs: 2, sm: 3, md: 2.75, xl: 3 }, display: "flex", flexDirection: "column"
  }}>
    <AccountGreeting />

    <Box sx={{ flex: { xs: 1, md: "initial" }, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: { xs: "flex-end", md: "flex-start" } }}>
      <Typography component="h1" sx={{ maxWidth: { md: 690, xl: 820 }, fontWeight: 900, fontSize: { xs: 35, md: 38, xl: 49 }, letterSpacing: "-.045em", lineHeight: 1.03, mb: { xs: 1, md: .65, xl: 1 }, background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Encontre o material certo para a sua obra.
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: { md: 13, xl: 16 } }} mb={{ xs: 2.25, md: 1.75, xl: 3 }}>Pesquise e compare as opções para o seu projeto.</Typography>

      <Box component="section" aria-labelledby="project-type-title" sx={{ maxWidth: { xs: 680, md: "100%" }, mt: { md: .5, xl: 2 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={{ xs: 1.1, md: .65, xl: 1.1 }}>
        <Typography id="project-type-title" variant="h6" fontWeight={800} sx={{ fontSize: { md: 17, xl: 20 } }}>O que você vai construir?</Typography>
        <Stack direction="row" gap={.25}>
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

      <Box sx={{ mt: { xs: 1.5, md: 1.15, xl: 1.75 }, pb: { xs: 0, md: 1, xl: 2.5 } }}>
        {catalogLoading ? <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" color="#23463b" fontWeight={700}>Explore por segmento</Typography>
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
    </Box>
  </Container>;
}
