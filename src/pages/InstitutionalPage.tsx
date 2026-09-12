import { Box, Container, Divider, Stack, Typography } from "@mui/material";

const values = [
  ["01", "Precisão", "Cada dado importa para tornar análises e previsões mais confiáveis."],
  ["02", "Transparência", "Resultados úteis precisam ser claros, rastreáveis e fáceis de compreender."],
  ["03", "Inovação", "Evoluímos o produto a partir de problemas reais da construção e do uso contínuo."],
  ["04", "Sustentabilidade", "Mais eficiência significa menos desperdício de material, tempo e recursos."],
] as const;

export default function InstitutionalPage() {
  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 4, md: 7 } }}>
    <Box sx={{ maxWidth: 880 }}>
      <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.5 }}>Institucional</Typography>
      <Typography component="h1" sx={{ mt: .8, maxWidth: 760, fontSize: { xs: 38, md: 58 }, lineHeight: 1.02, fontWeight: 900, letterSpacing: "-.05em", color: "#163e32" }}>
        Clareza para decidir. Tecnologia para evoluir.
      </Typography>
      <Typography sx={{ mt: 2.2, maxWidth: 720, fontSize: { xs: 16, md: 18 }, lineHeight: 1.75, color: "#61756e" }}>
        Nossa direção é simples: tornar a gestão de custos da construção mais previsível, acessível e orientada por dados.
      </Typography>
    </Box>

    <Divider sx={{ my: { xs: 4, md: 6 }, borderColor: "#dfe9e5" }} />

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 4, md: 8 } }}>
      <Box sx={{ pr: { md: 5 } }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.5, color: "#70867e" }}>Missão</Typography>
        <Typography sx={{ mt: 1.4, fontSize: { xs: 24, md: 30 }, fontWeight: 850, lineHeight: 1.25, letterSpacing: "-.03em", color: "#1b4638" }}>
          Democratizar o acesso a informações de custo confiáveis na construção civil.
        </Typography>
        <Typography sx={{ mt: 1.7, fontSize: 15.5, lineHeight: 1.8, color: "#5b6f68" }}>
          Ajudamos empresas a planejar com mais segurança, comparar alternativas e reduzir desperdícios com apoio de dados e inteligência artificial.
        </Typography>
      </Box>

      <Box sx={{ pl: { md: 5 }, borderLeft: { md: "1px solid #e2ebe7" } }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.5, color: "#70867e" }}>Visão</Typography>
        <Typography sx={{ mt: 1.4, fontSize: { xs: 24, md: 30 }, fontWeight: 850, lineHeight: 1.25, letterSpacing: "-.03em", color: "#1b4638" }}>
          Ser referência em gestão de custos com inteligência aplicada à obra.
        </Typography>
        <Typography sx={{ mt: 1.7, fontSize: 15.5, lineHeight: 1.8, color: "#5b6f68" }}>
          Queremos transformar decisões complexas em processos mais simples, consistentes e previsíveis para empresas de diferentes portes.
        </Typography>
      </Box>
    </Box>

    <Box sx={{ mt: { xs: 6, md: 8 } }}>
      <Typography sx={{ mb: 2.5, fontSize: 11.5, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.5, color: "#70867e" }}>Valores</Typography>
      <Stack component="section" divider={<Divider flexItem sx={{ borderColor: "#e6eeeb" }} />}>
        {values.map(([number, title, description]) => <Box key={title} sx={{ display: "grid", gridTemplateColumns: { xs: "42px 1fr", sm: "64px minmax(150px,.7fr) minmax(0,1.3fr)" }, gap: { xs: 1.5, sm: 3 }, alignItems: "baseline", py: { xs: 2.4, md: 2.8 } }}>
          <Typography sx={{ color: "#9aaba5", fontSize: 12, fontWeight: 800 }}>{number}</Typography>
          <Typography sx={{ color: "#214a3d", fontSize: { xs: 17, md: 18 }, fontWeight: 800 }}>{title}</Typography>
          <Typography sx={{ gridColumn: { xs: "2", sm: "auto" }, color: "#62756e", fontSize: 14.5, lineHeight: 1.7 }}>{description}</Typography>
        </Box>)}
      </Stack>
    </Box>
  </Container>;
}
