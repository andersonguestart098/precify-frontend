import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useAccount } from "../auth/session";

export default function AccountGreeting() {
  const user = useAccount();
  return (<Stack direction="row" gap={{ xs: 2.25, md: 1.5, xl: 2.25 }} alignItems="center" mb={{ xs: 3, md: 2.25, xl: 3.5 }}>
      <Avatar src={user.avatarUrl || undefined} alt={user.name} sx={{
        bgcolor: "#e3f2ed", color: "primary.dark", border: "2px solid #006b4f",
        width: { xs: 76, md: 62, xl: 82 }, height: { xs: 76, md: 62, xl: 82 },
        boxShadow: "0 6px 18px #183c302b"
      }}>
        {user.name.charAt(0).toUpperCase()}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: { xs: 15, md: 14, xl: 16 }, lineHeight: 1.3 }}>Olá,</Typography>
        <Typography sx={{ fontSize: { xs: 18, md: 17, xl: 20 }, lineHeight: 1.25, fontWeight: 850 }} color="primary.dark">{user.name}!</Typography>
      </Box>
    </Stack>);
}
