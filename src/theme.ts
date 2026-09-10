import { alpha, createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#198A4A", dark: "#0B6732", light: "#8FE0B3" },
    warning: { main: "#b87906" },
    background: { default: "#f4f7fb", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: {
      borderRadius: 999, minHeight: 42, paddingInline: 20, gap: 4,
      transition: "background-color 180ms ease, box-shadow 180ms ease",
      "&.Mui-focusVisible": { outline: "3px solid #198a4a44", outlineOffset: 3 }
    } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", borderColor: alpha("#94a3b8", 0.22) } } },
    MuiListItemButton: { styleOverrides: { root: {
      WebkitTapHighlightColor: "transparent",
      "&:hover": { background: "linear-gradient(100deg,rgba(54,224,126,.16),rgba(25,138,74,.06))" },
      "&.Mui-selected": { background: "linear-gradient(100deg,rgba(54,224,126,.2),rgba(25,138,74,.08))" },
      "&.Mui-selected:hover": { background: "linear-gradient(100deg,rgba(54,224,126,.26),rgba(25,138,74,.11))" },
      "&.Mui-focusVisible": { outline: "2px solid #36e07e", outlineOffset: -2 }
    } } },
  },
});
