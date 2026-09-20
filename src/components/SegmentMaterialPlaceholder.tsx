import { Box } from "@mui/material";
import { segmentIconFor } from "./SegmentCarousel";

export function SegmentMaterialPlaceholder({
  segmentCode,
  label,
}: {
  segmentCode?: string | null;
  label: string;
}) {
  const Icon = segmentIconFor(segmentCode?.trim() ?? "");

  return <Box
    role="img"
    aria-label={`${label} sem imagem cadastrada`}
    sx={{
      width: "100%",
      height: "100%",
      minHeight: "inherit",
      display: "grid",
      placeItems: "center",
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(145deg,rgba(248,251,250,.96),rgba(239,246,243,.92))",
      "&::before": {
        content: '""',
        position: "absolute",
        width: "62%",
        aspectRatio: "1",
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(0,107,79,.075) 0%,rgba(0,107,79,.028) 48%,transparent 72%)",
      },
    }}
  >
    <Box sx={{
      width: { xs: 72, md: 64, xl: 78 },
      height: { xs: 72, md: 64, xl: 78 },
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      position: "relative",
      color: "rgba(36,86,69,.34)",
      background: "rgba(255,255,255,.52)",
      border: "1px solid rgba(0,107,79,.055)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.82)",
    }}>
      <Icon size={38} weight="duotone" aria-hidden="true" style={{ opacity: .82 }} />
    </Box>
  </Box>;
}
