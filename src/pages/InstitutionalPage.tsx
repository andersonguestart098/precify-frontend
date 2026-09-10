import { Container, Grid, Paper, Typography } from "@mui/material";

const values = [
  ["Precisão", "Cada dado importa para tornar a previsão mais confiável."],
  ["Transparência", "O raciocínio por trás de cada resultado deve ser compreensível."],
  ["Inovação", "Evoluímos a solução a partir de cada novo desafio."],
  ["Sustentabilidade", "Menos desperdício significa mais eficiência para a obra."],
] as const;

export default function InstitutionalPage() {
  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 3, md: 6 } }}>
    <Typography variant="overline" color="primary" fontWeight={850}>Institucional</Typography>
    <Typography component="h1" variant="h3" fontWeight={900} letterSpacing="-.04em" mb={1}>Missão e valores</Typography>
    <Typography color="text.secondary" maxWidth={720} lineHeight={1.75} mb={4}>Democratizar o acesso a previsões de custo confiáveis na construção civil, permitindo que empresas planejem com segurança e reduzam desperdícios. Nossa visão é ser referência em gestão de custos com inteligência artificial na América Latina.</Typography>
    <Grid container spacing={2}>
      {values.map(([title, description], index) => <Grid key={title} size={{ xs: 12, sm: 6 }}><Paper variant="outlined" sx={{ p: 3, height: "100%", borderRadius: 4, borderTop: `3px solid ${index % 2 ? "#69c58c" : "#198a4a"}` }}><Typography variant="h6" fontWeight={850} mb={.75}>{title}</Typography><Typography color="text.secondary" lineHeight={1.6}>{description}</Typography></Paper></Grid>)}
    </Grid>
  </Container>;
}
