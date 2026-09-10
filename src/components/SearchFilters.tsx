import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { useId, type ReactNode } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Box, Button, FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { materialByCode, priceOptions, stateOptions, uniqueBy } from "../data/familyConfig";
import type { CatalogMaterial, TechnicalCriterion } from "../domain/search";

interface Props {
  catalog: CatalogMaterial[]; criteria: TechnicalCriterion[]; familyCode: string; onlyFavorites: boolean;
  onCriterionChange: (index: number, update: Partial<TechnicalCriterion>) => void;
  onFamilyChange: (familyCode: string, segmentCode: string) => void;
  onOnlyFavoritesChange: (value: boolean) => void; onClearFilters: () => void;
}

export function SearchFilters({ catalog, criteria, familyCode, onlyFavorites, onOnlyFavoritesChange, onCriterionChange, onFamilyChange, onClearFilters }: Props) {
  const id = useId();
  const value = (key: string) => criteria.find((criterion) => criterion.key === key)?.value ?? "";
  const update = (key: string, next: string) => { const index = criteria.findIndex((criterion) => criterion.key === key); if (index >= 0) onCriterionChange(index, { value: next }); };
  const segmentCode = value("segmentCode");
  const materialCode = value("materialCode");
  const segments = uniqueBy(catalog, (item) => item.segmentCode);
  const families = uniqueBy(catalog.filter((item) => !segmentCode || item.segmentCode === segmentCode), (item) => item.familyCode);
  const materials = catalog.filter((item) => (!segmentCode || item.segmentCode === segmentCode) && (!familyCode || item.familyCode === familyCode));
  const selectedMaterial = materialByCode(catalog, materialCode);
  const options = selectedMaterial?.variations.flatMap((variation) => variation.options.map((option) => ({ ...option, variationName: variation.name }))) ?? [];

  const filterIcons: Record<string, ReactNode> = {
    scope: <StarOutlineIcon fontSize="small" />, segmentCode: <CategoryOutlinedIcon fontSize="small" />,
    materialCode: <Inventory2OutlinedIcon fontSize="small" />, optionCode: <TuneOutlinedIcon fontSize="small" />,
    price: <PaymentsOutlinedIcon fontSize="small" />, state: <LocationOnOutlinedIcon fontSize="small" />
  };
  const select = (key: string, label: string, current: string, choices: { code: string; name: string }[], all = "Todos", onChange?: (value: string) => void) => (
    <Box sx={{ py: 1.25 }}><FormControl fullWidth size="small"><InputLabel shrink={key === "scope" ? true : undefined} id={`${id}-${key}-label`}>{label}</InputLabel><Select displayEmpty={key === "scope"} startAdornment={<InputAdornment position="start" sx={{ color: "#518066", ml: .5 }}>{filterIcons[key]}</InputAdornment>} labelId={`${id}-${key}-label`} value={current} label={label} onChange={(event) => (onChange ?? ((next) => update(key, next)))(event.target.value)}><MenuItem value="">{all}</MenuItem>{choices.map((choice) => <MenuItem key={choice.code} value={choice.code}>{choice.name}</MenuItem>)}</Select></FormControl></Box>
  );

  return <Box sx={{
    "& .MuiOutlinedInput-root": {
      minHeight: 52, borderRadius: "26px", bgcolor: "#f8faf9", fontSize: 14,
      transition: "background-color 180ms, box-shadow 180ms",
      "& fieldset": { borderColor: "#dfe7e2" },
      "&:hover": { bgcolor: "#f1f7f3", "& fieldset": { borderColor: "#a6c8b2" } },
      "&.Mui-focused": { bgcolor: "#fff", boxShadow: "0 0 0 3px #198a4a12", "& fieldset": { borderColor: "#198a4a", borderWidth: 1 } }
    },
    "& .MuiInputLabel-root": { fontSize: 14, color: "#62766a" },
    "& .MuiSelect-icon": { color: "#62816e", right: 12 },
    "& .MuiSelect-select": { py: 1.5, pl: 2 }
  }}>
    <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}><Stack direction="row" justifyContent="space-between"><Stack direction="row" gap={.75}><TuneOutlinedIcon color="primary" /><Typography variant="overline" color="primary">Filtros</Typography></Stack><Button size="small" sx={{ borderRadius: "999px", px: 1.5, color: "#587062", bgcolor: "#f3f7f4", textTransform: "none", "&:hover": { bgcolor: "#e7f0ea" } }} startIcon={<ClearIcon />} onClick={onClearFilters}>Limpar</Button></Stack><Typography variant="h6" fontWeight={700} letterSpacing="-.02em" mt={1.5}>Refine sua busca</Typography></Box>
    <Box sx={{ px: 2.5, pt: 1 }}>
      {select("scope", "Exibir", onlyFavorites ? "favorites" : "", [{ code: "favorites", name: "Meus favoritos" }], "Todos", next => onOnlyFavoritesChange(next === "favorites"))}
      {select("segmentCode", "Segmento", segmentCode, segments.map((item) => ({ code: item.segmentCode, name: item.segmentName })), "Todos", (next) => onFamilyChange("", next))}
      <Box sx={{ py: 1.25 }}><FormControl fullWidth size="small"><InputLabel id={`${id}-family-label`}>Família</InputLabel><Select startAdornment={<InputAdornment position="start" sx={{ color: "#518066", ml: .5 }}><LayersOutlinedIcon fontSize="small" /></InputAdornment>} labelId={`${id}-family-label`} value={familyCode} label="Família" onChange={(event) => { const item = catalog.find((entry) => entry.familyCode === event.target.value); onFamilyChange(event.target.value, item?.segmentCode ?? segmentCode); }}><MenuItem value="">Todas</MenuItem>{families.map((item) => <MenuItem key={item.familyCode} value={item.familyCode}>{item.familyName}</MenuItem>)}</Select></FormControl></Box>
      {select("materialCode", "Material", materialCode, materials.map((item) => ({ code: item.materialCode, name: item.materialName })))}
      {options.length ? select("optionCode", "Opção técnica", value("optionCode"), options.map((item) => ({ code: item.optionCode, name: `${item.variationName}: ${item.name}` })), "Todas") : null}
      {select("price", "Preço", value("price"), priceOptions.map((name) => ({ code: name, name })))}
      {select("state", "Estado", value("state"), stateOptions.map((name) => ({ code: name, name })))}
    </Box>
  </Box>;
}
