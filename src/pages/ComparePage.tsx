import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert, Box, Button, CircularProgress, Container, InputAdornment, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableRow, TextField, Typography,
} from "@mui/material";
import { productDetail, type CatalogDetail } from "../services/api";

export default function ComparePage() {
  const [params, setParams] = useSearchParams();
  const codes = params.get("codes") ?? "";
  const [input, setInput] = useState(codes);
  const [details, setDetails] = useState<CatalogDetail[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const ids = [...new Set(codes.split(",").map(value => value.trim()).filter(Boolean))];
    setDetails([]);
    setError("");

    if (!ids.length) return;
    if (ids.length > 4 || ids.some(id => !/^\d+(\.\d+)*$/.test(id))) {
      setError("Informe até quatro códigos de materiais válidos, separados por vírgula.");
      return;
    }

    setBusy(true);
    Promise.all(ids.map(id => productDetail(id)))
      .then(value => { if (active) setDetails(value); })
      .catch(error => { if (active) setError(error instanceof Error ? error.message : "Não foi possível comparar os materiais."); })
      .finally(() => { if (active) setBusy(false); });

    return () => { active = false; };
  }, [codes]);

  const products = details.flatMap(detail => detail.products.map(product => ({
    ...product,
    materialName: detail.material.materialName,
  })));
  const attributes = [...new Set(products.flatMap(product => Object.keys(product.attributes ?? {})))];
  const hasCodes = Boolean(codes.trim());

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 3, md: 5 } }}>
    <Box sx={{ maxWidth: 1080, mx: "auto" }}>
      <Box sx={{ mb: { xs: 3, md: 3.5 } }}>
        <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.4 }}>
          Análise de materiais
        </Typography>
        <Typography component="h1" sx={{
          mt: .35,
          fontSize: { xs: 34, md: 44 },
          lineHeight: 1.05,
          fontWeight: 900,
          letterSpacing: "-.045em",
          background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Comparar produtos
        </Typography>
        <Typography color="text.secondary" sx={{ mt: .8, maxWidth: 720, lineHeight: 1.65 }}>
          Coloque até quatro códigos do catálogo lado a lado para comparar especificações, variações e cotações com mais clareza.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{
        p: { xs: 2, sm: 2.4 },
        borderRadius: 4,
        borderColor: "#dce9e5",
        background: "linear-gradient(135deg,#fbfdfc 0%,#eef8f4 66%,#f9fcfb 100%)",
        boxShadow: "0 10px 28px rgba(23,67,53,.045)",
      }}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1.5} mb={2}>
          <Stack direction="row" alignItems="center" gap={1.2}>
            <Box sx={{
              width: 42,
              height: 42,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: "linear-gradient(135deg,#185a44,#379e7b)",
              boxShadow: "0 6px 16px rgba(0,107,79,.13)",
            }}>
              <CompareArrowsRoundedIcon sx={{ fontSize: 21 }} />
            </Box>
            <Box>
              <Typography fontWeight={850} color="#21483b">Escolha os materiais</Typography>
              <Typography color="text.secondary" fontSize={13}>Use os códigos do catálogo, separados por vírgula.</Typography>
            </Box>
          </Stack>
          <Typography sx={{ color: "#6f827b", fontSize: 12.5, whiteSpace: "nowrap" }}>Máximo de 4 códigos</Typography>
        </Stack>

        <Stack component="form" direction={{ xs: "column", sm: "row" }} gap={1.1}
          onSubmit={event => { event.preventDefault(); setParams(input.trim() ? { codes: input.trim() } : {}); }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ex.: 1.1.1, 4.1.1"
            value={input}
            onChange={event => setInput(event.target.value)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 19, color: "#6c827a" }} /></InputAdornment>,
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 46,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,.88)",
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d4e2dd" },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={busy || !input.trim()}
            startIcon={<CompareArrowsRoundedIcon />}
            sx={{
              minWidth: { sm: 138 },
              minHeight: 46,
              borderRadius: 3,
              px: 2.5,
              textTransform: "none",
              fontWeight: 800,
              whiteSpace: "nowrap",
              background: "linear-gradient(110deg,#176046,#007252)",
              boxShadow: "0 8px 20px rgba(0,107,79,.15)",
              "&:hover": { background: "linear-gradient(110deg,#124f3b,#006447)" },
            }}
          >
            Comparar
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mt: 2.2, borderRadius: 3 }}>{error}</Alert>}

      {busy && <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
        <Stack alignItems="center" gap={1.2}>
          <CircularProgress size={28} />
          <Typography color="text.secondary" fontSize={13}>Buscando especificações...</Typography>
        </Stack>
      </Box>}

      {!busy && details.filter(detail => !detail.products.length).map(detail =>
        <Alert key={detail.material.materialCode} severity="info" sx={{ mt: 2, borderRadius: 3 }}>
          {detail.material.materialName}: ainda sem produtos cadastrados para comparar.
        </Alert>
      )}

      {!busy && !hasCodes && <Box sx={{
        mt: { xs: 3.5, md: 4.5 },
        py: { xs: 5, md: 6 },
        px: 2,
        textAlign: "center",
        borderTop: "1px solid #e2ebe8",
        borderBottom: "1px solid #e2ebe8",
      }}>
        <Box sx={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          mx: "auto",
          display: "grid",
          placeItems: "center",
          bgcolor: "#ebf5f1",
          color: "#356554",
        }}>
          <CompareArrowsRoundedIcon />
        </Box>
        <Typography fontWeight={850} color="#284d40" mt={1.4}>Pronto para comparar.</Typography>
        <Typography color="text.secondary" fontSize={14} mt={.5}>
          Informe os códigos acima e o Precify organiza as informações lado a lado.
        </Typography>
      </Box>}

      {!!products.length && <Box sx={{ mt: 2.5 }}>
        <Alert severity="info" sx={{ mb: 1.5, borderRadius: 3, bgcolor: "#eef7f4", color: "#355c4f", "& .MuiAlert-icon": { color: "#34735d" } }}>
          Confira unidade, embalagem, variação, região e data antes de comparar preços. Não há conversão automática entre unidades.
        </Alert>

        <TableContainer component={Paper} variant="outlined" sx={{
          borderRadius: 4,
          borderColor: "#dce7e3",
          overflowX: "auto",
          boxShadow: "0 10px 30px rgba(24,60,48,.045)",
          bgcolor: "rgba(255,255,255,.88)",
        }}>
          <Table aria-label="Comparação de produtos" sx={{ minWidth: 700, "& td": { borderColor: "#e7eeeb" } }}>
            <TableBody>
              <TableRow sx={{ bgcolor: "#f1f8f5" }}>
                <TableCell sx={{ minWidth: 170, fontWeight: 850, color: "#395a4f" }}>Produto</TableCell>
                {products.map((product, index) => <TableCell key={index} sx={{ minWidth: 220, py: 2.1 }}>
                  <Typography fontWeight={850} color="#174a39" lineHeight={1.25}>{product.name}</Typography>
                  <Typography color="text.secondary" fontSize={12.5} mt={.35}>{product.materialName}</Typography>
                </TableCell>)}
              </TableRow>

              {["materialName", "brand", "model"].map((key, index) => <TableRow key={key}>
                <TableCell sx={{ fontWeight: 800, color: "#49675d", bgcolor: "#fbfdfc" }}>{["Material", "Marca", "Modelo"][index]}</TableCell>
                {products.map((product, productIndex) => <TableCell key={productIndex} sx={{ color: "#344f46" }}>
                  {product[key as "brand" | "model" | "materialName"] || "Não informado"}
                </TableCell>)}
              </TableRow>)}

              {attributes.map(key => <TableRow key={key}>
                <TableCell sx={{ fontWeight: 800, color: "#49675d", bgcolor: "#fbfdfc" }}>{key}</TableCell>
                {products.map((product, index) => <TableCell key={index} sx={{ color: "#344f46" }}>
                  {product.attributes[key] || "Não informado"}
                </TableCell>)}
              </TableRow>)}

              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#49675d", bgcolor: "#fbfdfc", verticalAlign: "top" }}>Ofertas e variações</TableCell>
                {products.map((product, index) => <TableCell key={index} sx={{ verticalAlign: "top" }}>
                  {product.variations.length ? product.variations.map((variation, variationIndex) => <Box key={variationIndex} sx={{
                    py: .8,
                    "& + &": { borderTop: "1px solid #edf2f0" },
                  }}>
                    <Typography fontWeight={750} color="#294d41" fontSize={13.5}>{variation.label || variation.optionCode || "Variação não informada"}</Typography>
                    <Typography color="text.secondary" fontSize={12.5} mt={.25}>
                      {variation.quote
                        ? `${variation.quote.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · ${variation.quote.supplier} · ${variation.quote.region} · ${variation.quote.date}`
                        : "Cotação pendente"}
                    </Typography>
                  </Box>) : <Typography color="text.secondary" fontSize={13}>Cotação pendente</Typography>}
                </TableCell>)}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>}
    </Box>
  </Container>;
}
