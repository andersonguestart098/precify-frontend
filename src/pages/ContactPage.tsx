import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const channels = [
  { label: "E-mail", value: "Canal oficial em definição", icon: MailOutlineRoundedIcon },
  { label: "WhatsApp", value: "Número oficial em definição", icon: WhatsAppIcon },
  { label: "Escritório", value: "Endereço em definição", icon: LocationOnOutlinedIcon },
] as const;

export default function ContactPage() {
  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 4, md: 7 } }}>
    <Box sx={{ maxWidth: 860 }}>
      <Typography variant="overline" sx={{ color: "#4f7769", fontWeight: 850, letterSpacing: 1.5 }}>Contato</Typography>
      <Typography component="h1" sx={{ mt: .8, maxWidth: 760, fontSize: { xs: 38, md: 58 }, lineHeight: 1.02, fontWeight: 900, letterSpacing: "-.05em", background: "linear-gradient(112deg,#13382e,#006b4f 65%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Vamos conversar sobre o seu projeto.
      </Typography>
      <Typography sx={{ mt: 2.2, maxWidth: 700, fontSize: { xs: 16, md: 18 }, lineHeight: 1.75, color: "#61756e" }}>
        Para dúvidas, sugestões, parcerias ou uma demonstração do Precify, fale com a nossa equipe pelos canais abaixo.
      </Typography>
    </Box>

    <Divider sx={{ my: { xs: 4, md: 6 }, borderColor: "#dfe9e5" }} />

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,.75fr) minmax(0,1.25fr)" }, gap: { xs: 4, md: 9 }, alignItems: "start" }}>
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.4, color: "#6d837b" }}>Fale com a gente</Typography>
        <Typography sx={{ mt: 1.5, maxWidth: 360, fontSize: { xs: 24, md: 30 }, lineHeight: 1.25, fontWeight: 850, letterSpacing: "-.03em", color: "#1c4739" }}>
          Atendimento simples, direto e sem formulários desnecessários.
        </Typography>
        <Typography sx={{ mt: 1.7, maxWidth: 420, fontSize: 15.5, lineHeight: 1.8, color: "#5f726b" }}>
          Estamos estruturando os canais oficiais de atendimento. Assim que forem definidos, eles serão disponibilizados aqui.
        </Typography>
      </Box>

      <Stack divider={<Divider flexItem sx={{ borderColor: "#e6eeeb" }} />}>
        {channels.map(({ label, value, icon: Icon }) => <Box key={label} sx={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr)", gap: 2, alignItems: "center", py: { xs: 2.1, md: 2.5 } }}>
          <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: "#edf6f3", color: "#285746" }}>
            <Icon sx={{ fontSize: 21 }} />
          </Box>
          <Box minWidth={0}>
            <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: "#234a3d" }}>{label}</Typography>
            <Typography sx={{ mt: .2, fontSize: 13.5, color: "#788a84" }}>{value}</Typography>
          </Box>
        </Box>)}
      </Stack>
    </Box>

    <Box sx={{ mt: { xs: 6, md: 8 }, pt: 2.5, borderTop: "1px solid #dfe9e5" }}>
      <Typography sx={{ maxWidth: 680, fontSize: 13.5, lineHeight: 1.7, color: "#82918c" }}>
        Precisa apresentar o Precify para sua equipe ou avaliar a solução em um cenário real? Entre em contato para solicitar uma demonstração.
      </Typography>
    </Box>
  </Container>;
}
