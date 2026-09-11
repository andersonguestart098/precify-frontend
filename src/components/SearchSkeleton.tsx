import { Box, Container, Paper, Skeleton, Stack } from "@mui/material";
const motion = { "@media (prefers-reduced-motion: reduce)": { "& .MuiSkeleton-root, & .MuiSkeleton-root::after": { animation: "none" } } };
export function ResultSkeletons() {
  return <Stack gap={2} role="status" aria-label="Carregando materiais" aria-busy="true" sx={motion}>
    {[0, 1, 2].map(n => <Paper key={n} variant="outlined" aria-hidden="true" sx={{ p: 2, borderRadius: 4, borderColor: "#e0ebe7" }}>
      <Stack direction={{ xs: "column", sm: "row" }} gap={2.5}>
        <Skeleton animation="wave" variant="rounded" sx={{ width: { xs: "100%", sm: 230 }, height: 220, borderRadius: 3, flexShrink: 0, bgcolor: "#edf2f0" }} />
        <Stack gap={1} flex={1}>
          <Skeleton animation="wave" width="45%" height={22} />
          <Skeleton animation="wave" width="85%" height={34} />
          <Skeleton animation="wave" width="65%" height={24} />
          <Skeleton animation="wave" width="40%" height={28} />
          <Skeleton animation="wave" width="55%" height={36} sx={{ mt: 2 }} />
          <Skeleton animation="wave" variant="rounded" height={48} sx={{ borderRadius: "999px", mt: 1 }} />
        </Stack>
      </Stack>
    </Paper>)}
  </Stack>;
}
export function SearchSkeleton() {
  return <Container maxWidth="xl" aria-busy="true" aria-label="Carregando busca" sx={{ py: { xs: 4, md: 5 }, ...motion }}>
    <Box aria-hidden="true" display="grid" gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }} gap={3} alignItems="end" mb={4}>
      <Box>
        <Stack direction="row" alignItems="center" gap={2} mb={2.5}>
          <Skeleton animation="wave" variant="circular" width={68} height={68} />
          <Box><Skeleton animation="wave" width={40} /><Skeleton animation="wave" width={100} height={28} /></Box>
        </Stack>
        <Skeleton animation="wave" variant="rounded" height={112} sx={{ maxWidth: 440, mb: 1.5 }} />
        <Skeleton animation="wave" width="90%" height={26} />
      </Box>
      <Skeleton animation="wave" variant="rounded" height={54} sx={{ borderRadius: "999px" }} />
    </Box>
    <Box aria-hidden="true" mb={2.5}>
      <Skeleton animation="wave" width={150} height={28} sx={{ mb: 1 }} />
      <Stack direction="row" gap={1} sx={{ overflow: "hidden", py: 1, px: .5 }}>
        {Array.from({ length: 14 }, (_, i) => <Stack key={i} alignItems="center" gap={1} sx={{ width: 78, flexShrink: 0 }}>
          <Skeleton animation="wave" variant="circular" width={48} height={48} />
          <Skeleton animation="wave" width={62} height={25} />
        </Stack>)}
      </Stack>
    </Box>
    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "300px minmax(0,1fr)" }} gap={3}>
      <Skeleton animation="wave" variant="rounded" height={540} sx={{ display: { xs: "none", md: "block" }, borderRadius: 4 }} />
      <Box><Skeleton animation="wave" width={180} height={24} /><Skeleton animation="wave" width="70%" height={38} sx={{ mb: 2 }} /><ResultSkeletons /></Box>
    </Box>
  </Container>;
}
