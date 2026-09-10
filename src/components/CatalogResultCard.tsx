import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import StarIcon from "@mui/icons-material/Star";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Chip, Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import { ProtectedImage } from "./ProtectedImage";
import { AddToCompositionDialog } from "./AddToCompositionDialog";
import type { CatalogResult } from "../domain/search";
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function CatalogResultCard({ result, favorite = false, favoriteBusy = false, onFavorite }: {
  result: CatalogResult; favorite?: boolean; favoriteBusy?: boolean; onFavorite?: () => void;
}) {
  const location = useLocation();
  const [animateFavorite, setAnimateFavorite] = useState(false);
  const [compositionOpen, setCompositionOpen] = useState(false);
  const { material, offers } = result;
  const featured = [...offers].sort((a, b) => {
    const score = (o: typeof a) => (o.imageUrl?.trim() ? 1000 : 0) + (o.optionCode?.trim() ? 100 : 0)
      + (o.supplierLogoUrl?.trim() ? 20 : 0) + (o.label?.trim() ? 2 : 0) + (o.brand?.trim() ? 1 : 0);
    return score(b) - score(a) || a.quote.value - b.quote.value || a.productId.localeCompare(b.productId);
  })[0];
  const photo = result.imageUrl || featured?.imageUrl || material.imageUrl;
  const logoUrl = featured?.supplierLogoUrl || result.supplierLogoUrl || material.supplierLogoUrl;
  const highlighted = result.featured === true;
  return <><Paper variant="outlined" sx={{ position: "relative", overflow: "hidden", p: { xs: 1.5, sm: 2 }, borderRadius: 3,
    borderColor: "#d7e9de", boxShadow: "0 6px 24px #133b2310",
    transition: "box-shadow 180ms ease, border-color 180ms ease",
    "&:hover": { borderColor: "#9ecfb0", boxShadow: "0 10px 30px #133b2316" },
    "&::before": { content: '""', position: "absolute", inset: "0 auto 0 0", width: 3, background: "linear-gradient(#198A4A,#36E07E)" } }}>
    <Stack direction="row" gap={{ xs: 1.25, sm: 2 }}>
      <ProtectedImage src={photo} alt={featured?.name ?? material.materialName}
        sx={{ width: { xs: 76, sm: 108 }, flexShrink: 0, alignSelf: "stretch", borderRadius: 1, border: "1px solid #e1e4e7" }} />
      <Box minWidth={0} flex={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" gap={1}>
          <Box minWidth={0}><Typography variant="caption" color="primary" sx={{ fontWeight: 700, letterSpacing: ".02em", fontSize: { xs: 10.5, sm: 12 } }}>{material.materialCode} · {material.familyName}</Typography>
            <Typography component="h2" sx={{ fontSize: { xs: 14, sm: 16.5 }, fontWeight: 700, lineHeight: 1.2 }}>{material.materialName}</Typography>
            <Typography variant="caption" color="text.secondary" display={{ xs: "none", sm: "block" }} mt={.25}>{material.segmentName}</Typography></Box>
          <Stack direction="row" gap={.5} flexShrink={0}>
            <IconButton aria-label="Adicionar à composição" onClick={() => setCompositionOpen(true)}
              sx={{ width: 32, height: 32, color: "#fff", border: "1px solid rgba(255,255,255,.75)",
                background: "linear-gradient(135deg,#11733b 0%,#21a75a 55%,#35d978 100%)",
                boxShadow: "0 4px 13px rgba(25,138,74,.22)", transition: "transform 180ms, box-shadow 180ms",
                "&:hover": { transform: "translateY(-1px)", boxShadow: "0 7px 17px rgba(25,138,74,.3)" },
                "&:active": { transform: "scale(.94)" }, "& svg": { fontSize: 19 },
                "&.Mui-focusVisible": { outline: "3px solid #198a4a55", outlineOffset: 3 } }}>
              <AddRoundedIcon />
            </IconButton>
            <IconButton aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={favorite}
              loading={favoriteBusy} disabled={favoriteBusy} onClick={() => { setAnimateFavorite(!favorite); onFavorite?.(); }}
              sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%",
                color: favorite ? "#c18a08" : "#8c9691", bgcolor: favorite ? "#fff7db" : "#f5f8f6",
                border: "1px solid", borderColor: favorite ? "#efdb99" : "#e3ebe6",
                boxShadow: favorite ? "0 3px 12px #b88b1015" : "none",
                transition: "background-color 180ms, border-color 180ms, transform 180ms",
                "&:hover": { bgcolor: favorite ? "#fff0bb" : "#eaf2ed", transform: "translateY(-1px)" },
                "&:active": { transform: "scale(.94)" },
                "&.Mui-focusVisible": { outline: "3px solid #198a4a55", outlineOffset: 3 },
                "&.Mui-disabled": { color: favorite ? "#c18a08" : "#8c9691", opacity: .65 },
                "@keyframes favoritePop": { "0%": { transform: "scale(.7) rotate(-18deg)" }, "55%": { transform: "scale(1.3) rotate(10deg)" }, "100%": { transform: "scale(1) rotate(0deg)" } },
                "& svg": { fontSize: 16, animation: favorite && animateFavorite ? "favoritePop 420ms ease-out" : "none" },
                "@media (prefers-reduced-motion: reduce)": { transition: "none", "& svg": { animation: "none" } }
              }}><StarIcon /></IconButton>
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={.5} mt={.5}>
          <Stack direction="row" flexWrap="wrap" gap={.5}>
            {highlighted && <Chip size="small" label="Em destaque" sx={{ height: 20, fontSize: 10.5, bgcolor: "#edf6f0", color: "#166b3b", fontWeight: 700 }} />}
            <Chip size="small" variant="outlined" label={material.status.replaceAll("_", " ")} sx={{ height: 20, fontSize: 10.5 }} />
            <Chip size="small" sx={{ height: 20, fontSize: 10.5, bgcolor: "#E9F9EF", color: "primary.dark" }} label={offers.length ? `${offers.length} oferta(s)` : "Sem cotação"} />
          </Stack>
          {logoUrl && <ProtectedImage src={logoUrl} alt={`Logo de ${featured?.quote.supplier ?? material.materialName}`}
            sx={{ display: { xs: "none", sm: "grid" }, width: 56, height: 34, bgcolor: "transparent", p: 0, flexShrink: 0 }} />}
        </Stack>
        <Divider sx={{ my: .75 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          {featured ? <Box minWidth={0}>
            <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: { xs: 10.5, sm: 12 } }}>{offers.length > 1 ? "A partir de" : "Cotação"} · {featured.quote.supplier}</Typography>
            <Typography sx={{ fontSize: { xs: 15.5, sm: 18 }, fontWeight: 800 }} color="primary">{currency.format(featured.quote.value)}</Typography>
          </Box> : <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12.5, sm: 14 } }}>Cotação pendente</Typography>}
          <Button component={RouterLink} to={`/produtos/${encodeURIComponent(material.materialCode)}`}
            state={{ fromSearch: location.pathname + location.search }} startIcon={<VisibilityOutlinedIcon />} variant="text" sx={{
              minHeight: { xs: 32, sm: 38 }, px: { xs: 1.25, sm: 1.75 }, borderRadius: "999px", fontWeight: 700, fontSize: { xs: 12, sm: 13 },
              color: "#166b3b", bgcolor: "#edf6f0", border: "1px solid #d8eade",
              textTransform: "none", gap: .5, whiteSpace: "nowrap", transition: "background-color 180ms, box-shadow 180ms",
              "& .MuiButton-startIcon": { m: 0, mr: .5, "& svg": { fontSize: 15 } },
              "&:hover": { bgcolor: "#dfefe4", boxShadow: "0 3px 10px #198a4a10" },
              "&.Mui-focusVisible": { outline: "3px solid #198a4a55", outlineOffset: 2 }
            }}>Ver detalhes</Button>
        </Stack>
      </Box>
    </Stack>
  </Paper>
  <AddToCompositionDialog open={compositionOpen} result={result} onClose={() => setCompositionOpen(false)} />
  </>;
}
