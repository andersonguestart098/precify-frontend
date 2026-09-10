import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import {
  Box, Chip, Divider, LinearProgress, Paper, Stack, Typography,
} from "@mui/material";
import type { RankedProduct } from "../domain/search";

interface ProductResultCardProps {
  result: RankedProduct;
  index: number;
}

function formatQuoteDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T00:00:00`));
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProductResultCard({ result, index }: ProductResultCardProps) {
  const color = result.compatible ? "primary" : "warning";
  const firstDifference = result.differences[0];
  const variations = [...(result.product.variations ?? [])].sort((a, b) => a.quote.value - b.quote.value);
  const cheapest = variations.find((variation) => variation.quote.value > 0) ?? variations[0];

  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        overflow: "hidden",
        p: { xs: 2, sm: 2.5 },
        borderRadius: 4,
        borderColor: result.compatible && result.compatibility === 100 ? "primary.light" : "rgba(148, 163, 184, 0.22)",
        boxShadow: "0 3px 10px rgba(15, 23, 42, 0.06), 0 12px 30px rgba(15, 23, 42, 0.05)",
        opacity: 0,
        transform: "translateY(16px)",
        animation: "fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        animationDelay: `${Math.min(index, 6) * 70}ms`,
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 auto 0 0",
          width: 3,
          background: result.compatible ? "linear-gradient(180deg, #198A4A, #36E07E)" : "linear-gradient(180deg, #d97706, #fbbf24)",
          opacity: result.compatibility / 100,
        },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 7px 20px rgba(15, 23, 42, 0.10), 0 18px 38px rgba(15, 23, 42, 0.08)",
          borderColor: result.compatible ? "primary.light" : "warning.light",
        },
        "@media (prefers-reduced-motion: reduce)": {
          opacity: 1,
          transform: "none",
          animation: "none",
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} gap={2.5} alignItems="stretch">
        <Box
          sx={{
            width: { xs: "100%", sm: 260 },
            height: { xs: 220, sm: "auto" },
            flexShrink: 0,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          {result.product.imageUrl ? (
            <Box component="img" src={result.product.imageUrl} alt={result.product.name} loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "contain", p: 1.5 }} />
          ) : (
            <ImageOutlinedIcon color="disabled" sx={{ fontSize: 40 }} />
          )}
        </Box>

        <Box minWidth={0} flex={1} display="flex" flexDirection="column">
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box minWidth={0}>
              {result.product.supplierLogoUrl ? (
                <Box component="img" src={result.product.supplierLogoUrl} alt={`Logo do fornecedor ${cheapest.quote.supplier}`} loading="lazy" sx={{ display: "block", width: "auto", maxWidth: 110, height: 28, objectFit: "contain", objectPosition: "left center", mb: 0.5 }} />
              ) : null}
              <Typography variant="overline" color="primary">{result.product.brand} · {result.product.model}</Typography>
              <Typography variant="h6">{result.product.name}</Typography>
            </Box>
            <Box sx={{ minWidth: 90, textAlign: "center", p: 1, borderRadius: 2.5, bgcolor: result.compatible ? "#E9F9EF" : "#fff3df", color: result.compatible ? "primary.dark" : "warning.dark" }}>
              <Typography fontWeight={800}>{result.compatibility}%</Typography>
              <Typography variant="caption" textTransform="uppercase">{result.compatible ? "compatível" : "alternativa"}</Typography>
            </Box>
          </Stack>

          <LinearProgress variant="determinate" color={color} value={result.compatibility} sx={{ my: 2, height: 5, borderRadius: 4 }} />
          <Stack direction="row" flexWrap="wrap" gap={.75}>
            {Object.entries(result.product.attributes).map(([key, value]) => {
              const matches = result.matches.some((match) => match.key === key);
              return <Chip key={key} size="small" color={matches ? "primary" : "default"} variant={matches ? "filled" : "outlined"} icon={matches ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />} label={value} />;
            })}
          </Stack>

          <Stack mt={2} gap={.5}>
            {!!result.matches.length && <Typography variant="caption" color="text.secondary"><b>Atende:</b> {result.matches.map((match) => match.actualValue).join(", ")}</Typography>}
            {firstDifference && <Typography variant="caption" color="warning.dark"><b>Diferença:</b> {firstDifference.actualValue} em vez de {firstDifference.expectedValue}</Typography>}
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Box mt="auto">
            <Typography variant="caption" display="block" color="text.secondary">
              {variations.length > 1 ? "A partir de" : "Última cotação"}
            </Typography>
            <Typography fontWeight={800} color="success.main">{formatCurrency(cheapest.quote.value)}</Typography>
            <Typography variant="caption" color="text.secondary">Atualizada em {formatQuoteDate(cheapest.quote.date)}</Typography>
            {variations.length > 1 ? (
              <Stack direction="row" flexWrap="wrap" gap={0.75} mt={1}>
                {variations.map((variation, variationIndex) => (
                  <Chip
                    key={`${variation.label ?? "padrão"}-${variationIndex}`}
                    size="small"
                    variant="outlined"
                    label={`${variation.label ?? "Padrão"}: ${variation.quote.value > 0 ? formatCurrency(variation.quote.value) : "cotação pendente"}`}
                  />
                ))}
              </Stack>
            ) : null}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
