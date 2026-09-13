import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert, Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Stack, TextField, Typography
} from "@mui/material";
import type { CatalogResult } from "../domain/search";
import type { Composition } from "../domain/composition";
import { addCompositionItem, createComposition, listCompositions, listProjects, type Project } from "../services/api";
import { ProtectedImage } from "./ProtectedImage";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const units = ["un", "m²", "m", "kg", "L", "saco", "caixa"];
const UNASSIGNED = "__unassigned__";
type ProjectOption = { id: string; label: string };

export function AddToCompositionDialog({ open, result, onClose }: {
  open: boolean;
  result: CatalogResult;
  onClose: () => void;
}) {
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("un");
  const [error, setError] = useState("");
  const [savedName, setSavedName] = useState("");
  const [compositionQuery, setCompositionQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const featured = useMemo(() => [...result.offers].sort((a, b) =>
    a.quote.value - b.quote.value || a.productId.localeCompare(b.productId))[0], [result.offers]);
  const photo = result.imageUrl || featured?.imageUrl || result.material.imageUrl;
  const assignedIds = useMemo(() => new Set(projects.flatMap(project => project.compositionIds)), [projects]);
  const projectOptions = useMemo<ProjectOption[]>(() => [
    { id: "", label: "Todas as obras" },
    ...projects.map(project => ({ id: project.id, label: project.name })),
    { id: UNASSIGNED, label: "Sem obra vinculada" },
  ], [projects]);
  const filteredCompositions = useMemo(() => {
    const query = compositionQuery.trim().toLocaleLowerCase("pt-BR");
    return compositions.filter(composition => {
      if (query && !composition.name.toLocaleLowerCase("pt-BR").includes(query)) return false;
      if (!projectFilter) return true;
      if (projectFilter === UNASSIGNED) return !assignedIds.has(composition.id);
      const project = projects.find(item => item.id === projectFilter);
      return project ? project.compositionIds.includes(composition.id) : true;
    });
  }, [compositions, compositionQuery, projectFilter, projects, assignedIds]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true); setError(""); setSavedName(""); setCreating(false); setNewName(""); setCompositionQuery(""); setProjectFilter("");
    Promise.all([listCompositions(controller.signal), listProjects()])
      .then(([lists, works]) => {
        if (controller.signal.aborted) return;
        setCompositions(lists);
        setProjects(works);
      })
      .catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open]);

  const itemPayload = () => ({
    materialCode: result.material.materialCode,
    productId: featured?.productId ?? null,
    name: result.material.materialName,
    imageUrl: photo ?? null,
    supplier: featured?.quote.supplier ?? null,
    unit,
    quantity: Math.max(.01, Number(quantity) || 1),
    unitPrice: featured?.quote.value ?? 0,
  });

  const addTo = async (composition: Composition) => {
    setSavingId(composition.id); setError("");
    try {
      const updated = await addCompositionItem(composition.id, itemPayload());
      setCompositions(current => current.map(entry => entry.id === updated.id ? updated : entry));
      setSavedName(updated.name);
      window.dispatchEvent(new Event("precify-compositions-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível adicionar o material.");
    } finally { setSavingId(null); }
  };

  const createAndAdd = async () => {
    const name = newName.trim();
    if (!name) { setError("Dê um nome para a nova composição."); return; }
    setSavingId("new"); setError("");
    try {
      const created = await createComposition(name);
      const updated = await addCompositionItem(created.id, itemPayload());
      setCompositions(current => [updated, ...current]);
      setSavedName(updated.name); setCreating(false); setNewName(""); setCompositionQuery("");
      window.dispatchEvent(new Event("precify-compositions-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a composição.");
    } finally { setSavingId(null); }
  };

  return <Dialog
    open={open}
    onClose={savingId ? undefined : onClose}
    fullWidth
    maxWidth="sm"
    slotProps={{
      paper: {
        sx: {
          borderRadius: { xs: "24px 24px 0 0", sm: 4 },
          m: { xs: 0, sm: 2 },
          position: { xs: "fixed", sm: "relative" },
          bottom: { xs: 0, sm: "auto" },
          width: { xs: "100%", sm: "min(600px, calc(100% - 32px))" },
          maxHeight: { xs: "92dvh", sm: "86dvh" },
          overflow: "hidden",
          boxShadow: "0 28px 80px rgba(16,42,33,.24)",
          border: { sm: "1px solid rgba(19,56,46,.06)" },
        }
      }
    }}
  >
    <DialogTitle sx={{ px: { xs: 2.25, sm: 3 }, pt: { xs: 2.2, sm: 2.6 }, pb: { xs: 1.55, sm: 1.8 } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Box minWidth={0}>
          <Typography variant="overline" color="primary" fontWeight={850} letterSpacing={1.15} lineHeight={1.1}>
            Lista de compra
          </Typography>
          <Typography component="div" sx={{
            mt: .35,
            fontSize: { xs: 22, sm: 25 },
            lineHeight: 1.12,
            fontWeight: 900,
            letterSpacing: "-.025em",
            background: "linear-gradient(112deg,#13382e,#006b4f 70%,#269b78)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Adicionar à composição
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: 12.5, sm: 13 }, mt: .75, maxWidth: 430, lineHeight: 1.45 }}>
            Escolha uma lista existente ou crie uma nova sem sair da busca.
          </Typography>
        </Box>
        <IconButton
          aria-label="Fechar"
          onClick={onClose}
          disabled={Boolean(savingId)}
          size="small"
          sx={{ mt: -.4, mr: -.5, color: "#6e8079", bgcolor: "#f5f8f7", "&:hover": { bgcolor: "#edf3f1" } }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </DialogTitle>

    <DialogContent sx={{ px: { xs: 2.25, sm: 3 }, pt: .25, pb: 1.75, overflowY: "auto" }}>
      <Box sx={{ p: { xs: 1.25, sm: 1.4 }, bgcolor: "#f6faf8", border: "1px solid #dcebe6", borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={{ xs: 1.4, sm: 2 }} alignItems={{ xs: "stretch", sm: "center" }}>
          <Stack direction="row" gap={1.25} alignItems="center" minWidth={0} flex={1}>
            <ProtectedImage src={photo} alt="" sx={{
              width: { xs: 50, sm: 56 }, height: { xs: 50, sm: 56 }, borderRadius: 2,
              bgcolor: "#fff", flexShrink: 0, border: "1px solid #e5eeeb"
            }} />
            <Box minWidth={0} flex={1}>
              <Typography fontWeight={820} sx={{ fontSize: { xs: 13.5, sm: 14 }, lineHeight: 1.25 }}>
                {result.material.materialName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: .3, lineHeight: 1.3 }}>
                {featured ? `${featured.quote.supplier} · ${currency.format(featured.quote.value)}` : "Sem cotação disponível"}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" gap={1} sx={{ width: { xs: "100%", sm: 228 }, flexShrink: 0 }}>
            <TextField
              label="Quantidade"
              type="number"
              value={quantity}
              onChange={event => setQuantity(event.target.value)}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: .01, step: .01 } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.2, bgcolor: "#fff" } }}
            />
            <TextField
              label="Unidade"
              select
              value={unit}
              onChange={event => setUnit(event.target.value)}
              size="small"
              sx={{ width: 104, flexShrink: 0, "& .MuiOutlinedInput-root": { borderRadius: 2.2, bgcolor: "#fff" } }}
            >
              {units.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
          </Stack>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2.5 }}>{error}</Alert>}
      {savedName && <Alert icon={<CheckCircleRoundedIcon />} severity="success" sx={{ mt: 1.5, borderRadius: 2.5, bgcolor: "#edf8ef" }}>
        Adicionado em <strong>{savedName}</strong>.
      </Alert>}

      <Divider sx={{ my: { xs: 2.1, sm: 2.35 }, borderColor: "#e6eeeb" }} />

      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" mb={1.35}>
        <Box>
          <Typography fontWeight={850} color="#284d40" sx={{ fontSize: { xs: 14, sm: 14.5 } }}>
            Suas composições
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 11.5, mt: .15 }}>
            {filteredCompositions.length === compositions.length
              ? `${compositions.length} ${compositions.length === 1 ? "lista disponível" : "listas disponíveis"}`
              : `${filteredCompositions.length} de ${compositions.length} listas`}
          </Typography>
        </Box>
      </Stack>

      {!loading && compositions.length > 0 && <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1.15fr .85fr" },
        gap: { xs: 1.05, sm: 1.15 },
        mb: 1.4,
      }}>
        <Stack gap={.55}>
          <Typography sx={{ fontSize: 11.25, fontWeight: 750, color: "#63766f", pl: .25 }}>
            Buscar composição
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={compositionQuery}
            onChange={event => setCompositionQuery(event.target.value)}
            placeholder="Nome da composição..."
            aria-label="Buscar composição"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "#5f776f" }} /></InputAdornment> } }}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2.4, bgcolor: "#f8faf9", "& fieldset": { borderColor: "#dfe8e5" } },
              "& input": { fontSize: 13 },
            }}
          />
        </Stack>

        <Stack gap={.55}>
          <Typography sx={{ fontSize: 11.25, fontWeight: 750, color: "#63766f", pl: .25 }}>
            Filtrar por obra
          </Typography>
          <Autocomplete
            size="small"
            disableClearable
            options={projectOptions}
            value={projectOptions.find(option => option.id === projectFilter) ?? projectOptions[0]}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, option) => setProjectFilter(option.id)}
            noOptionsText="Nenhuma obra encontrada"
            slotProps={{ listbox: { sx: { maxHeight: 190, overflowY: "auto" } } }}
            renderInput={params => <TextField {...params} placeholder="Todas as obras" />}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2.4, bgcolor: "#f8faf9", "& fieldset": { borderColor: "#dfe8e5" } },
              "& input": { fontSize: 13 },
            }}
          />
        </Stack>
      </Box>}

      {loading ? <Box display="grid" sx={{ placeItems: "center", minHeight: 150 }}><CircularProgress size={28} /></Box> :
        <Box sx={{
          border: compositions.length ? "1px solid #e1ebe7" : 0,
          borderRadius: 3,
          bgcolor: compositions.length ? "#f7faf9" : "transparent",
          p: compositions.length ? .6 : 0,
        }}>
          <List disablePadding sx={{
            maxHeight: { xs: 214, sm: 236 },
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#b9cbc5 transparent",
          }}>
            {filteredCompositions.map((composition, index) => {
              const saved = savedName === composition.name;
              return <ListItemButton
                key={composition.id}
                disabled={Boolean(savingId)}
                onClick={() => addTo(composition)}
                sx={{
                  minHeight: { xs: 64, sm: 66 },
                  px: { xs: 1.1, sm: 1.25 },
                  py: .8,
                  mb: index < filteredCompositions.length - 1 ? .45 : 0,
                  borderRadius: 2.35,
                  border: "1px solid",
                  borderColor: saved ? "#cce7d6" : "#edf2f0",
                  bgcolor: saved ? "#f1faf5" : "#fff",
                  transition: "background-color 160ms ease, border-color 160ms ease, transform 120ms ease",
                  "&:hover": { bgcolor: saved ? "#ebf7f0" : "#f8fbfa", borderColor: saved ? "#badfc8" : "#dce8e4" },
                  "&:active": { transform: "scale(.995)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42, color: saved ? "#2d8a55" : "primary.main" }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: 2.1, display: "grid", placeItems: "center", bgcolor: saved ? "#e0f2e6" : "#edf6f3" }}>
                    {savingId === composition.id
                      ? <CircularProgress size={18} />
                      : saved
                        ? <CheckCircleRoundedIcon sx={{ fontSize: 19 }} />
                        : <PlaylistAddRoundedIcon sx={{ fontSize: 19 }} />}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={composition.name}
                  secondary={`${composition.items.length} ${composition.items.length === 1 ? "item" : "itens"} · ${currency.format(composition.total)}`}
                  primaryTypographyProps={{ fontWeight: 800, fontSize: { xs: 13.5, sm: 14 }, color: "#21483b", lineHeight: 1.25 }}
                  secondaryTypographyProps={{ fontSize: 11.5, mt: .2 }}
                />
                <Box sx={{
                  width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0,
                  bgcolor: saved ? "#dff2e6" : "#f0f7f4", color: saved ? "#2d8a55" : "#006b4f",
                }}>
                  {saved ? <CheckCircleRoundedIcon sx={{ fontSize: 17 }} /> : <AddRoundedIcon sx={{ fontSize: 19 }} />}
                </Box>
              </ListItemButton>;
            })}

            {!compositions.length && !creating && <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography fontWeight={750} color="#34574b" fontSize={14}>Nenhuma composição criada ainda.</Typography>
              <Typography color="text.secondary" fontSize={12.5} mt={.35}>Crie sua primeira lista abaixo.</Typography>
            </Box>}

            {compositions.length > 0 && !filteredCompositions.length && <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography fontWeight={750} color="#34574b" fontSize={14}>Nenhuma composição encontrada.</Typography>
              <Typography color="text.secondary" fontSize={12.5} mt={.35}>Tente outro nome ou altere o filtro de obra.</Typography>
            </Box>}
          </List>
        </Box>}

      {creating ? <Box sx={{ mt: 1.4, p: { xs: 1.35, sm: 1.5 }, borderRadius: 2.8, bgcolor: "#f6faf8", border: "1px solid #dfeae6" }}>
        <Typography fontWeight={850} color="#284d40" fontSize={13.5} mb={1.1}>Nova composição</Typography>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Nome da composição"
          placeholder="Ex.: Reforma da cozinha"
          value={newName}
          onChange={event => setNewName(event.target.value)}
          onKeyDown={event => { if (event.key === "Enter") void createAndAdd(); }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.35, bgcolor: "#fff" } }}
        />
        <Stack direction={{ xs: "column-reverse", sm: "row" }} gap={1} mt={1.2}>
          <Button fullWidth onClick={() => setCreating(false)} disabled={Boolean(savingId)} sx={{ borderRadius: 2.35, textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={createAndAdd}
            disabled={Boolean(savingId)}
            startIcon={savingId === "new" ? <CircularProgress color="inherit" size={16} /> : <AddRoundedIcon />}
            sx={{ borderRadius: 2.35, textTransform: "none", fontWeight: 800 }}
          >
            Criar e adicionar
          </Button>
        </Stack>
      </Box> : <Button
        fullWidth
        startIcon={<PlaylistAddRoundedIcon />}
        onClick={() => setCreating(true)}
        sx={{
          mt: 1.4,
          minHeight: 44,
          borderRadius: 2.5,
          textTransform: "none",
          fontWeight: 800,
          color: "#006b4f",
          bgcolor: "#edf6f3",
          border: "1px solid #d5e8e1",
          "&:hover": { bgcolor: "#e4f1ed", borderColor: "#bcd8cf" },
        }}
      >
        Criar nova composição
      </Button>}
    </DialogContent>

    <DialogActions sx={{
      px: { xs: 2.25, sm: 3 },
      py: { xs: 1.35, sm: 1.5 },
      borderTop: "1px solid #e8efec",
      bgcolor: "rgba(255,255,255,.98)",
    }}>
      <Button
        onClick={onClose}
        disabled={Boolean(savingId)}
        variant="outlined"
        fullWidth={false}
        sx={{
          minWidth: { xs: "100%", sm: 120 },
          minHeight: 40,
          borderRadius: 2.35,
          px: 2.25,
          textTransform: "none",
          fontWeight: 800,
          borderColor: "#cfe0da",
          color: "#006b4f",
          "&:hover": { borderColor: "#9fc5b8", bgcolor: "#f5faf8" },
        }}
      >
        Concluir
      </Button>
    </DialogActions>
  </Dialog>;
}
