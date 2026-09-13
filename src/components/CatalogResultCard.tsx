import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import { Box, Button, Chip, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
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

  return <>
    <Paper variant="outlined" sx={{
      overflow: "hidden",
      borderRadius: { xs: 2.5, md: 2, xl: 2.5 },
      borderColor: "#e0e8e5",
      bgcolor: "#fff",
      boxShadow: "0 2px 12px rgba(19,56,46,.055)",
      transition: "box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease",
      "&:hover": { borderColor: "#bfd8d0", boxShadow: "0 8px 24px rgba(19,56,46,.09)", transform: "translateY(-1px)" },
    }}>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "42% minmax(0,58%)", sm: "180px minmax(0,1fr)", md: "150px minmax(0,1fr)", xl: "190px minmax(0,1fr)" },
        minHeight: { xs: 206, md: 166, xl: 210 },
      }}>
        <Box sx={{
          position: "relative",
          minWidth: 0,
          bgcolor: "#f7f8f8",
          borderRight: "1px solid #edf1ef",
          display: "grid",
          placeItems: "center",
          p: { xs: 1.25, md: 1, xl: 1.5 },
        }}>
          <ProtectedImage
            src={photo}
            alt={featured?.name ?? material.materialName}
            sx={{
              width: "100%",
              height: "100%",
              maxHeight: { xs: 178, md: 140, xl: 178 },
              minHeight: { xs: 150, md: 126, xl: 150 },
              bgcolor: "transparent",
              border: 0,
              borderRadius: 0,
              p: { xs: .45, md: .25, xl: .45 },
              "& img": { objectFit: "contain" },
            }}
          />

          <Tooltip title={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
            <span style={{ position: "absolute", left: 10, bottom: 10 }}>
              <IconButton
                aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                aria-pressed={favorite}
                loading={favoriteBusy}
                disabled={favoriteBusy}
                onClick={() => { setAnimateFavorite(!favorite); onFavorite?.(); }}
                sx={{
                  width: { xs: 36, md: 31, xl: 36 }, height: { xs: 36, md: 31, xl: 36 },
                  color: favorite ? "#b77b00" : "#435b53",
                  bgcolor: favorite ? "#fff7d9" : "rgba(255,255,255,.96)",
                  border: "1px solid",
                  borderColor: favorite ? "#efd78a" : "#dbe4e1",
                  boxShadow: "0 2px 8px rgba(16,42,33,.10)",
                  "&:hover": { bgcolor: favorite ? "#fff0bb" : "#fff", color: favorite ? "#a97000" : "#006b4f" },
                  "@keyframes favoritePop": {
                    "0%": { transform: "scale(.7) rotate(-18deg)" },
                    "55%": { transform: "scale(1.28) rotate(9deg)" },
                    "100%": { transform: "scale(1) rotate(0deg)" },
                  },
                  "& svg": { fontSize: { md: 17, xl: 20 }, animation: favorite && animateFavorite ? "favoritePop 420ms ease-out" : "none" },
                  "@media (prefers-reduced-motion: reduce)": { "& svg": { animation: "none" } },
                }}
              >
                {favorite ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Stack sx={{ minWidth: 0, p: { xs: 1.35, sm: 1.6, md: 1.2, xl: 1.7 } }} justifyContent="space-between" gap={{ xs: 1, md: .7, xl: 1 }}>
          <Box minWidth={0}>
            <Stack direction="row" alignItems="center" gap={.6} flexWrap="wrap" mb={{ xs: .45, md: .3, xl: .45 }}>
              {highlighted && <Chip label="Destaque" size="small" sx={{ height: { xs: 20, md: 17, xl: 20 }, bgcolor: "#edf6f3", color: "#235847", fontWeight: 800, fontSize: { xs: 10, md: 8.8, xl: 10 } }} />}
              <Typography color="primary" sx={{ fontSize: { xs: 10.5, md: 9.5, xl: 11 }, fontWeight: 800, letterSpacing: ".01em" }}>
                {material.materialCode} · {material.familyName}
              </Typography>
            </Stack>

            <Typography component="h2" sx={{
              fontSize: { xs: 15, sm: 17, md: 14.5, xl: 17 },
              lineHeight: 1.18,
              fontWeight: 800,
              letterSpacing: "-.015em",
              color: "#173f33",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {material.materialName}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: .3, fontSize: { xs: 11, md: 10, xl: 12 } }} noWrap>
              {material.segmentName}
            </Typography>

            <Stack direction="row" gap={.45} flexWrap="wrap" mt={{ xs: .75, md: .5, xl: .75 }}>
              <Chip size="small" variant="outlined" label={material.status.replaceAll("_", " ")}
                sx={{ height: { xs: 20, md: 17, xl: 20 }, fontSize: { xs: 9.5, md: 8.5, xl: 10 }, borderColor: "#dce6e2", color: "#526861" }} />
              <Chip size="small" label={offers.length ? `${offers.length} oferta${offers.length > 1 ? "s" : ""}` : "Sem cotação"}
                sx={{ height: { xs: 20, md: 17, xl: 20 }, fontSize: { xs: 9.5, md: 8.5, xl: 10 }, bgcolor: "#eef7f4", color: "#2c6652" }} />
            </Stack>
          </Box>

          <Box>
            {featured ? <Box>
              <Typography color="text.secondary" sx={{ fontSize: { xs: 10.5, md: 9.3, xl: 11.5 }, lineHeight: 1.15 }} noWrap>
                {offers.length > 1 ? "A partir de" : "Cotação"} · {featured.quote.supplier}
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mt={.15}>
                <Typography sx={{ fontSize: { xs: 22, md: 18, xl: 24 }, lineHeight: 1, fontWeight: 900, letterSpacing: "-.025em", color: "#13382e" }}>
                  {currency.format(featured.quote.value)}
                </Typography>
                {logoUrl && <ProtectedImage src={logoUrl} alt={`Logo de ${featured.quote.supplier}`}
                  sx={{ display: { xs: "none", sm: "grid" }, width: { md: 43, xl: 52 }, height: { md: 24, xl: 28 }, bgcolor: "transparent", p: 0, flexShrink: 0 }} />}
              </Stack>
            </Box> : <Typography color="text.secondary" sx={{ fontSize: { xs: 12, md: 10.5, xl: 13 }, fontWeight: 600 }}>Cotação pendente</Typography>}

            <Stack direction={{ xs: "column", sm: "row" }} gap={{ xs: .65, md: .5, xl: .7 }} mt={{ xs: 1, md: .7, xl: 1 }}>
              <Button
                onClick={() => setCompositionOpen(true)}
                startIcon={<PlaylistAddRoundedIcon />}
                variant="contained"
                disableElevation
                sx={{
                  order: 1,
                  flex: { sm: 1 },
                  minHeight: { xs: 36, md: 30, xl: 36 },
                  px: { xs: 1.25, md: 1, xl: 1.35 },
                  borderRadius: 999,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  fontWeight: 800,
                  fontSize: { xs: 11.5, md: 10, xl: 12 },
                  background: "linear-gradient(105deg,#006b4f,#218567)",
                  "&:hover": { background: "linear-gradient(105deg,#075c46,#18785d)" },
                  "& .MuiButton-startIcon": { mr: .55, "& svg": { fontSize: { md: 16, xl: 18 } } },
                }}
              >
                Adicionar à composição
              </Button>

              <Button
                component={RouterLink}
                to={`/produtos/${encodeURIComponent(material.materialCode)}`}
                state={{ fromSearch: location.pathname + location.search }}
                startIcon={<VisibilityOutlinedIcon />}
                sx={{
                  order: 2,
                  minHeight: { xs: 34, md: 30, xl: 36 },
                  px: { xs: 1.15, md: .85, xl: 1.2 },
                  borderRadius: 999,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  color: "#214d3f",
                  bgcolor: "#f4f8f6",
                  border: "1px solid #dde8e4",
                  fontWeight: 750,
                  fontSize: { xs: 11, md: 9.8, xl: 11.5 },
                  "&:hover": { bgcolor: "#eaf3ef" },
                  "& .MuiButton-startIcon": { mr: .45, "& svg": { fontSize: { md: 15, xl: 17 } } },
                }}
              >
                Ver detalhes
              </Button>
            </Stack>

            <Button
              size="small"
              component={RouterLink}
              to={`/comparar?codes=${encodeURIComponent(material.materialCode)}`}
              startIcon={<CompareArrowsRoundedIcon />}
              sx={{
                mt: { xs: .45, md: .25, xl: .45 },
                minHeight: 0,
                p: 0,
                color: "#63766f",
                textTransform: "none",
                fontSize: { xs: 10.5, md: 9.2, xl: 11 },
                fontWeight: 650,
                "& .MuiButton-startIcon": { mr: .35, "& svg": { fontSize: { md: 14, xl: 16 } } },
                "&:hover": { bgcolor: "transparent", color: "#006b4f", textDecoration: "underline" },
              }}
            >
              Comparar produto
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
    <AddToCompositionDialog open={compositionOpen} result={result} onClose={() => setCompositionOpen(false)} />
  </>;
}
