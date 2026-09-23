import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert, Box, ButtonBase, CircularProgress, Container, Pagination, Stack, Tab, Tabs, Typography,
} from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { HardHat } from "@phosphor-icons/react";
import { ResultSkeletons } from "../components/SearchSkeleton";
import { CatalogResultCard } from "../components/CatalogResultCard";
import { useFavorites } from "../hooks/useFavorites";
import { useWorkspaceFavorites } from "../hooks/useWorkspaceFavorites";
import { searchFavorites, type Project } from "../services/api";
import type { CatalogSearchPage } from "../domain/search";
import type { Composition } from "../domain/composition";
import { useAccount } from "../auth/session";
import {
  getCachedCompositions, getCachedProjects, loadCompositionsCached, loadProjectsCached,
} from "../services/appWarmCache";
import { laborTeamGroups, laborThirdPartyPhases } from "../data/laborCatalog";

type FavoriteTab = "materials" | "works" | "labor" | "compositions";

const laborItems = [...laborTeamGroups, ...laborThirdPartyPhases]
  .flatMap(group => group.items.map(item => ({
    code: item.code,
    title: item.title,
    section: item.section || group.title,
  })));

export default function FavoritesPage() {
  const user = useAccount();
  const favorites = useFavorites();
  const workspaceFavorites = useWorkspaceFavorites();
  const [tab, setTab] = useState<FavoriteTab>("materials");
  const [page, setPage] = useState(0);
  const [response, setResponse] = useState<CatalogSearchPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(() => !(getCachedProjects(user.id) && getCachedCompositions(user.id)));
  const [projects, setProjects] = useState<Project[]>(() => getCachedProjects(user.id) ?? []);
  const [compositions, setCompositions] = useState<Composition[]>(() => getCachedCompositions(user.id) ?? []);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError("");
    searchFavorites({ familyCode: "", query: "", criteria: [], includeAlternatives: false }, page, 10, c.signal)
      .then(data => { if (!c.signal.aborted) setResponse(data); })
      .catch(e => { if (!c.signal.aborted) setError(e.message); })
      .finally(() => { if (!c.signal.aborted) setLoading(false); });
    return () => c.abort();
  }, [page, revision]);

  useEffect(() => {
    let active = true;
    Promise.all([loadProjectsCached(user.id), loadCompositionsCached(user.id)])
      .then(([works, lists]) => {
        if (!active) return;
        setProjects(works);
        setCompositions(lists);
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar seus favoritos.");
      })
      .finally(() => { if (active) setWorkspaceLoading(false); });
    return () => { active = false; };
  }, [user.id]);

  const favoriteWorks = useMemo(
    () => projects.filter(project => workspaceFavorites.favorites.WORK.has(project.id)),
    [projects, workspaceFavorites.favorites.WORK],
  );
  const favoriteCompositions = useMemo(
    () => compositions.filter(composition => workspaceFavorites.favorites.COMPOSITION.has(composition.id)),
    [compositions, workspaceFavorites.favorites.COMPOSITION],
  );
  const favoriteLabor = useMemo(
    () => laborItems.filter(item => workspaceFavorites.favorites.LABOR.has(item.code)),
    [workspaceFavorites.favorites.LABOR],
  );

  const tabs = [
    { value: "works" as const, label: "Minhas obras", count: favoriteWorks.length, icon: <HomeWorkOutlinedIcon /> },
    { value: "materials" as const, label: "Meus materiais", count: response?.totalElements ?? favorites.codes.size, icon: <Inventory2OutlinedIcon /> },
    { value: "labor" as const, label: "Minha mão de obra", count: favoriteLabor.length, icon: <HardHat size={18} weight="duotone" /> },
    { value: "compositions" as const, label: "Minhas composições", count: favoriteCompositions.length, icon: <CalculateOutlinedIcon /> },
  ];

  const workspaceBusy = workspaceLoading || workspaceFavorites.loading;
  const combinedError = error || favorites.error || workspaceFavorites.error;

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, md: 5 }, px: { xs: 2, sm: 3 } }}>
    <Typography variant="overline" color="primary" fontWeight={850}>Meus favoritos</Typography>
    <Typography component="h1" sx={{
      mt: .2, fontSize: { xs: 30, md: 40 }, fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.05,
      background: "linear-gradient(112deg,#13382e,#006b4f 70%,#269b78)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    }}>
      Tudo que você salvou
    </Typography>
    <Typography color="text.secondary" sx={{ mt: .5, mb: 2.3, fontSize: { xs: 12.5, md: 14 } }}>
      Obras, materiais, mão de obra e composições organizados no mesmo lugar.
    </Typography>

    <Tabs
      value={tab}
      onChange={(_, value: FavoriteTab) => setTab(value)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        mb: 2.4,
        minHeight: 44,
        borderBottom: "1px solid rgba(0,107,79,.10)",
        "& .MuiTabs-indicator": { height: 2.5, borderRadius: 999 },
        "& .MuiTab-root": {
          minHeight: 44, px: { xs: 1.1, sm: 1.5 }, minWidth: "auto",
          textTransform: "none", fontWeight: 780, fontSize: { xs: 11, sm: 12.2 },
        },
      }}
    >
      {tabs.map(item => <Tab key={item.value} value={item.value} icon={item.icon} iconPosition="start" label={`${item.label} · ${item.count}`} />)}
    </Tabs>

    {combinedError && <Alert severity="error" sx={{ mb: 2 }}>{combinedError}</Alert>}

    {tab === "materials" && <>
      {loading ? <ResultSkeletons /> :
        <Stack gap={2}>{response?.content.map(result => <CatalogResultCard
          key={result.material.materialCode}
          result={result}
          favorite={favorites.codes.has(result.material.materialCode)}
          favoriteBusy={favorites.loading || favorites.busy.has(result.material.materialCode)}
          onFavorite={() => { void favorites.toggle(result.material.materialCode).then(saved => { if (saved) setRevision(n => n + 1); }); }}
        />)}</Stack>}
      {!loading && !error && !response?.content.length &&
        <Alert severity="info">Você ainda não favoritou nenhum material. Toque na estrela de um material para salvá-lo aqui.</Alert>}
      {(response?.totalPages ?? 0) > 1 && <Stack mt={3} alignItems="center">
        <Pagination color="primary" count={response!.totalPages} page={page + 1} disabled={loading} onChange={(_, value) => setPage(value - 1)} />
      </Stack>}
    </>}

    {tab === "works" && (workspaceBusy ? <LoadingBlock /> :
      <FavoriteRows
        empty="Você ainda não favoritou nenhuma obra."
        items={favoriteWorks.map(project => ({
          id: project.id,
          title: project.name,
          subtitle: `${project.compositionIds.length} ${project.compositionIds.length === 1 ? "composição vinculada" : "composições vinculadas"}`,
          to: "/obras",
          icon: <HomeWorkOutlinedIcon />,
          onRemove: () => void workspaceFavorites.toggle("WORK", project.id),
          busy: workspaceFavorites.isBusy("WORK", project.id),
        }))}
      />)}

    {tab === "labor" && (workspaceBusy ? <LoadingBlock /> :
      <FavoriteRows
        empty="Você ainda não favoritou nenhuma função ou serviço de mão de obra."
        items={favoriteLabor.map(item => ({
          id: item.code,
          title: item.title,
          subtitle: item.section || item.code,
          to: "/mao-de-obra",
          icon: <HardHat size={21} weight="duotone" />,
          onRemove: () => void workspaceFavorites.toggle("LABOR", item.code),
          busy: workspaceFavorites.isBusy("LABOR", item.code),
        }))}
      />)}

    {tab === "compositions" && (workspaceBusy ? <LoadingBlock /> :
      <FavoriteRows
        empty="Você ainda não favoritou nenhuma composição."
        items={favoriteCompositions.map(composition => ({
          id: composition.id,
          title: composition.name,
          subtitle: `${composition.items.length} ${composition.items.length === 1 ? "item" : "itens"}`,
          to: "/composicoes",
          icon: <CalculateOutlinedIcon />,
          onRemove: () => void workspaceFavorites.toggle("COMPOSITION", composition.id),
          busy: workspaceFavorites.isBusy("COMPOSITION", composition.id),
        }))}
      />)}
  </Container>;
}

