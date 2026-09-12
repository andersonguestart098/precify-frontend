import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { useEffect, useId, useState, type ReactNode } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Box, Button, FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { materialByCode, stateOptions, uniqueBy } from "../data/familyConfig";
import type { CatalogMaterial, TechnicalCriterion } from "../domain/search";

interface Props {
  catalog: CatalogMaterial[]; criteria: TechnicalCriterion[]; familyCode: string; onlyFavorites: boolean;
  onCriterionChange: (index: number, update: Partial<TechnicalCriterion>) => void;
  onFamilyChange: (familyCode: string, segmentCode: string) => void;
  onOnlyFavoritesChange: (value: boolean) => void; onClearFilters: () => void;
}

function decodePrice(value: string) {
  if (value.includes(":")) {
    const [min = "", max = ""] = value.split(":", 2);
    return { min, max };
  }
  if (value === "Até R$ 100") return { min: "", max: "100" };
  if (value === "R$ 100 a R$ 150") return { min: "100", max: "150" };
  if (value === "R$ 150 a R$ 200") return { min: "150", max: "200" };
  if (value === "Acima de R$ 200") return { min: "200", max: "" };
  return { min: "", max: "" };
}

const fixedCurrency = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const editableCurrency = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function formatPriceValue(value: string, fixed = true) {
  if (!value) return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  return (fixed ? fixedCurrency : editableCurrency).format(numeric);
}

function maskPriceInput(input: string) {
  const cleaned = input.replace(/[^\d,.]/g, "");
  let decimalIndex = cleaned.lastIndexOf(",");

  if (decimalIndex < 0) {
    const dotIndexes = [...cleaned.matchAll(/\./g)].map(match => match.index ?? -1).filter(index => index >= 0);
    if (dotIndexes.length === 1) {
      const index = dotIndexes[0];
      const digitsBefore = cleaned.slice(0, index).replace(/\D/g, "").length;
      const digitsAfter = cleaned.slice(index + 1).replace(/\D/g, "").length;
      const looksLikeThousandsSeparator = digitsBefore >= 1 && digitsBefore <= 3 && digitsAfter === 3;
      if (!looksLikeThousandsSeparator && digitsAfter <= 2) decimalIndex = index;
    }
  }

  const integerSource = decimalIndex >= 0 ? cleaned.slice(0, decimalIndex) : cleaned;
  const decimalSource = decimalIndex >= 0 ? cleaned.slice(decimalIndex + 1) : "";
  const integerDigits = integerSource.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  const decimalDigits = decimalSource.replace(/\D/g, "").slice(0, 2);
  const integer = integerDigits || (decimalIndex >= 0 ? "0" : "");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return decimalIndex >= 0 ? `${grouped},${decimalDigits}` : grouped;
}

function priceInputToRaw(input: string) {
  const normalized = input.replace(/\./g, "");
  const [integer = "", decimal = ""] = normalized.split(",", 2);
  const integerDigits = integer.replace(/\D/g, "");
  const decimalDigits = decimal.replace(/\D/g, "").slice(0, 2);
  if (!integerDigits && !decimalDigits) return "";
  return decimalDigits ? `${integerDigits || "0"}.${decimalDigits}` : integerDigits || "0";
}

