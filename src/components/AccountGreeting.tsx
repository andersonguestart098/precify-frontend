import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useAccount } from "../auth/session";

export default function AccountGreeting() {
  const user = useAccount();
  return (<Stack direction="row" gap={2.25} alignItems="center" mb={{ xs: 3, md: 3.5 }}>
      <Avatar src={user.avatarUrl || undefined} alt={user.name} sx={{ bgcolor: "#e3f2ed", color: "primary.dark", border: "2px solid #006b4f", width: { xs: 76, md: 82 }, height: { xs: 76, md: 82 }, boxShadow: "0 6px 18px #183c302b" }}>
        {user.name.charAt(0).toUpperCase()}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: { xs: 15, md: 16 }, lineHeight: 1.3 }}>Olá,</Typography>
        <Typography sx={{ fontSize: { xs: 18, md: 20 }, lineHeight: 1.25, fontWeight: 850 }} color="primary.dark">{user.name}!</Typography>
      </Box>
    </Stack>);
}
