import { alpha, createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#006b4f", dark: "#13382e", light: "#a5d4c1" },
    warning: { main: "#b87906" },
    background: { default: "#f7f9f8", paper: "#ffffff" },
    text: { primary: "#13382e", secondary: "#53645d" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: { styleOverrides: {
      // iOS Safari enlarges the viewport when a small text field receives focus.
      // Keep native and MUI inputs readable without disabling pinch zoom.
      "@media (max-width: 599.95px) and (pointer: coarse)": {
        "input:not([type='checkbox']):not([type='radio']), textarea, select, .MuiInputBase-input, .MuiSelect-select": {
          fontSize: "16px !important",
        },
      },
      "@media (hover: hover) and (pointer: fine)": {
        body: { cursor: "default" },
        "input, textarea, [contenteditable='true'], .MuiInputBase-input": { cursor: "text" },
        "button, a, [role='button'], [role='link']": { cursor: "pointer" },
        "button:disabled, [aria-disabled='true']": { cursor: "default" },
      },
    } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: {
      borderRadius: 999, minHeight: 42, paddingInline: 20, gap: 4,
      transition: "background-color 180ms ease, box-shadow 180ms ease",
      "&.Mui-focusVisible": { outline: "3px solid #006b4f44", outlineOffset: 3 }
    } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", borderColor: alpha("#94a3b8", 0.22) } } },
    MuiListItemButton: { styleOverrides: { root: {
      WebkitTapHighlightColor: "transparent",
      "&:hover": { background: "linear-gradient(100deg,rgba(38,155,120,.16),rgba(0,107,79,.06))" },
      "&.Mui-selected": { background: "linear-gradient(100deg,rgba(38,155,120,.2),rgba(0,107,79,.08))" },
      "&.Mui-selected:hover": { background: "linear-gradient(100deg,rgba(38,155,120,.26),rgba(0,107,79,.11))" },
      "&.Mui-focusVisible": { outline: "2px solid #269b78", outlineOffset: -2 }
    } } },
  },
});