export function SearchFilters({ catalog, criteria, familyCode, onlyFavorites, onOnlyFavoritesChange, onCriterionChange, onFamilyChange, onClearFilters }: Props) {
  const id = useId();
  const value = (key: string) => criteria.find((criterion) => criterion.key === key)?.value ?? "";
  const update = (key: string, next: string) => { const index = criteria.findIndex((criterion) => criterion.key === key); if (index >= 0) onCriterionChange(index, { value: next }); };
  const segmentCode = value("segmentCode");
  const materialCode = value("materialCode");
  const price = decodePrice(value("price"));
  const [priceText, setPriceText] = useState(() => ({ min: formatPriceValue(price.min), max: formatPriceValue(price.max) }));
  const [editingPrice, setEditingPrice] = useState<"min" | "max" | null>(null);
  const segments = uniqueBy(catalog, (item) => item.segmentCode);
  const families = uniqueBy(catalog.filter((item) => !segmentCode || item.segmentCode === segmentCode), (item) => item.familyCode);
  const materials = catalog.filter((item) => (!segmentCode || item.segmentCode === segmentCode) && (!familyCode || item.familyCode === familyCode));
  const selectedMaterial = materialByCode(catalog, materialCode);
  const options = selectedMaterial?.variations.flatMap((variation) => variation.options.map((option) => ({ ...option, variationName: variation.name }))) ?? [];

  useEffect(() => {
    setPriceText(current => ({
      min: editingPrice === "min" ? current.min : formatPriceValue(price.min),
      max: editingPrice === "max" ? current.max : formatPriceValue(price.max),
    }));
  }, [price.min, price.max, editingPrice]);

  const filterIcons: Record<string, ReactNode> = {
    scope: <StarOutlineIcon fontSize="small" />, segmentCode: <CategoryOutlinedIcon fontSize="small" />,
    materialCode: <Inventory2OutlinedIcon fontSize="small" />, optionCode: <TuneOutlinedIcon fontSize="small" />,
    state: <LocationOnOutlinedIcon fontSize="small" />
  };
  const select = (key: string, label: string, current: string, choices: { code: string; name: string }[], all = "Todos", onChange?: (value: string) => void) => (
    <Box sx={{ py: { xs: 1.25, md: .65, xl: 1.25 } }}><FormControl fullWidth size="small"><InputLabel shrink={key === "scope" ? true : undefined} id={`${id}-${key}-label`}>{label}</InputLabel><Select displayEmpty={key === "scope"} startAdornment={<InputAdornment position="start" sx={{ color: "#518070", ml: { xs: .5, md: .2, xl: .5 } }}>{filterIcons[key]}</InputAdornment>} labelId={`${id}-${key}-label`} value={current} label={label} onChange={(event) => (onChange ?? ((next) => update(key, next)))(event.target.value)}><MenuItem value="">{all}</MenuItem>{choices.map((choice) => <MenuItem key={choice.code} value={choice.code}>{choice.name}</MenuItem>)}</Select></FormControl></Box>
  );
  const setPrice = (min: string, max: string) => update("price", min || max ? `${min}:${max}` : "");
  const editPrice = (field: "min" | "max", input: string) => {
    const masked = maskPriceInput(input);
    setPriceText(current => ({ ...current, [field]: masked }));
    const raw = priceInputToRaw(masked);
    if (field === "min") setPrice(raw, price.max);
    else setPrice(price.min, raw);
  };
  const focusPrice = (field: "min" | "max") => {
    setEditingPrice(field);
    setPriceText(current => ({ ...current, [field]: formatPriceValue(field === "min" ? price.min : price.max, false) }));
  };
  const blurPrice = (field: "min" | "max") => {
    const raw = priceInputToRaw(priceText[field]);
    setPriceText(current => ({ ...current, [field]: formatPriceValue(raw) }));
    setEditingPrice(null);
  };

  return <Box sx={{
    "& .MuiOutlinedInput-root": {
      minHeight: { xs: 52, md: 42, xl: 52 }, borderRadius: { xs: "26px", md: "21px", xl: "26px" }, bgcolor: "#f8faf9",
      fontSize: { xs: 14, md: 12, xl: 14 }, transition: "background-color 180ms, box-shadow 180ms",
      "& fieldset": { borderColor: "#dfe7e4" },
      "&:hover": { bgcolor: "#f1f7f5", "& fieldset": { borderColor: "#a6c8bd" } },
      "&.Mui-focused": { bgcolor: "#fff", boxShadow: "0 0 0 3px #006b4f12", "& fieldset": { borderColor: "#006b4f", borderWidth: 1 } }
    },
    "& .MuiInputLabel-root": { fontSize: { xs: 14, md: 12, xl: 14 }, color: "#62766f" },
    "& .MuiInputAdornment-root": { "& .MuiSvgIcon-root": { fontSize: { md: 17, xl: 20 } } },
    "& .MuiSelect-icon": { color: "#628177", right: { md: 9, xl: 12 } },
    "& .MuiSelect-select": { py: { xs: 1.5, md: 1, xl: 1.5 }, pl: { xs: 2, md: 1.15, xl: 2 } }
  }}>
    <Box sx={{ p: { xs: 2.5, md: 1.45, xl: 2.5 }, borderBottom: 1, borderColor: "divider" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={{ xs: .75, md: .45, xl: .75 }} alignItems="center">
          <TuneOutlinedIcon color="primary" sx={{ fontSize: { md: 18, xl: 24 } }} />
          <Typography variant="overline" color="primary" sx={{ fontSize: { md: 9, xl: 12 } }}>Filtros</Typography>
        </Stack>
        <Button size="small" sx={{ borderRadius: "999px", px: { md: .85, xl: 1.5 }, minWidth: 0, color: "#587068", bgcolor: "#f3f7f6", textTransform: "none", fontSize: { md: 10.5, xl: 13 }, "&:hover": { bgcolor: "#e7f0ed" }, "& .MuiButton-startIcon": { mr: { md: .3, xl: 1 } } }} startIcon={<ClearIcon sx={{ fontSize: { md: 16, xl: 20 } }} />} onClick={onClearFilters}>Limpar</Button>
      </Stack>
      <Typography variant="h6" fontWeight={700} letterSpacing="-.02em" mt={{ xs: 1.5, md: .8, xl: 1.5 }} sx={{ fontSize: { md: 16, xl: 20 } }}>Refine sua busca</Typography>
    </Box>
    <Box sx={{ px: { xs: 2.5, md: 1.4, xl: 2.5 }, pt: { xs: 1, md: .5, xl: 1 } }}>
      {select("scope", "Exibir", onlyFavorites ? "favorites" : "", [{ code: "favorites", name: "Meus favoritos" }], "Todos", next => onOnlyFavoritesChange(next === "favorites"))}
      {select("segmentCode", "Segmento", segmentCode, segments.map((item) => ({ code: item.segmentCode, name: item.segmentName })), "Todos", (next) => onFamilyChange("", next))}
      <Box sx={{ py: { xs: 1.25, md: .65, xl: 1.25 } }}><FormControl fullWidth size="small"><InputLabel id={`${id}-family-label`}>Família</InputLabel><Select startAdornment={<InputAdornment position="start" sx={{ color: "#518070", ml: { xs: .5, md: .2, xl: .5 } }}><LayersOutlinedIcon fontSize="small" /></InputAdornment>} labelId={`${id}-family-label`} value={familyCode} label="Família" onChange={(event) => { const item = catalog.find((entry) => entry.familyCode === event.target.value); onFamilyChange(event.target.value, item?.segmentCode ?? segmentCode); }}><MenuItem value="">Todas</MenuItem>{families.map((item) => <MenuItem key={item.familyCode} value={item.familyCode}>{item.familyName}</MenuItem>)}</Select></FormControl></Box>
      {select("materialCode", "Material", materialCode, materials.map((item) => ({ code: item.materialCode, name: item.materialName })))}
      {options.length ? select("optionCode", "Opção técnica", value("optionCode"), options.map((item) => ({ code: item.optionCode, name: `${item.variationName}: ${item.name}` })), "Todas") : null}

      <Box sx={{ py: { xs: 1.25, md: .65, xl: 1.25 } }}>
        <Stack direction="row" alignItems="center" gap={{ xs: .75, md: .45, xl: .75 }} mb={{ xs: .8, md: .45, xl: .8 }}>
          <PaymentsOutlinedIcon sx={{ fontSize: { xs: 18, md: 16, xl: 18 }, color: "#518070" }} />
          <Typography sx={{ fontSize: { xs: 12.5, md: 10.5, xl: 12.5 }, fontWeight: 700, color: "#62766f" }}>Faixa de preço</Typography>
        </Stack>
        <Stack direction="row" gap={{ xs: 1, md: .65, xl: 1 }}>
          <TextField fullWidth size="small" type="text" label="De" value={priceText.min}
            onFocus={() => focusPrice("min")} onBlur={() => blurPrice("min")} onChange={event => editPrice("min", event.target.value)}
            placeholder="0,00" slotProps={{ input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> }, htmlInput: { inputMode: "decimal", maxLength: 18 } }} />
          <TextField fullWidth size="small" type="text" label="Até" value={priceText.max}
            onFocus={() => focusPrice("max")} onBlur={() => blurPrice("max")} onChange={event => editPrice("max", event.target.value)}
            placeholder="0,00" slotProps={{ input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> }, htmlInput: { inputMode: "decimal", maxLength: 18 } }} />
        </Stack>
        <Typography sx={{ mt: { xs: .7, md: .45, xl: .7 }, px: .5, fontSize: { xs: 11.5, md: 9.5, xl: 11.5 }, lineHeight: 1.3, color: "#879791" }}>Digite o mínimo, o máximo ou os dois valores.</Typography>
      </Box>

      {select("state", "Estado", value("state"), stateOptions.map((name) => ({ code: name, name })))}
    </Box>
  </Box>;
}
