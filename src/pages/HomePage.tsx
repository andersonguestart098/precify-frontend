import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, ButtonBase, Container, Skeleton, Stack, Typography } from "@mui/material";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import AddRoadOutlinedIcon from "@mui/icons-material/AddRoadOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import { useAccount } from "../auth/session";
import { SegmentCarousel } from "../components/SegmentCarousel";
import { getCatalog } from "../services/api";
import type { CatalogMaterial } from "../domain/search";

const projectTypes = [
  { value: "residencial", label: "Residencial", icon: HomeWorkOutlinedIcon },
  { value: "comercial", label: "Comercial", icon: StorefrontOutlinedIcon },
  { value: "industrial", label: "Industrial", icon: FactoryOutlinedIcon },
  { value: "reforma", label: "Reforma", icon: HandymanOutlinedIcon },
  { value: "infraestrutura", label: "Infraestrutura", icon: AddRoadOutlinedIcon },
  { value: "outro", label: "Outro", icon: AppsOutlinedIcon },
];

let catalogCache: CatalogMaterial[] | null = null;

export default function HomePage() {
  const user = useAccount();
  const navigate = useNavigate();
  const [projectType, setProjectType] = useState("");
  const [catalog, setCatalog] = useState<CatalogMaterial[]>(catalogCache ?? []);
  const [catalogLoading, setCatalogLoading] = useState(!catalogCache);

  useEffect(() => {
    if (catalogCache) return;
    const controller = new AbortController();
    getCatalog(controller.signal)
      .then(data => { catalogCache = data; setCatalog(data); })
      .catch(() => undefined)
      .finally(() => { if (!controller.signal.aborted) setCatalogLoading(false); });
    return () => controller.abort();
  }, []);

  return <Container maxWidth="xl" component="main" sx={{
    minHeight: { xs: "calc(100dvh - 142px)", md: "calc(100dvh - 70px)" },
    py: { xs: 3.5, md: 5 }, display: "flex", flexDirection: "column"
  }}>
    <Stack direction="row" gap={2} alignItems="center" mb={2.5}>
      <Avatar src={user.avatarUrl || undefined} alt={user.name} sx={{ bgcolor: "#e3f2e8", color: "primary.dark", border: "2px solid #198A4A", width: 68, height: 68, boxShadow: "0 5px 16px #174c3226" }}>
        {user.name.charAt(0).toUpperCase()}
      </Avatar>
      <Box><Typography variant="body2">Olá,</Typography><Typography fontWeight={800} color="primary.dark">{user.name}!</Typography></Box>
    </Stack>

    <Typography component="h1" sx={{ maxWidth: 820, fontWeight: 900, fontSize: { xs: 35, md: 49 }, letterSpacing: "-.045em", lineHeight: 1.05, mb: 1.5, background: "linear-gradient(112deg,#0f172a,#198A4A 65%,#36E07E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
      Encontre o material certo para a sua obra.
    </Typography>
    <Typography color="text.secondary" mb={{ xs: 3.5, md: 4.5 }}>Pesquise e compare as opções para o seu projeto.</Typography>

    <Box component="section" aria-labelledby="project-type-title" sx={{ maxWidth: 680, mb: { xs: 3, md: 4 } }}>
      <Typography sx={{
        display: "inline-block", mb: .55, fontSize: 12, fontWeight: 850, letterSpacing: ".055em", textTransform: "uppercase",
        background: "linear-gradient(90deg,#0b6732 0%,#198a4a 58%,#36b96c 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
      }}>Comece pelo seu projeto</Typography>
      <Typography id="project-type-title" variant="h6" fontWeight={800} mb={1.4}>O que você vai construir?</Typography>

      <Box role="list" sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(3,minmax(0,1fr))", sm: "repeat(6,minmax(0,1fr))" }, gap: { xs: 1, sm: 1.25 } }}>
        {projectTypes.map(({ value, label, icon: Icon }) => {
          const selected = projectType === value;
          return <ButtonBase key={value} role="listitem" aria-pressed={selected} onClick={() => setProjectType(selected ? "" : value)} sx={{
            minWidth: 0, minHeight: { xs: 68, sm: 76 }, px: .75, py: 1, borderRadius: 3, display: "flex", flexDirection: "column", gap: .55,
            color: selected ? "#fff" : "#17653a", border: "1px solid",
            borderColor: selected ? "rgba(11,103,50,.55)" : "rgba(25,138,74,.14)",
            background: selected
              ? "linear-gradient(140deg,#0b6732 0%,#198a4a 58%,#36b96c 125%)"
              : "linear-gradient(145deg,rgba(255,255,255,.9),rgba(226,247,234,.72))",
            boxShadow: selected ? "0 7px 18px rgba(25,138,74,.22)" : "0 3px 12px rgba(23,76,50,.055)",
            transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
            WebkitTapHighlightColor: "transparent",
            "&:hover": { transform: "translateY(-2px)", borderColor: "rgba(25,138,74,.38)", boxShadow: "0 7px 18px rgba(25,138,74,.13)" },
            "&.Mui-focusVisible": { outline: "2px solid #36e07e", outlineOffset: 2 },
            "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } }
          }}>
            <Icon sx={{ fontSize: { xs: 23, sm: 25 } }} />
            <Typography component="span" noWrap sx={{ maxWidth: "100%", fontSize: { xs: 10.5, sm: 11 }, fontWeight: 750 }}>{label}</Typography>
          </ButtonBase>;
        })}
      </Box>
    </Box>

    <Box component="section" sx={{
      flex: 1, minHeight: { xs: 178, md: 210 }, display: "flex", flexDirection: "column", justifyContent: "flex-end",
      pt: { xs: 2.5, md: 4 }, pb: { xs: 2.5, md: 2.5 }, position: "relative"
    }}>
      <Typography variant="h5" fontWeight={800} mb={1.25}>Atalhos para o catálogo</Typography>
      {catalogLoading ? <>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Skeleton variant="rounded" width={142} height={18} sx={{ bgcolor: "rgba(25,138,74,.08)" }} />
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
  </Container>;
}
