import { Box, Button, Chip, Container, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import PlumbingOutlinedIcon from "@mui/icons-material/PlumbingOutlined";
import ElectricalServicesOutlinedIcon from "@mui/icons-material/ElectricalServicesOutlined";
import FormatPaintOutlinedIcon from "@mui/icons-material/FormatPaintOutlined";
import RoofingOutlinedIcon from "@mui/icons-material/RoofingOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const specialties = [
  { label: "Construção e estrutura", caption: "Pedreiro, armador e carpinteiro", icon: EngineeringOutlinedIcon },
  { label: "Instalações hidráulicas", caption: "Encanadores e instaladores", icon: PlumbingOutlinedIcon },
  { label: "Instalações elétricas", caption: "Eletricistas e técnicos", icon: ElectricalServicesOutlinedIcon },
  { label: "Pintura e acabamento", caption: "Pintores e aplicadores", icon: FormatPaintOutlinedIcon },
  { label: "Cobertura", caption: "Telhadistas e impermeabilização", icon: RoofingOutlinedIcon },
  { label: "Serviços especializados", caption: "Montagem, manutenção e apoio", icon: HandymanOutlinedIcon },
] as const;

export default function LaborPage() {
  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 3, md: 5 } }}>
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2} mb={4}>
      <Box>
        <Chip label="Novo módulo" size="small" color="primary" variant="outlined" sx={{ mb: 1.2 }} />
        <Typography component="h1" variant="h3" fontWeight={900} letterSpacing="-.04em">Mão de obra</Typography>
        <Typography color="text.secondary" mt={1} maxWidth={680}>Explore especialidades de acordo com a localização e o tipo de estrutura. As cotações serão conectadas aos profissionais cadastrados.</Typography>
      </Box>
    </Stack>

    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4, mb: 4, background: "linear-gradient(135deg,#fff,#f0faf4)" }}>
      <Grid container spacing={1.5} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Localização" placeholder="Cidade ou estado" /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Tipo de obra" defaultValue=""><MenuItem value="">Todos os tipos</MenuItem><MenuItem value="residencial">Residencial</MenuItem><MenuItem value="comercial">Comercial</MenuItem><MenuItem value="industrial">Industrial</MenuItem></TextField></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Button fullWidth variant="contained" startIcon={<SearchRoundedIcon />} disabled sx={{ minHeight: 56 }}>Cotações em breve</Button></Grid>
      </Grid>
    </Paper>

    <Typography variant="h5" fontWeight={850} mb={2}>Explore por especialidade</Typography>
    <Grid container spacing={2}>
      {specialties.map(({ label, caption, icon: Icon }) => <Grid key={label} size={{ xs: 12, sm: 6, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2.25, height: "100%", borderRadius: 3.5, display: "flex", alignItems: "center", gap: 1.6, transition: "border-color 180ms ease,box-shadow 180ms ease,transform 180ms ease", "&:hover": { borderColor: "#a7d9b9", boxShadow: "0 10px 26px rgba(23,76,50,.08)", transform: "translateY(-2px)" } }}>
          <Box sx={{ width: 48, height: 48, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: "50%", color: "#0b6732", bgcolor: "#eaf6ee" }}><Icon /></Box>
          <Box><Typography fontWeight={800}>{label}</Typography><Typography color="text.secondary" fontSize={12.5} mt={.25}>{caption}</Typography></Box>
        </Paper>
      </Grid>)}
    </Grid>
  </Container>;
}