function LoadingBlock() {
  return <Box minHeight={180} display="grid" sx={{ placeItems: "center" }}>
    <CircularProgress size={28} />
  </Box>;
}

function FavoriteRows({ items, empty }: {
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    to: string;
    icon: React.ReactNode;
    onRemove: () => void;
    busy: boolean;
  }>;
  empty: string;
}) {
  if (!items.length) return <Alert severity="info">{empty}</Alert>;

  return <Stack gap={.8}>
    {items.map(item => <Box key={item.id} sx={{
      minHeight: 68, px: { xs: 1.15, sm: 1.4 }, py: .9,
      border: "1px solid #dce8e4", borderRadius: "12px", bgcolor: "#fff",
      boxShadow: "0 3px 12px rgba(24,60,48,.03)",
    }}>
      <Stack direction="row" alignItems="center" gap={1.05}>
        <Box sx={{
          width: 40, height: 40, flexShrink: 0, borderRadius: "11px",
          display: "grid", placeItems: "center", bgcolor: "#edf6f3", color: "#315f50",
          "& svg": { fontSize: 21 },
        }}>{item.icon}</Box>
        <Box minWidth={0} flex={1}>
          <Typography fontWeight={820} color="#244d40" sx={{ fontSize: { xs: 12.8, sm: 13.5 } }}>{item.title}</Typography>
          <Typography color="text.secondary" sx={{ mt: .2, fontSize: { xs: 9.8, sm: 10.5 } }}>{item.subtitle}</Typography>
        </Box>
        <ButtonBase
          aria-label={`Remover ${item.title} dos favoritos`}
          disabled={item.busy}
          onClick={item.onRemove}
          sx={{
            width: 34, height: 34, flexShrink: 0, borderRadius: "10px",
            color: "#b77b00", bgcolor: "#fff6d7", border: "1px solid #ead07d",
            "&:hover": { bgcolor: "#ffefb3" },
          }}
        ><StarRoundedIcon sx={{ fontSize: 18 }} /></ButtonBase>
        <ButtonBase
          component={RouterLink}
          to={item.to}
          aria-label={`Abrir ${item.title}`}
          sx={{
            width: 34, height: 34, flexShrink: 0, borderRadius: "10px",
            color: "#55736a", bgcolor: "#f4f8f6", border: "1px solid #dce8e4",
            "&:hover": { bgcolor: "#eaf3ef" },
          }}
        ><ArrowOutwardRoundedIcon sx={{ fontSize: 17 }} /></ButtonBase>
      </Stack>
    </Box>)}
  </Stack>;
}
