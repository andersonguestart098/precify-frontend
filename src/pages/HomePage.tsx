import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, ButtonBase, Container, Skeleton, Stack, Typography } from "@mui/material";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AddRoadOutlinedIcon from "@mui/icons-material/AddRoadOutlined";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useAccount } from "../auth/session";
import { SegmentCarousel } from "../components/SegmentCarousel";
import { getCatalog } from "../services/api";
import type { CatalogMaterial } from "../domain/search";

const projectTypeGroups = [
  {
    code: "1", segment: "Residencial", icon: HomeWorkOutlinedIcon, types: [
      ["1.1", "Unifamiliar (casa térrea / sobrado)"],
      ["1.2", "Multifamiliar horizontal (condomínio de casas)"],
      ["1.3", "Multifamiliar vertical – padrão econômico"],
      ["1.4", "Multifamiliar vertical – padrão médio"],
      ["1.5", "Multifamiliar vertical – alto padrão"],
      ["1.6", "Loteamento / urbanização residencial"],
    ],
  },
  {
    code: "2", segment: "Comercial", icon: StorefrontOutlinedIcon, types: [
      ["2.1", "Varejo / lojas"],
      ["2.2", "Edifícios corporativos / escritórios"],
      ["2.3", "Shopping centers"],
      ["2.4", "Hotelaria / flats"],
      ["2.5", "Restaurantes / food service"],
    ],
  },
  {
    code: "3", segment: "Institucional", icon: AccountBalanceOutlinedIcon, types: [
      ["3.1", "Educacional (escolas, universidades)"],
      ["3.2", "Saúde (hospitais, clínicas, UBS)"],
      ["3.3", "Público / administrativo"],
      ["3.4", "Religioso"],
      ["3.5", "Cultural / esportivo"],
    ],
  },
  {
    code: "4", segment: "Industrial", icon: FactoryOutlinedIcon, types: [
      ["4.1", "Galpões industriais"],
      ["4.2", "Plantas fabris / produtivas"],
      ["4.3", "Armazéns / centros logísticos"],
      ["4.4", "Agroindustrial"],
    ],
  },
  {
    code: "5", segment: "Infraestrutura", icon: AddRoadOutlinedIcon, types: [
      ["5.1", "Viária (rodovias, pontes, pavimentação)"],
      ["5.2", "Saneamento (água, esgoto)"],
      ["5.3", "Energia (subestações, transmissão)"],
      ["5.4", "Telecomunicações"],
      ["5.5", "Urbana (drenagem, urbanização)"],
    ],
  },
] as const;

const projectTypes = projectTypeGroups.flatMap(group => group.types.map(([value, label]) => ({
  value, label, segment: group.segment, icon: group.icon,
})));

let catalogCache: CatalogMaterial[] | null = null;

