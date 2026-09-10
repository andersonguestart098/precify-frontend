import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, Container, Stack, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from "@mui/material";
import { productDetail, type CatalogDetail } from "../services/api";
export default function ComparePage() {
  const [params, setParams] = useSearchParams(); const codes = params.get("codes") ?? "";
  const [input, setInput] = useState(codes); const [details, setDetails] = useState<CatalogDetail[]>([]); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; const ids = [...new Set(codes.split(",").map(v => v.trim()).filter(Boolean))]; setDetails([]); setError("");
    if (!ids.length) return;
    if (ids.length > 4 || ids.some(id => !/^\d+(\.\d+)*$/.test(id))) { setError("Informe até quatro códigos de materiais válidos, separados por vírgula."); return; }
    setBusy(true); Promise.all(ids.map(id => productDetail(id))).then(v => { if (active) setDetails(v); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setBusy(false); }); return () => { active = false; };
  }, [codes]);
  const products = details.flatMap(d => d.products.map(p => ({ ...p, materialName: d.material.materialName })));
  const attributes = [...new Set(products.flatMap(p => Object.keys(p.attributes ?? {})))];
  return <Container maxWidth="xl" sx={{ py: 4 }}><Typography component="h1" variant="h4" fontWeight={800}>Comparar produtos</Typography><Typography color="text.secondary" my={2}>Selecione até quatro materiais pelos códigos do catálogo. Compare especificações e ofertas sem misturar unidades.</Typography>
    <Stack component="form" direction="row" gap={1} onSubmit={e => { e.preventDefault(); setParams({ codes: input }); }}><TextField fullWidth label="Códigos dos materiais" placeholder="1.1.1, 4.1.1" value={input} onChange={e => setInput(e.target.value)} /><Button type="submit" disabled={busy || !input.trim()}>Comparar</Button></Stack>
    {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}{busy && <Typography role="status">Buscando especificações…</Typography>}
    {!busy && details.filter(d => !d.products.length).map(d => <Alert key={d.material.materialCode} severity="info" sx={{ mt: 2 }}>{d.material.materialName}: ainda sem produtos cadastrados para comparar.</Alert>)}
    {!!products.length && <><Alert severity="info" sx={{ my: 2 }}>Confira unidade, embalagem, variação, região e data antes de comparar preços. Não há conversão automática entre unidades.</Alert><TableContainer><Table aria-label="Comparação de produtos" sx={{ minWidth: 600 }}><TableBody>
      <TableRow><TableCell>Produto</TableCell>{products.map((p, i) => <TableCell key={i} sx={{ minWidth: 230, fontWeight: 800 }}>{p.name}</TableCell>)}</TableRow>
      {["materialName", "brand", "model"].map((key, i) => <TableRow key={key}><TableCell>{["Material", "Marca", "Modelo"][i]}</TableCell>{products.map((p, j) => <TableCell key={j}>{p[key as "brand" | "model" | "materialName"] || "Não informado"}</TableCell>)}</TableRow>)}
      {attributes.map(key => <TableRow key={key}><TableCell>{key}</TableCell>{products.map((p, i) => <TableCell key={i}>{p.attributes[key] || "Não informado"}</TableCell>)}</TableRow>)}
      <TableRow><TableCell>Ofertas e variações</TableCell>{products.map((p, i) => <TableCell key={i}>{p.variations.length ? p.variations.map((v, j) => <Typography key={j} variant="body2" mb={1}>{v.label || v.optionCode || "Variação não informada"} · {v.quote ? `${v.quote.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · ${v.quote.supplier} · ${v.quote.region} · ${v.quote.date}` : "Cotação pendente"}</Typography>) : "Cotação pendente"}</TableCell>)}</TableRow>
    </TableBody></Table></TableContainer></>}
  </Container>;
}
