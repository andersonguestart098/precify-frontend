import { Box, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";

const suggestions = [
  { icon: <CameraAltOutlinedIcon />, label: "Identificar um material" },
  { icon: <ConstructionOutlinedIcon />, label: "Montar uma composição" },
  { icon: <CompareArrowsOutlinedIcon />, label: "Comparar produtos" },
];

export default function AiPage() {
  return <Container maxWidth="sm" component="main" sx={{ py: { xs: 4, md: 6 } }}>
    <Stack alignItems="center" textAlign="center" gap={1.5} mb={4}>
      <Box sx={{ width: 72, height: 72, display: "grid", placeItems: "center", borderRadius: "50%", color: "#fff", background: "linear-gradient(135deg,#13382e,#269b78)", boxShadow: "0 10px 28px #006b4f42" }}>
        <AutoAwesomeIcon sx={{ fontSize: 34 }} />
      </Box>
      <Chip label="Em breve" color="primary" size="small" />
      <Typography component="h1" variant="h4" fontWeight={900}>Assistente IA do Precify</Typography>
      <Typography color="text.secondary">Esta área será usada para conversar, enviar fotos e transformar respostas em ações dentro do catálogo.</Typography>
    </Stack>
    <Stack gap={1.5}>
      {suggestions.map(item => <Paper key={item.label} variant="outlined" sx={{ p: 2, borderRadius: 4, display: "flex", alignItems: "center", gap: 1.5, color: "primary.dark" }}>
        {item.icon}<Typography fontWeight={700}>{item.label}</Typography>
      </Paper>)}
    </Stack>
  </Container>;
}
