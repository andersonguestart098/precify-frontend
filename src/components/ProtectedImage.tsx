import { useEffect, useState } from "react";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { Box, type SxProps, type Theme } from "@mui/material";
import { imageAddress, imageBlob, internalImagePath } from "../services/api";
export function ProtectedImage({ src, alt, sx }: { src?: string | null; alt: string; sx?: SxProps<Theme> }) {
  const address = imageAddress(src);
  const path = address ? internalImagePath(address) : null;
  const [loaded, setLoaded] = useState<{ source: string; url: string } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    if (!path || !address) return;
    const controller = new AbortController(); let blobUrl: string | undefined;
    imageBlob(path, controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      blobUrl = URL.createObjectURL(blob); setLoaded({ source: address, url: blobUrl });
    }).catch(() => { if (!controller.signal.aborted) setFailed(address); });
    return () => { controller.abort(); if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [path, address]);
  const resolved = path ? (loaded && loaded.source === address ? loaded.url : undefined) : address;
  return <Box sx={[{ position: "relative", bgcolor: "grey.50", display: "grid", placeItems: "center", overflow: "hidden", boxSizing: "border-box" }, ...(Array.isArray(sx) ? sx : [sx ?? {}])]}>
    {resolved && failed !== address ? <Box component="img" src={resolved} alt={alt} loading="lazy"
      onError={() => setFailed(address ?? null)} sx={{ position: "absolute", inset: "12px", width: "calc(100% - 24px)", height: "calc(100% - 24px)", objectFit: "contain" }} /> :
      <ImageOutlinedIcon role="img" aria-label={alt + " não disponível"} sx={{ color: "#b9c1c6", fontSize: 44 }} />}
  </Box>;
}
