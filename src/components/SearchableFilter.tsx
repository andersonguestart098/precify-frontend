import type { ReactNode } from "react";
import { Autocomplete, Box, InputAdornment, TextField, Typography } from "@mui/material";
import { foldText } from "../data/catalogProduct";

export interface SearchableOption { code: string; name: string; hint?: string; count?: number; }

/**
 * Filter for long lists (about 1,850 materials, hundreds of brands): type part of the code or the
 * name, accents ignored. Only the first {@code limit} matches are rendered to keep the list light.
 */
export function SearchableFilter({ label, placeholder, icon, options, value, onChange, emptyText, limit = 80 }: {
  label: string;
  placeholder: string;
  icon: ReactNode;
  options: SearchableOption[];
  value: string;
  onChange: (code: string) => void;
  emptyText: string;
  limit?: number;
}) {
  const selected = options.find(option => option.code === value) ?? (value ? { code: value, name: value } : null);
  return <Box sx={{ py: { xs: 1.25, md: .65, xl: 1.25 } }}>
    <Autocomplete
      size="small"
      options={options}
      value={selected}
      onChange={(_, option) => onChange(option?.code ?? "")}
      isOptionEqualToValue={(option, current) => option.code === current.code}
      getOptionLabel={option => option.hint ? `${option.hint} · ${option.name}` : option.name}
      filterOptions={(list, state) => {
        const terms = foldText(state.inputValue).split(/\s+/).filter(Boolean);
        const matches = terms.length
          ? list.filter(option => { const text = foldText(`${option.hint ?? ""} ${option.name}`); return terms.every(term => text.includes(term)); })
          : list;
        return matches.slice(0, limit);
      }}
      noOptionsText={emptyText}
      clearText="Limpar"
      openText="Abrir"
      closeText="Fechar"
      slotProps={{ listbox: { sx: { maxHeight: 330 } } }}
      renderOption={({ key, ...props }, option) => <Box component="li" key={key} {...props}
        sx={{ display: "flex", alignItems: "baseline", gap: 1, py: .75 }}>
        {option.hint && <Typography component="span" sx={{
          minWidth: 52, fontSize: 11.5, fontWeight: 800, color: "#5f7d73", fontVariantNumeric: "tabular-nums",
        }}>{option.hint}</Typography>}
        <Typography component="span" sx={{ flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.3 }}>{option.name}</Typography>
        {option.count !== undefined && <Typography component="span" sx={{
          fontSize: 11.5, fontWeight: 800, color: option.count ? "#17664f" : "#a6b3ae", fontVariantNumeric: "tabular-nums",
        }}>{option.count}</Typography>}
      </Box>}
      renderInput={params => <TextField {...params} label={label} placeholder={placeholder}
        InputProps={{
          ...params.InputProps,
          startAdornment: <>
            <InputAdornment position="start" sx={{ color: "#518070", ml: { xs: .5, md: .2, xl: .5 } }}>{icon}</InputAdornment>
            {params.InputProps.startAdornment}
          </>,
        }} />}
    />
  </Box>;
}
