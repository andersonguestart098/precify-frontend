import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

export default function AboutPage() {
  return <Container maxWidth="md" component="main" sx={{ py: { xs: 3, md: 6 } }}>
    <Typography variant="overline" color="primary" fontWeight={850}>Sobre</Typography>
    <Typography component="h1" variant="h3" fontWeight={900} letterSpacing="-.04em" mb={3}>Inteligência para construir com previsibilidade.</Typography>
    <Stack gap={2}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2.5}>
          <Box sx={{ width: 52, height: 52, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 3, bgcolor: "#e9f6ee", color: "#0b6732" }}><AutoGraphRoundedIcon /></Box>
          <Box><Typography variant="h5" fontWeight={850} mb={1}>O Precify</Typography><Typography color="text.secondary" lineHeight={1.8}>O Precify é uma plataforma tecnológica que integra inteligência artificial à gestão de custos na construção civil. A solução transforma dados de obra em informações úteis para reduzir desperdícios e ampliar a previsibilidade financeira.</Typography></Box>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2.5}>
          <Box sx={{ width: 52, height: 52, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 3, bgcolor: "#e9f6ee", color: "#0b6732" }}><GroupsOutlinedIcon /></Box>
          <Box><Typography variant="h5" fontWeight={850} mb={1}>Quem somos</Typography><Typography color="text.secondary" lineHeight={1.8}>Nascemos da percepção de que a construção ainda depende de processos dispersos para prever custos. Reunimos engenharia, tecnologia e ciência de dados para criar uma gestão mais clara, colaborativa e orientada por evidências.</Typography></Box>
        </Stack>
      </Paper>
    </Stack>
  </Container>;
}
