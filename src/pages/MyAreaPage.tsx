import { Link as RouterLink } from "react-router-dom";
import { Avatar, Box, Button, Container, Stack, Typography } from "@mui/material";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useAccount } from "../auth/session";

const tools = [
  { to: "/obras", label: "Obras", description: "Acompanhe e organize seus projetos.", icon: HomeWorkOutlinedIcon },
  { to: "/composicoes", label: "Composições", description: "Consulte e monte suas composições.", icon: CalculateOutlinedIcon },
  { to: "/favoritos", label: "Favoritos", description: "Retome os materiais que você salvou.", icon: StarOutlineRoundedIcon },
  { to: "/historico", label: "Histórico", description: "Veja suas buscas e acessos recentes.", icon: HistoryRoundedIcon },
] as const;

export default function MyAreaPage() {
  const user = useAccount();

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, md: 5.5 }, px: { xs: 2, sm: 3, md: 4 } }}>
    <Stack direction="row" alignItems="center" gap={{ xs: 1.25, md: 1.75 }} mb={{ xs: 2.7, md: 4 }}>
      <Avatar src={user.avatarUrl || undefined} sx={{ width: { xs: 52, md: 60 }, height: { xs: 52, md: 60 }, bgcolor: "#e5f2ed", color: "#174a39", border: "2px solid #cfe6de", fontWeight: 850 }}>
        {user.name.charAt(0).toUpperCase()}
      </Avatar>
      <Box minWidth={0}>
        <Typography variant="overline" sx={{ color: "#5d7c71", fontWeight: 850, letterSpacing: 1.35, lineHeight: 1 }}>Minha área</Typography>
        <Typography component="h1" noWrap sx={{ mt: .45, fontSize: { xs: 27, md: 38 }, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-.035em",
          background: "linear-gradient(112deg,#13382e,#006b4f 70%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Olá, {user.name.split(" ")[0]}.
        </Typography>
        <Typography sx={{ mt: .45, color: "#74877f", fontSize: { xs: 12.5, md: 14 } }}>Tudo o que é seu no Precify, em um só lugar.</Typography>
      </Box>
    </Stack>

    <Box component="section" aria-labelledby="my-tools-title">
      <Stack direction="row" alignItems="end" justifyContent="space-between" mb={{ xs: 1.15, md: 1.5 }}>
        <Box>
          <Typography id="my-tools-title" sx={{ fontSize: { xs: 16, md: 19 }, fontWeight: 850, color: "#244d40" }}>Seu espaço de trabalho</Typography>
          <Typography sx={{ mt: .25, color: "#85948f", fontSize: { xs: 11.5, md: 12.5 } }}>Acesse seus conteúdos na ordem que você mais usa.</Typography>
        </Box>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))", md: "repeat(4,minmax(0,1fr))" }, gap: { xs: .9, md: 1.15 } }}>
        {tools.map(({ to, label, description, icon: Icon }, index) => <Box
          key={to}
          component={RouterLink}
          to={to}
          sx={{
            minHeight: { xs: 82, md: 150 }, p: { xs: 1.25, md: 1.6 }, borderRadius: { xs: 2.8, md: 3.2 }, textDecoration: "none", color: "inherit",
            display: "flex", flexDirection: { xs: "row", md: "column" }, alignItems: { xs: "center", md: "flex-start" }, gap: { xs: 1.1, md: 1.25 },
            border: "1px solid rgba(0,107,79,.11)",
            background: index === 0 ? "linear-gradient(145deg,#f7fcfa,#e5f3ee)" : "linear-gradient(145deg,#fff,#f2f8f6)",
            boxShadow: "0 5px 18px rgba(24,60,48,.045)",
            transition: "transform 180ms ease,box-shadow 180ms ease,border-color 180ms ease",
            "@media (hover:hover)": { "&:hover": { transform: "translateY(-2px)", borderColor: "rgba(0,107,79,.25)", boxShadow: "0 10px 24px rgba(0,107,79,.08)" } },
            "&:focus-visible": { outline: "2px solid #269b78", outlineOffset: 2 },
          }}
        >
          <Box sx={{ width: { xs: 42, md: 44 }, height: { xs: 42, md: 44 }, borderRadius: "13px", flexShrink: 0, display: "grid", placeItems: "center", color: "#1c5a46", background: "linear-gradient(145deg,#edf8f4,#dcefe8)", border: "1px solid rgba(0,107,79,.08)" }}>
            <Icon sx={{ fontSize: { xs: 22, md: 23 } }} />
          </Box>
          <Box minWidth={0} flex={1}>
            <Typography sx={{ fontWeight: 850, fontSize: { xs: 13.5, md: 14.5 }, color: "#234b3e" }}>{label}</Typography>
            <Typography sx={{ mt: .3, fontSize: { xs: 10.7, md: 11.5 }, lineHeight: 1.4, color: "#74867f" }}>{description}</Typography>
          </Box>
          <ArrowForwardRoundedIcon sx={{ alignSelf: { xs: "center", md: "flex-end" }, mt: { md: "auto" }, color: "#759087", fontSize: 18, flexShrink: 0 }} />
        </Box>)}
      </Box>
    </Box>

    <Box component="section" aria-labelledby="account-data-title" sx={{ display: { xs: "block", md: "none" }, mt: 3.2 }}>
      <Typography id="account-data-title" sx={{ fontSize: 16, fontWeight: 850, color: "#244d40", mb: 1.15 }}>Dados da conta</Typography>
      <Stack gap={.8}>
        <AccountRow icon={PersonOutlineRoundedIcon} label="Dados pessoais" value={user.name} />
        <AccountRow icon={WorkspacePremiumOutlinedIcon} label="Plano" value="Gerenciado pela organização" />
        <AccountRow icon={MailOutlineRoundedIcon} label="E-mail" value={user.email} />
      </Stack>
      <Button component={RouterLink} to="/conta" startIcon={<ManageAccountsOutlinedIcon />} endIcon={<ArrowForwardRoundedIcon />} fullWidth
        sx={{ mt: 1.2, minHeight: 46, borderRadius: 999, textTransform: "none", justifyContent: "space-between", px: 2, fontWeight: 750, color: "#235b48", bgcolor: "rgba(0,107,79,.055)" }}>
        Conta e configurações
      </Button>
    </Box>

    <Stack direction="row" justifyContent="flex-end" sx={{ display: { xs: "none", md: "flex" }, mt: 2.2 }}>
      <Button component={RouterLink} to="/conta" startIcon={<ManageAccountsOutlinedIcon />} endIcon={<ArrowForwardRoundedIcon />}
        sx={{ textTransform: "none", fontWeight: 750, color: "#235b48", borderRadius: 999, px: 2 }}>
        Conta e equipe
      </Button>
    </Stack>
  </Container>;
}

function AccountRow({ icon: Icon, label, value }: { icon: typeof PersonOutlineRoundedIcon; label: string; value: string }) {
  return <Stack direction="row" alignItems="center" gap={1.1} sx={{ p: 1.2, minHeight: 62, borderRadius: 2.5, bgcolor: "rgba(255,255,255,.72)", border: "1px solid rgba(0,107,79,.09)" }}>
    <Box sx={{ width: 38, height: 38, borderRadius: "12px", display: "grid", placeItems: "center", flexShrink: 0, bgcolor: "#eaf5f1", color: "#285e4c" }}><Icon sx={{ fontSize: 20 }} /></Box>
    <Box minWidth={0}>
      <Typography sx={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: 800, color: "#81918b" }}>{label}</Typography>
      <Typography noWrap sx={{ mt: .25, fontSize: 12.5, fontWeight: 700, color: "#2b5145" }}>{value}</Typography>
    </Box>
  </Stack>;
}
