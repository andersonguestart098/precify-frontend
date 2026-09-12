import { Box, Container, Divider, Stack, Typography } from "@mui/material";

export default function AboutPage() {
  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 4, md: 7 } }}>
    <Box sx={{ maxWidth: 920 }}>
      <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.5 }}>Sobre o Precify</Typography>
      <Typography component="h1" sx={{ mt: .8, maxWidth: 820, fontSize: { xs: 38, md: 58 }, lineHeight: 1.02, fontWeight: 900, letterSpacing: "-.05em", background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Inteligência aplicada a decisões melhores na construção.
      </Typography>
      <Typography sx={{ mt: 2.2, maxWidth: 760, fontSize: { xs: 16, md: 18 }, lineHeight: 1.75, color: "#61756e" }}>
        O Precify integra tecnologia, dados e inteligência artificial para tornar a gestão de custos mais clara, previsível e eficiente ao longo da obra.
      </Typography>
    </Box>

    <Divider sx={{ my: { xs: 4, md: 6 }, borderColor: "#dfe9e5" }} />

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,.82fr) minmax(0,1.18fr)" }, gap: { xs: 4, md: 9 }, alignItems: "start" }}>
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.4, color: "#6d837b" }}>O Precify</Typography>
        <Typography sx={{ mt: 1.5, fontSize: { xs: 25, md: 30 }, lineHeight: 1.2, fontWeight: 850, letterSpacing: "-.025em", color: "#1c4739" }}>
          Dados de obra transformados em informação útil.
        </Typography>
      </Box>
      <Stack gap={2.2}>
        <Typography sx={{ fontSize: 15.5, lineHeight: 1.85, color: "#566a63" }}>
          A plataforma foi desenvolvida para apoiar empresas da construção civil na leitura de custos, comparação de materiais e tomada de decisão. Em vez de informações dispersas, o Precify organiza dados relevantes em uma experiência simples de consultar e acompanhar.
        </Typography>
        <Typography sx={{ fontSize: 15.5, lineHeight: 1.85, color: "#566a63" }}>
          O objetivo é reduzir incertezas, antecipar desvios e dar mais segurança ao planejamento, conectando informações técnicas e comerciais em um único ambiente.
        </Typography>
      </Stack>
    </Box>

    <Divider sx={{ my: { xs: 4, md: 6 }, borderColor: "#edf1ef" }} />

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,.82fr) minmax(0,1.18fr)" }, gap: { xs: 4, md: 9 }, alignItems: "start" }}>
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.4, color: "#6d837b" }}>Quem somos</Typography>
        <Typography sx={{ mt: 1.5, fontSize: { xs: 25, md: 30 }, lineHeight: 1.2, fontWeight: 850, letterSpacing: "-.025em", color: "#1c4739" }}>
          Engenharia, tecnologia e dados olhando para o mesmo problema.
        </Typography>
      </Box>
      <Stack gap={2.2}>
        <Typography sx={{ fontSize: 15.5, lineHeight: 1.85, color: "#566a63" }}>
          O Precify surgiu da percepção de que prever custos ainda exige muito trabalho manual e decisões baseadas em informações fragmentadas. A proposta é aproximar conhecimento de obra e tecnologia para tornar esse processo mais objetivo.
        </Typography>
        <Typography sx={{ fontSize: 15.5, lineHeight: 1.85, color: "#566a63" }}>
          Somos uma equipe multidisciplinar, com atuação orientada à evolução contínua do produto e à construção de ferramentas que façam sentido no dia a dia de quem planeja, compra e executa obras.
        </Typography>
      </Stack>
    </Box>

    <Box sx={{ mt: { xs: 5, md: 7 }, pt: 2.5, borderTop: "1px solid #dfe9e5", display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 3 }, color: "#789087" }}>
      {["Construção civil", "Gestão de custos", "Inteligência artificial", "Dados aplicados"].map(item => <Typography key={item} sx={{ fontSize: 12.5, fontWeight: 700 }}>{item}</Typography>)}
    </Box>
  </Container>;
}