export default function HomePage() {
  const user = useAccount();
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
    minHeight: { xs: "calc(100dvh - var(--header-height) - env(safe-area-inset-top, 0px) - var(--bottom-nav-height) - env(safe-area-inset-bottom, 0px))", md: "calc(100dvh - 70px)" },
    pt: { xs: 2, md: 3.5 }, pb: { xs: "calc(var(--ai-overhang) + var(--content-clearance))", md: 4 }, display: "flex", flexDirection: "column"
  }}>
    <Stack direction="row" gap={2.25} alignItems="center" mb={{ xs: 3, md: 3.5 }}>
      <Avatar src={user.avatarUrl || undefined} alt={user.name} sx={{ bgcolor: "#e3f2e8", color: "primary.dark", border: "2px solid #198A4A", width: { xs: 76, md: 82 }, height: { xs: 76, md: 82 }, boxShadow: "0 6px 18px #174c322b" }}>
        {user.name.charAt(0).toUpperCase()}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: { xs: 15, md: 16 }, lineHeight: 1.3 }}>Olá,</Typography>
        <Typography sx={{ fontSize: { xs: 18, md: 20 }, lineHeight: 1.25, fontWeight: 850 }} color="primary.dark">{user.name}!</Typography>
      </Box>
    </Stack>

    <Box sx={{ flex: { xs: 1, md: "initial" }, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: { xs: "flex-end", md: "flex-start" } }}>
      <Typography component="h1" sx={{ maxWidth: 820, fontWeight: 900, fontSize: { xs: 35, md: 49 }, letterSpacing: "-.045em", lineHeight: 1.05, mb: 1, background: "linear-gradient(112deg,#0f172a,#198A4A 65%,#36E07E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Encontre o material certo para a sua obra.
      </Typography>
      <Typography color="text.secondary" mb={{ xs: 2.25, md: 3 }}>Pesquise e compare as opções para o seu projeto.</Typography>

      <Box component="section" aria-labelledby="project-type-title" sx={{ maxWidth: { xs: 680, md: "100%" }, mt: { md: 2 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.1}>
        <Typography id="project-type-title" variant="h6" fontWeight={800}>O que você vai construir?</Typography>
        <Stack direction="row" gap={.25}>
          <ButtonBase aria-label="Tipos anteriores" onClick={() => moveProjectTypes(-1)} sx={{ color: "#397251", width: 44, height: 44, borderRadius: "50%", "&:focus-visible": { outline: "2px solid #198a4a" } }}>
            <ChevronLeftRoundedIcon />
          </ButtonBase>
          <ButtonBase aria-label="Próximos tipos" onClick={() => moveProjectTypes(1)} sx={{ color: "#397251", width: 44, height: 44, borderRadius: "50%", "&:focus-visible": { outline: "2px solid #198a4a" } }}>
            <ChevronRightRoundedIcon />
          </ButtonBase>
        </Stack>
      </Stack>

      <Box ref={projectRail} role="group" aria-label="Tipos de obra" onScroll={showProjectScrollbar} sx={{
        display: "flex", gap: 1.05, overflowX: "auto", px: .15, py: .45, scrollSnapType: "x proximity",
        WebkitOverflowScrolling: "touch", scrollbarWidth: "thin",
        scrollbarColor: projectScrolling ? "#a9d7ba transparent" : "transparent transparent",
        "&::-webkit-scrollbar": { height: 3 },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: projectScrolling ? "#a9d7ba" : "transparent", borderRadius: 999 }
      }}>
        {projectTypes.map(({ value, label, segment, icon: Icon }) => {
          const selected = projectType === value;
          return <ButtonBase key={value} aria-pressed={selected} onClick={() => setProjectType(selected ? "" : value)} sx={{
            width: { xs: 166, sm: 182 }, minWidth: { xs: 166, sm: 182 }, minHeight: 88, px: 1.5, py: 1.25, borderRadius: "18px",
            scrollSnapAlign: "start", display: "grid", gridTemplateColumns: "32px minmax(0,1fr)", columnGap: .8, alignItems: "center", textAlign: "left",
            color: "#17653a", border: "1px solid",
            borderColor: selected ? "rgba(25,138,74,.42)" : "rgba(25,138,74,.13)",
            background: selected
              ? "linear-gradient(145deg,#ffffff,#e9f7ee)"
              : "linear-gradient(145deg,rgba(255,255,255,.9),rgba(239,248,242,.74))",
            boxShadow: selected ? "0 0 0 3px rgba(54,224,126,.08),0 6px 16px rgba(25,138,74,.09)" : "0 3px 12px rgba(23,76,50,.045)",
            transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
            WebkitTapHighlightColor: "transparent",
            "@media (hover: hover)": { "&:hover": { transform: "translateY(-1px)", borderColor: "rgba(25,138,74,.3)", boxShadow: "0 6px 16px rgba(25,138,74,.08)" } },
            "&.Mui-focusVisible": { outline: "2px solid #36e07e", outlineOffset: 2 },
            "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } }
          }}>
            <Icon sx={{ fontSize: 25 }} />
            <Box minWidth={0}>
              <Typography component="span" display="block" sx={{ color: "#557863", fontSize: 10.5, fontWeight: 600, lineHeight: 1.3 }}>{segment}</Typography>
              <Typography component="span" display="block" sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.35, mt: .35 }}>{label}</Typography>
            </Box>
          </ButtonBase>;
        })}
      </Box>

      <Box sx={{ mt: { xs: 1.5, md: 1.75 }, pb: { xs: 0, md: 2.5 } }}>
        {catalogLoading ? <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" color="#24583b" fontWeight={700}>Explore por segmento</Typography>
            <Skeleton variant="rounded" width={58} height={24} sx={{ bgcolor: "rgba(25,138,74,.06)" }} />
          </Stack>
          <Stack direction="row" gap={{ xs: 2.5, sm: 4 }} sx={{ minHeight: 92, overflow: "hidden", px: .5 }}>
            {[0, 1, 2, 3].map(item => <Stack key={item} alignItems="center" gap={.8} flexShrink={0}>
              <Skeleton variant="circular" width={52} height={52} sx={{ bgcolor: "rgba(25,138,74,.09)" }} />
              <Skeleton variant="rounded" width={58} height={10} sx={{ bgcolor: "rgba(25,138,74,.07)" }} />
            </Stack>)}
          </Stack>
        </> : <SegmentCarousel catalog={catalog} selected="" onSelect={segmentCode => navigate(`/produtos?segmentCode=${encodeURIComponent(segmentCode)}`)} />}
      </Box>
      </Box>
    </Box>
  </Container>;
}
