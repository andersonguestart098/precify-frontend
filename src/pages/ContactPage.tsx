import { Box, Chip, Container, Grid, Paper, Typography } from "@mui/material";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const channels = [
  { title: "E-mail", caption: "Canal oficial a definir", icon: MailOutlineRoundedIcon },
  { title: "WhatsApp", caption: "Número oficial a definir", icon: WhatsAppIcon },
  { title: "Escritório", caption: "Endereço a definir", icon: LocationOnOutlinedIcon },
] as const;

export default function ContactPage() {
  return <Container maxWidth="md" component="main" sx={{ py: { xs: 3, md: 6 } }}>
    <Typography variant="overline" color="primary" fontWeight={850}>Contato</Typography>
    <Typography component="h1" variant="h3" fontWeight={900} letterSpacing="-.04em">Fale com a gente</Typography>
    <Typography color="text.secondary" mt={1} mb={4}>Estamos preparando os canais oficiais para dúvidas, sugestões e demonstrações do Precify.</Typography>
    <Grid container spacing={2}>
      {channels.map(({ title, caption, icon: Icon }) => <Grid key={title} size={{ xs: 12, sm: 4 }}><Paper variant="outlined" sx={{ p: 2.5, height: "100%", borderRadius: 4, textAlign: "center" }}><Box sx={{ mx: "auto", mb: 1.5, width: 48, height: 48, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: "#eaf6f2", color: "#13382e" }}><Icon /></Box><Typography fontWeight={850}>{title}</Typography><Chip label={caption} size="small" variant="outlined" sx={{ mt: 1.25, maxWidth: "100%" }} /></Paper></Grid>)}
    </Grid>
  </Container>;
}
