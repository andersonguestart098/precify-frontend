import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Chip, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { ProtectedImage } from "./ProtectedImage";
import { AddToCompositionDialog } from "./AddToCompositionDialog";
import { SegmentMaterialPlaceholder } from "./SegmentMaterialPlaceholder";
import type { CatalogResult } from "../domain/search";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CatalogResultCard({ result, favorite = false, favoriteBusy = false, onFavorite, layout = "list" }: {
  result: CatalogResult; favorite?: boolean; favoriteBusy?: boolean; onFavorite?: () => void; layout?: "list" | "mosaic" | "single";
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

  if (layout === "list") return <>
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderRadius: { xs: "12px", md: "10px" },
        borderColor: "#e3ebe8",
        bgcolor: "#fff",
        boxShadow: "0 1px 5px rgba(19,56,46,.025)",
        transition: "background-color 160ms ease,border-color 160ms ease,box-shadow 160ms ease",
        "&:hover": {
          bgcolor: "#fbfdfc",
          borderColor: "#cbded7",
          boxShadow: "0 5px 16px rgba(19,56,46,.055)",
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "72px minmax(0,1fr)",
            md: "64px minmax(150px,1.8fr) minmax(95px,.9fr) minmax(88px,.75fr) minmax(105px,.8fr) minmax(170px,1.2fr)",
            xl: "72px minmax(240px,2.1fr) minmax(150px,1fr) minmax(120px,.8fr) minmax(145px,.9fr) minmax(235px,1.35fr)",
          },
          columnGap: { xs: 1.15, md: 1, xl: 1.4 },
          rowGap: { xs: .65, md: 0 },
          alignItems: "center",
          minHeight: { xs: 112, md: 82, xl: 92 },
          px: { xs: 1.1, md: 1.2, xl: 1.5 },
          py: { xs: 1, md: .8, xl: .95 },
        }}
      >
        <Box sx={{
          position: "relative",
          width: { xs: 72, md: 56, xl: 64 },
          height: { xs: 72, md: 56, xl: 64 },
          borderRadius: { xs: "10px", md: "9px" },
          bgcolor: "#f6f8f7",
          border: "1px solid #edf1ef",
          display: "grid",
          placeItems: "center",
          overflow: "visible",
          alignSelf: { xs: "start", md: "center" },
        }}>
          <ProtectedImage
            src={photo}
            alt={featured?.name ?? material.materialName}
            fallback={<SegmentMaterialPlaceholder segmentCode={material.segmentCode} label={material.materialName} />}
            sx={{
              width: "100%", height: "100%", bgcolor: "transparent", border: 0,
              borderRadius: "9px", p: .25, "& img": { objectFit: "contain" },
            }}
          />
          <Tooltip title={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
            <span style={{ position: "absolute", left: -7, bottom: -7 }}>
              <IconButton
                aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                aria-pressed={favorite}
                loading={favoriteBusy}
                disabled={favoriteBusy}
                onClick={() => { setAnimateFavorite(!favorite); onFavorite?.(); }}
                sx={{
                  width: { xs: 29, md: 27 }, height: { xs: 29, md: 27 },
                  color: favorite ? "#b77b00" : "#4f675e",
                  bgcolor: favorite ? "#fff7d9" : "#fff",
                  border: "1px solid",
                  borderColor: favorite ? "#efd78a" : "#dce5e2",
                  boxShadow: "0 2px 7px rgba(16,42,33,.09)",
                  "&:hover": { bgcolor: favorite ? "#fff0bb" : "#f8fbfa", color: favorite ? "#a97000" : "#006b4f" },
                  "@keyframes favoritePop": {
                    "0%": { transform: "scale(.7) rotate(-18deg)" },
                    "55%": { transform: "scale(1.28) rotate(9deg)" },
                    "100%": { transform: "scale(1) rotate(0deg)" },
                  },
                  "& svg": { fontSize: 16, animation: favorite && animateFavorite ? "favoritePop 420ms ease-out" : "none" },
                  "@media (prefers-reduced-motion: reduce)": { "& svg": { animation: "none" } },
                }}
              >
                {favorite ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Box minWidth={0} sx={{ alignSelf: "center" }}>
          <Stack direction="row" alignItems="center" gap={.45} minWidth={0}>
            {highlighted && <Chip label="Destaque" size="small" sx={{
              height: 18, flexShrink: 0, bgcolor: "#edf6f3", color: "#235847",
              fontWeight: 800, fontSize: 8.8, "& .MuiChip-label": { px: .65 },
            }} />}
            <Typography color="primary" noWrap sx={{
              minWidth: 0, fontSize: { xs: 9.6, md: 9.4, xl: 10.2 },
              fontWeight: 850, letterSpacing: ".015em",
            }}>
              {material.materialCode}
            </Typography>
          </Stack>
          <Typography component="h2" sx={{
            mt: .18, fontSize: { xs: 13.3, md: 12.6, xl: 14.2 }, lineHeight: 1.22,
            fontWeight: 820, letterSpacing: "-.012em", color: "#173f33",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {material.materialName}
          </Typography>
          <Typography noWrap sx={{ mt: .2, fontSize: { xs: 9.7, md: 9.2, xl: 10.2 }, color: "#7b8d86" }}>
            {material.familyName}
          </Typography>
          <Stack direction="row" gap={.4} flexWrap="wrap" mt={.55} sx={{ display: { xs: "flex", md: "none" } }}>
            <Chip size="small" variant="outlined" label={material.status.replaceAll("_", " ")}
              sx={{ height: 19, fontSize: 8.7, borderColor: "#dce6e2", color: "#526861" }} />
            <Chip size="small" label={offers.length ? `${offers.length} oferta${offers.length > 1 ? "s" : ""}` : "Sem cotação"}
              sx={{ height: 19, fontSize: 8.7, bgcolor: "#eef7f4", color: "#2c6652" }} />
          </Stack>
        </Box>

        <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: { md: 10.4, xl: 11.5 }, fontWeight: 760, color: "#315247" }}>
            {material.segmentName}
          </Typography>
          <Typography noWrap sx={{ mt: .18, fontSize: { md: 8.8, xl: 9.6 }, color: "#8a9994" }}>
            {material.familyName}
          </Typography>
        </Box>

        <Stack sx={{ display: { xs: "none", md: "flex" } }} gap={.35} alignItems="flex-start">
          <Chip size="small" variant="outlined" label={material.status.replaceAll("_", " ")}
            sx={{
              maxWidth: "100%", height: { md: 19, xl: 21 }, fontSize: { md: 8.4, xl: 9.1 },
              borderColor: "#dce6e2", color: "#526861", "& .MuiChip-label": { px: .7, overflow: "hidden", textOverflow: "ellipsis" },
            }} />
          <Chip size="small" label={offers.length ? `${offers.length} oferta${offers.length > 1 ? "s" : ""}` : "Sem cotação"}
            sx={{
              maxWidth: "100%", height: { md: 19, xl: 21 }, fontSize: { md: 8.4, xl: 9.1 },
              bgcolor: "#eef7f4", color: "#2c6652", "& .MuiChip-label": { px: .7 },
            }} />
        </Stack>

        <Box sx={{
          minWidth: 0,
          gridColumn: { xs: "2", md: "auto" },
          alignSelf: "center",
          textAlign: { xs: "left", md: "right" },
        }}>
          {featured ? <>
            <Typography noWrap sx={{ fontSize: { xs: 9.2, md: 8.6, xl: 9.5 }, color: "#82918c", lineHeight: 1.15 }}>
              {offers.length > 1 ? "A partir de" : "Cotação"}
            </Typography>
            <Typography noWrap sx={{
              mt: .12, fontSize: { xs: 16.2, md: 14.2, xl: 16.5 }, lineHeight: 1,
              fontWeight: 900, letterSpacing: "-.025em", color: "#13382e",
            }}>
              {currency.format(featured.quote.value)}
            </Typography>
            <Typography noWrap sx={{ mt: .2, fontSize: { xs: 8.8, md: 8.1, xl: 9 }, color: "#8b9b95" }}>
              {featured.quote.supplier}
            </Typography>
          </> : <Typography sx={{ fontSize: { xs: 10.5, md: 9.4, xl: 10.4 }, fontWeight: 700, color: "#82918c" }}>
            Cotação pendente
          </Typography>}
        </Box>

        <Stack
          direction="row"
          justifyContent={{ xs: "flex-start", md: "flex-end" }}
          alignItems="center"
          gap={{ xs: .55, md: .45, xl: .65 }}
          sx={{ gridColumn: { xs: "2", md: "auto" }, minWidth: 0 }}
        >
          <Button
            onClick={() => setCompositionOpen(true)}
            startIcon={<PlaylistAddRoundedIcon />}
            variant="contained"
            disableElevation
            sx={{
              minWidth: 0, minHeight: { xs: 31, md: 30, xl: 34 },
              px: { xs: 1, md: .9, xl: 1.15 }, borderRadius: 999,
              textTransform: "none", whiteSpace: "nowrap", fontWeight: 820,
              fontSize: { xs: 9.6, md: 8.6, xl: 9.8 }, color: "#fff",
              border: "1px solid rgba(0,82,61,.10)",
              background: "linear-gradient(105deg,#087458 0%,#078b67 100%)",
              boxShadow: "0 3px 8px rgba(0,107,79,.14)",
              "&:hover": { background: "linear-gradient(105deg,#075f49 0%,#087b5d 100%)", boxShadow: "0 5px 11px rgba(0,107,79,.18)" },
              "& .MuiButton-startIcon": { mr: .4, "& svg": { fontSize: { xs: 14, md: 13, xl: 14 } } },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", lg: "inline" } }}>Adicionar à composição</Box>
            <Box component="span" sx={{ display: { xs: "inline", lg: "none" } }}>Adicionar</Box>
          </Button>
          <Tooltip title="Ver detalhes">
            <IconButton
              component={RouterLink}
              to={`/produtos/${encodeURIComponent(material.materialCode)}`}
              state={{ fromSearch: location.pathname + location.search }}
              aria-label="Ver detalhes"
              sx={{
                width: { xs: 31, md: 30, xl: 34 }, height: { xs: 31, md: 30, xl: 34 },
                flexShrink: 0, color: "#31594c", bgcolor: "#f4f8f6",
                border: "1px solid #dde8e4", "&:hover": { bgcolor: "#eaf3ef" },
              }}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: { xs: 16, md: 15, xl: 17 } }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
    <AddToCompositionDialog open={compositionOpen} result={result} onClose={() => setCompositionOpen(false)} />
  </>;

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
        gridTemplateColumns: layout === "mosaic"
          ? { xs: "42% minmax(0,58%)", sm: "180px minmax(0,1fr)", md: "1fr" }
          : { xs: "42% minmax(0,58%)", sm: "180px minmax(0,1fr)", md: "150px minmax(0,1fr)", xl: "190px minmax(0,1fr)" },
        minHeight: layout === "mosaic" ? { xs: 206, md: 390, xl: 430 } : { xs: 206, md: 166, xl: 210 },
      }}>
        <Box sx={{
          position: "relative",
          minWidth: 0,
          bgcolor: "#f7f8f8",
          borderRight: layout === "mosaic" ? { xs: "1px solid #edf1ef", md: 0 } : "1px solid #edf1ef",
          borderBottom: layout === "mosaic" ? { xs: 0, md: "1px solid #edf1ef" } : 0,
          display: "grid",
          placeItems: "center",
          p: { xs: 1.25, md: 1, xl: 1.5 },
        }}>
          <ProtectedImage
            src={photo}
            alt={featured?.name ?? material.materialName}
            fallback={<SegmentMaterialPlaceholder segmentCode={material.segmentCode} label={material.materialName} />}
            sx={{
              width: "100%",
              height: "100%",
              maxHeight: layout === "mosaic" ? { xs: 178, md: 190, xl: 220 } : { xs: 178, md: 140, xl: 178 },
              minHeight: layout === "mosaic" ? { xs: 150, md: 170, xl: 195 } : { xs: 150, md: 126, xl: 150 },
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
                  "& svg": { fontSize: { md: 19, xl: 20 }, animation: favorite && animateFavorite ? "favoritePop 420ms ease-out" : "none" },
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
              {highlighted && <Chip label="Destaque" size="small" sx={{ height: { xs: 20, md: 20, xl: 22 }, bgcolor: "#edf6f3", color: "#235847", fontWeight: 800, fontSize: { xs: 10, md: 10, xl: 11 } }} />}
              <Typography color="primary" sx={{ fontSize: { xs: 10.5, md: 10.5, xl: 11.5 }, fontWeight: 800, letterSpacing: ".01em" }}>
                {material.materialCode} · {material.familyName}
              </Typography>
            </Stack>

            <Typography component="h2" sx={{
              fontSize: { xs: 15, sm: 17, md: 15.5, xl: 18 },
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

            <Typography color="text.secondary" sx={{ mt: .3, fontSize: { xs: 11, md: 11, xl: 12 } }} noWrap>
              {material.segmentName}
            </Typography>

            <Stack direction="row" gap={.45} flexWrap="wrap" mt={{ xs: .75, md: .5, xl: .75 }}>
              <Chip size="small" variant="outlined" label={material.status.replaceAll("_", " ")}
                sx={{ height: { xs: 20, md: 20, xl: 22 }, fontSize: { xs: 9.5, md: 9.5, xl: 10 }, borderColor: "#dce6e2", color: "#526861" }} />
              <Chip size="small" label={offers.length ? `${offers.length} oferta${offers.length > 1 ? "s" : ""}` : "Sem cotação"}
                sx={{ height: { xs: 20, md: 20, xl: 22 }, fontSize: { xs: 9.5, md: 9.5, xl: 10 }, bgcolor: "#eef7f4", color: "#2c6652" }} />
            </Stack>
          </Box>

          <Box>
            {featured ? <Box>
              <Typography color="text.secondary" sx={{ fontSize: { xs: 10.5, md: 10.5, xl: 11.5 }, lineHeight: 1.15 }} noWrap>
                {offers.length > 1 ? "A partir de" : "Cotação"} · {featured.quote.supplier}
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mt={.15}>
                <Typography sx={{ fontSize: { xs: 22, md: 20, xl: 24 }, lineHeight: 1, fontWeight: 900, letterSpacing: "-.025em", color: "#13382e" }}>
                  {currency.format(featured.quote.value)}
                </Typography>
                {logoUrl && <ProtectedImage src={logoUrl} alt={`Logo de ${featured.quote.supplier}`}
                  sx={{ display: { xs: "none", sm: "grid" }, width: { md: 43, xl: 52 }, height: { md: 24, xl: 28 }, bgcolor: "transparent", p: 0, flexShrink: 0 }} />}
              </Stack>
            </Box> : <Typography color="text.secondary" sx={{ fontSize: { xs: 12, md: 11.5, xl: 13 }, fontWeight: 600 }}>Cotação pendente</Typography>}

            <Stack direction={layout === "mosaic" ? { xs: "column", sm: "row", md: "column", xl: "row" } : { xs: "column", sm: "row" }}
              alignItems={layout === "mosaic" ? { sm: "center", md: "stretch", xl: "center" } : { sm: "center" }}
              gap={{ xs: .65, md: .5, xl: .7 }} mt={{ xs: 1, md: .7, xl: 1 }}>
              <Button
                onClick={() => setCompositionOpen(true)}
                startIcon={<PlaylistAddRoundedIcon />}
                variant="contained"
                disableElevation
                sx={{
                  order: 1,
                  flex: { sm: "0 0 auto" },
                  alignSelf: { sm: "flex-start" },
                  minHeight: { xs: 36, md: 28, xl: 34 },
                  px: { xs: 1.4, md: 1.05, xl: 1.3 },
                  borderRadius: 999,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  fontWeight: 850,
                  letterSpacing: "-.01em",
                  fontSize: { xs: 11.5, md: 9.5, xl: 11.25 },
                  color: "#fff",
                  border: "1px solid rgba(0,82,61,.12)",
                  background: "linear-gradient(105deg,#087458 0%,#078b67 100%)",
                  boxShadow: "0 4px 11px rgba(0,107,79,.18)",
                  transition: "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
                  "&:hover": {
                    background: "linear-gradient(105deg,#075f49 0%,#087b5d 100%)",
                    boxShadow: "0 6px 14px rgba(0,107,79,.22)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0) scale(.985)", boxShadow: "0 2px 7px rgba(0,107,79,.16)" },
                  "& .MuiButton-startIcon": {
                    mr: { xs: .65, md: .5, xl: .6 },
                    width: { xs: 22, md: 18, xl: 20 },
                    height: { xs: 22, md: 18, xl: 20 },
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,.13)",
                    "& svg": { fontSize: { xs: 15, md: 13, xl: 14 } },
                  },
                  "&.Mui-focusVisible": { outline: "3px solid #006b4f40", outlineOffset: 2 },
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

          </Box>
        </Stack>
      </Box>
    </Paper>
    <AddToCompositionDialog open={compositionOpen} result={result} onClose={() => setCompositionOpen(false)} />
  </>;
}
