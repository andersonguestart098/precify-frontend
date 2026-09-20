import { Link as RouterLink } from "react-router-dom";
import { Avatar, Box, Button, ButtonBase, Container, Divider, Stack, Typography } from "@mui/material";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useAccount } from "../auth/session";

const tools = [
  { to: "/obras", label: "Obras", description: "Acompanhe seus projetos", icon: HomeWorkOutlinedIcon },
  { to: "/composicoes", label: "Composições", description: "Materiais e custos", icon: CalculateOutlinedIcon },
  { to: "/favoritos", label: "Favoritos", description: "Materiais salvos", icon: StarOutlineRoundedIcon },
  { to: "/historico", label: "Histórico", description: "Recentes e mais buscados", icon: HistoryRoundedIcon, hot: true },
] as const;

export default function MyAreaPage() {
  const user = useAccount();
  const firstName = user.name.split(" ")[0];

  return <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.2, md: 5.5 }, px: { xs: 2, sm: 3, md: 4 } }}>
    <Stack direction="row" alignItems="center" gap={{ xs: 1.2, md: 1.75 }} mb={{ xs: 2.5, md: 4 }}>
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <Avatar src={user.avatarUrl || undefined} sx={{ width: { xs: 52, md: 60 }, height: { xs: 52, md: 60 }, bgcolor: "#e5f2ed", color: "#174a39", border: "2px solid #d3e8e0", fontWeight: 850, boxShadow: "0 7px 20px rgba(19,56,46,.10)" }}>
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
      </Box>
      <Box minWidth={0}>
        <Typography variant="overline" sx={{ color: "#6a8279", fontWeight: 850, letterSpacing: 1.45, lineHeight: 1 }}>Minha área</Typography>
        <Typography component="h1" noWrap sx={{ mt: .4, fontSize: { xs: 27, md: 38 }, lineHeight: 1.04, fontWeight: 900, letterSpacing: "-.04em", background: "linear-gradient(112deg,#13382e,#006b4f 70%,#269b78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Olá, {firstName}.
        </Typography>
        <Typography sx={{ mt: .45, color: "#7b8d86", fontSize: { xs: 12.2, md: 14 } }}>Seu espaço pessoal no Precify.</Typography>
      </Box>
    </Stack>

    <Box component="section" aria-labelledby="my-tools-title">
      <Box mb={{ xs: 1.05, md: 1.5 }}>
        <Typography id="my-tools-title" sx={{ fontSize: { xs: 16, md: 19 }, fontWeight: 850, color: "#244d40", letterSpacing: "-.015em" }}>Seu espaço de trabalho</Typography>
        <Typography sx={{ mt: .2, color: "#8a9994", fontSize: { xs: 10.8, md: 12.5 } }}>Atalhos para o que é seu.</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", md: "repeat(4,minmax(0,1fr))" }, gap: { xs: .8, md: 1.15 } }}>
        {tools.map(({ to, label, description, icon: Icon, ...tool }, index) => {
          const wide = index === 0 || index === 3;
          const featured = index === 0;
          return <Box key={to} component={RouterLink} to={to} sx={{
            position: "relative", overflow: "hidden", gridColumn: { xs: wide ? "1 / -1" : "auto", md: "auto" },
            minHeight: { xs: wide ? (featured ? 92 : 72) : 118, md: 150 }, p: { xs: wide ? 1.35 : 1.2, md: 1.6 },
            borderRadius: { xs: 3, md: 3.2 }, textDecoration: "none", color: "inherit", display: "flex",
            flexDirection: wide ? { xs: "row", md: "column" } : "column", alignItems: wide ? { xs: "center", md: "flex-start" } : "flex-start", gap: { xs: .9, md: 1.15 },
            border: "1px solid", borderColor: featured ? "rgba(0,107,79,.20)" : "rgba(0,107,79,.095)",
            background: featured ? "linear-gradient(135deg,rgba(249,253,251,.98),rgba(226,242,236,.96))" : index === 1 ? "linear-gradient(145deg,#fff,#eef7f4)" : index === 2 ? "linear-gradient(145deg,#fdfefe,#f1f7f5)" : "linear-gradient(145deg,rgba(255,255,255,.96),rgba(238,247,244,.88))",
            boxShadow: featured ? "0 8px 22px rgba(0,107,79,.07)" : "0 4px 15px rgba(24,60,48,.035)",
            transition: "transform 180ms ease,box-shadow 180ms ease,border-color 180ms ease",
            "&::before": { content: '""', position: "absolute", width: { xs: 92, md: 105 }, height: { xs: 92, md: 105 }, right: -34, top: -42, borderRadius: index % 2 === 0 ? "45% 55% 62% 38% / 42% 39% 61% 58%" : "63% 37% 44% 56% / 56% 62% 38% 44%", background: featured ? "rgba(38,155,120,.075)" : "rgba(38,155,120,.04)", transform: `rotate(${index % 2 === 0 ? 15 : -13}deg)` },
            "@media (hover:hover)": { "&:hover": { transform: "translateY(-2px)", borderColor: "rgba(0,107,79,.22)", boxShadow: "0 10px 24px rgba(0,107,79,.07)" } },
            "&:focus-visible": { outline: "2px solid #269b78", outlineOffset: 2 },
          }}>
            <Box sx={{ width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 }, borderRadius: "12px", flexShrink: 0, display: "grid", placeItems: "center", color: "#285e4c", background: "linear-gradient(145deg,#eef8f4,#dfeee8)", border: "1px solid rgba(0,107,79,.065)", position: "relative", zIndex: 1 }}>
              <Icon sx={{ fontSize: { xs: 21, md: 23 } }} />
              {"hot" in tool && tool.hot ? <Box sx={{
                position: "absolute", right: -5, top: -5, width: 18, height: 18, borderRadius: "50%",
                display: "grid", placeItems: "center", bgcolor: "#fff7f1", border: "1px solid rgba(217,108,50,.18)",
                boxShadow: "0 2px 6px rgba(122,62,28,.08)",
              }}>
                <LocalFireDepartmentRoundedIcon sx={{ fontSize: 12, color: "#d96c32" }} />
              </Box> : null}
            </Box>
            <Box minWidth={0} flex={1} position="relative" zIndex={1} sx={{ mt: wide ? 0 : .15 }}>
              <Typography sx={{ fontWeight: 850, fontSize: { xs: 13.2, md: 14.5 }, color: "#234b3e", lineHeight: 1.15 }}>{label}</Typography>
              <Typography sx={{ mt: .28, fontSize: { xs: 9.8, md: 11.5 }, lineHeight: 1.3, color: "#788981" }}>{description}</Typography>
            </Box>
            <Box sx={{ width: 27, height: 27, borderRadius: "9px", display: "grid", placeItems: "center", flexShrink: 0, color: "#658078", bgcolor: "rgba(255,255,255,.60)", border: "1px solid rgba(0,107,79,.065)", position: "relative", zIndex: 1, alignSelf: wide ? { xs: "center", md: "flex-end" } : "flex-end", mt: wide ? { md: "auto" } : "auto" }}>
              <ArrowOutwardRoundedIcon sx={{ fontSize: 15 }} />
            </Box>
          </Box>;
        })}
      </Box>
    </Box>

    <Box component="section" aria-labelledby="account-data-title" sx={{ display: { xs: "block", md: "none" }, mt: 2.7 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={.9}>
        <Typography id="account-data-title" sx={{ fontSize: 15.5, fontWeight: 850, color: "#244d40", letterSpacing: "-.01em" }}>Dados da conta</Typography>
        <Button component={RouterLink} to="/conta" size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ minWidth: 0, px: .6, textTransform: "none", fontSize: 10.5, fontWeight: 750, color: "#477064" }}>Gerenciar</Button>
      </Stack>
      <Box sx={{ borderTop: "1px solid rgba(0,107,79,.09)", borderBottom: "1px solid rgba(0,107,79,.09)", bgcolor: "rgba(255,255,255,.38)" }}>
        <Box component={RouterLink} to="/conta" sx={{ display: "block", color: "inherit", textDecoration: "none", borderRadius: 1.5, "&:focus-visible": { outline: "2px solid #269b78", outlineOffset: 2 } }}>
          <AccountRow icon={PersonOutlineRoundedIcon} label="Dados pessoais" value={user.name} />
        </Box>
        <Divider sx={{ ml: 6.6, borderColor: "rgba(0,107,79,.07)" }} />
        <AccountRow icon={PaidOutlinedIcon} label="Plano" value="Gerenciado pela organização" />
        <Divider sx={{ ml: 6.6, borderColor: "rgba(0,107,79,.07)" }} />
        <AccountRow icon={MailOutlineRoundedIcon} label="E-mail" value={user.email} />
      </Box>
    </Box>

    <Stack direction="row" justifyContent="flex-end" sx={{ display: { xs: "none", md: "flex" }, mt: 2.35 }}>
      <ButtonBase component={RouterLink} to="/conta" sx={{
        minWidth: 188, minHeight: 48, px: 1.15, py: .65, gap: 1,
        borderRadius: "14px", justifyContent: "flex-start", textAlign: "left",
        bgcolor: "rgba(255,255,255,.74)", border: "1px solid rgba(0,107,79,.10)",
        boxShadow: "0 6px 18px rgba(24,60,48,.04)",
        transition: "transform 160ms ease,border-color 160ms ease,box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-1px)", borderColor: "rgba(0,107,79,.20)",
          boxShadow: "0 9px 22px rgba(24,60,48,.065)",
        },
        "&.Mui-focusVisible": { outline: "2px solid rgba(38,155,120,.35)", outlineOffset: 2 },
      }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "10px", display: "grid", placeItems: "center", flexShrink: 0,
          bgcolor: "#eaf5f1", color: "#2d6552", border: "1px solid rgba(0,107,79,.07)",
        }}>
          <ManageAccountsOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box minWidth={0} flex={1}>
          <Typography sx={{ fontSize: 11.8, fontWeight: 820, color: "#244d40", lineHeight: 1.15 }}>Conta e equipe</Typography>
          <Typography sx={{ mt: .18, fontSize: 9.5, color: "#87968f", lineHeight: 1.15 }}>Dados e acessos</Typography>
        </Box>
        <Box sx={{
          width: 28, height: 28, borderRadius: "9px", display: "grid", placeItems: "center",
          color: "#5f7b71", bgcolor: "#f7faf9", border: "1px solid rgba(0,107,79,.07)",
        }}>
          <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
        </Box>
      </ButtonBase>
    </Stack>
  </Container>;
}

function AccountRow({ icon: Icon, label, value }: { icon: typeof PersonOutlineRoundedIcon; label: string; value: string }) {
  return <Stack direction="row" alignItems="center" gap={1.05} sx={{ py: 1.05, px: .2, minHeight: 54 }}>
    <Box sx={{ width: 36, height: 36, borderRadius: "11px", display: "grid", placeItems: "center", flexShrink: 0, bgcolor: "#edf6f3", color: "#315f50" }}><Icon sx={{ fontSize: 19 }} /></Box>
    <Box minWidth={0}>
      <Typography sx={{ fontSize: 9.3, textTransform: "uppercase", letterSpacing: .9, fontWeight: 800, color: "#87948f" }}>{label}</Typography>
      <Typography noWrap sx={{ mt: .18, fontSize: 12.2, fontWeight: 700, color: "#2b5145" }}>{value}</Typography>
    </Box>
  </Stack>;
}
