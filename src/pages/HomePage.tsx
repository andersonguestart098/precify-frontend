import { useOutletContext } from "react-router-dom";
import { Box, ButtonBase, Container, Stack, Typography } from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AccountGreeting from "../components/AccountGreeting";
import QuickAccessStrip from "../components/QuickAccessStrip";

export default function HomePage() {
  const { geoStatus, geoLabel, locationText, requestLocation } = useOutletContext<{
    geoStatus: "idle" | "loading" | "ready" | "error";
    geoLabel: string;
    locationText: string;
    requestLocation: () => void;
  }>();

  return <Container maxWidth="xl" component="main" sx={{
    minHeight: { xs: "calc(100dvh - var(--header-height) - var(--mobile-context-height) - var(--bottom-nav-height))", md: "calc(100dvh - var(--header-height))" },
    pt: { xs: 2, md: 2.25, xl: 3.5 },
    pb: { xs: "calc(var(--ai-overhang) + var(--content-clearance))", md: 3, xl: 4 },
    px: { xs: 2, sm: 3, md: 2.75, xl: 3 },
    display: "flex",
    flexDirection: "column",
  }}>
    <AccountGreeting />

    <Box sx={{
      mt: { xs: 1.2, md: 1.8 },
      width: "100%",
      maxWidth: { md: 1100, xl: 1320 },
      mx: "auto",
    }}>
      <Box sx={{
        display: { xs: "block", md: "grid" },
        gridTemplateColumns: { md: "minmax(0,1fr) minmax(210px,250px)", xl: "minmax(0,1fr) minmax(275px,314px)" },
        alignItems: "start",
        gap: { md: 3, xl: 6 },
      }}>
        <Box minWidth={0}>
          <Typography component="h1" sx={{
            maxWidth: { md: 700, xl: 840 },
            fontWeight: 900,
            fontSize: { xs: 34, md: 38, xl: 49 },
            letterSpacing: "-.045em",
            lineHeight: 1.03,
            mb: { xs: 1, md: .65, xl: 1 },
            background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Tudo que você precisa para planejar a obra.
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: 12.5, md: 13, xl: 16 }, maxWidth: { md: 680, xl: 820 } }}>
            Acesse materiais, mão de obra, obras, composições, favoritos e o assistente do Precify.
          </Typography>
        </Box>

        <ButtonBase
          onClick={requestLocation}
          disabled={geoStatus === "loading"}
          aria-label={geoStatus === "ready" ? `Localização atual: ${geoLabel}. Clique para atualizar.` : locationText}
          sx={{
            display: { xs: "none", md: "flex" },
            width: "100%",
            minWidth: 0,
            maxWidth: { md: 250, xl: 314 },
            justifySelf: "end",
            mt: { md: .4, xl: 1.1 },
            p: .35,
            gap: { md: .8, xl: 1 },
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "left",
            color: "inherit",
            borderRadius: "8px",
            transition: "transform 160ms ease,opacity 160ms ease",
            "@media (hover:hover)": {
              "&:hover": { transform: "translateY(-1px)" },
              "&:hover .location-pin": { transform: "translateY(-1px) scale(1.07)", filter: "drop-shadow(0 5px 8px rgba(0,107,79,.22))" },
              "&:hover .location-refresh": { transform: "rotate(26deg)", color: "#087458" },
              "&:hover .location-city": { color: "#006b4f" },
            },
            "&.Mui-disabled": { opacity: .68 },
            "&.Mui-focusVisible": { outline: "2px solid rgba(38,155,120,.42)", outlineOffset: 3 },
          }}
        >
          <LocationOnRoundedIcon className="location-pin" sx={{
            fontSize: { md: 24, xl: 31 },
            flexShrink: 0,
            color: geoStatus === "error" ? "#a55c56" : "#087458",
            filter: geoStatus === "error" ? "none" : "drop-shadow(0 3px 6px rgba(0,107,79,.17))",
            transition: "transform 160ms ease,filter 160ms ease",
          }} />
          <Box minWidth={0} flex={1}>
            <Stack direction="row" alignItems="center" gap={.45} minWidth={0}>
              <Typography sx={{
                fontSize: { md: 8.2, xl: 9.2 },
                fontWeight: 850,
                letterSpacing: ".07em",
                textTransform: "uppercase",
                lineHeight: 1,
                color: geoStatus === "error" ? "#8d5a54" : "#638078",
              }}>
                Localização de referência
              </Typography>
              <RefreshRoundedIcon className="location-refresh" sx={{
                ml: "auto", fontSize: { md: 13, xl: 15 }, flexShrink: 0,
                color: geoStatus === "error" ? "#9c655f" : "#7c948c",
                transition: "transform 180ms ease,color 180ms ease",
              }} />
            </Stack>
            <Typography className="location-city" noWrap sx={{
              mt: .42, fontSize: { md: 11.5, xl: 13.2 }, fontWeight: 850,
              letterSpacing: "-.012em", lineHeight: 1.14,
              color: geoStatus === "error" ? "#8f504a" : "#214b3d",
            }}>
              {geoStatus === "loading" ? "Identificando sua região..." : geoStatus === "ready" ? geoLabel : geoStatus === "error" ? "Tentar identificar novamente" : "Definir minha localização"}
            </Typography>
            <Typography noWrap sx={{ mt: .3, fontSize: { md: 8.4, xl: 9.6 }, lineHeight: 1.1, color: "#8a9994" }}>
              {geoStatus === "ready" ? "Base local para preços e resultados" : "Melhora preços e resultados por região"}
            </Typography>
          </Box>
        </ButtonBase>
      </Box>

      <Box sx={{
        mt: { xs: 1.8, md: 2.4, xl: 3.2 },
        p: { xs: 0, md: 1.1, xl: 1.35 },
        borderRadius: { md: 4, xl: 5 },
        background: { md: "linear-gradient(145deg,rgba(255,255,255,.45),rgba(239,247,244,.26))" },
        border: { md: "1px solid rgba(0,107,79,.055)" },
      }}>
        <QuickAccessStrip />
      </Box>
    </Box>
  </Container>;
}
