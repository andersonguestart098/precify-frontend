import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { ProtectedImage } from "./ProtectedImage";
import { uploadImage } from "../services/api";
export function ImageUpload({ label, value, onChange, onBusy }: { label: string; value?: string | null; onChange: (url: string) => void; onBusy?: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <Stack gap={.65} minWidth={0}>
    <Typography sx={{ fontSize: { xs: 11.5, sm: 12.5 }, fontWeight: 800, color: "#244d40", lineHeight: 1.2 }}>{label}</Typography>
    <Box sx={{
      height: { xs: 86, sm: 96, md: 104 }, bgcolor: "#f8faf9",
      borderRadius: { xs: "16px", sm: "18px" }, border: "1px solid #dfe7e4",
      display: "grid", placeItems: "center", overflow: "hidden",
    }}>
      {value ? <ProtectedImage src={value} alt={label} sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
        <ImageOutlinedIcon sx={{ color: "#aab8b3", fontSize: { xs: 20, sm: 23 } }} />}
    </Box>
    <Button component="label" variant="outlined" loading={busy} loadingPosition="start" startIcon={<AddPhotoAlternateOutlinedIcon />}
      sx={{
        minHeight: 36, borderRadius: 999, px: { xs: .9, sm: 1.4 }, textTransform: "none",
        fontWeight: 780, fontSize: { xs: 10.2, sm: 11.5 }, whiteSpace: "nowrap",
        borderColor: "#7ab49f", color: "#087458",
        "& .MuiButton-startIcon": { mr: { xs: .45, sm: .7 } },
        "& .MuiSvgIcon-root": { fontSize: { xs: 16, sm: 18 } },
      }}>Escolher imagem
      <input hidden type="file" accept="image/png,image/jpeg" onChange={async e => {
        const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
        setBusy(true); onBusy?.(true); setError("");
        try { const uploaded = await uploadImage(file); onChange(uploaded.url); }
        catch (error) { setError(error instanceof Error ? error.message : "Falha ao enviar imagem."); }
        finally { setBusy(false); onBusy?.(false); }
      }} />
    </Button>
    <Typography sx={{ fontSize: { xs: 9.2, sm: 10.2 }, color: "#7f918a", lineHeight: 1.25 }}>PNG ou JPEG, até 5 MB.</Typography>
    {error && <Alert severity="error" sx={{ py: .25, "& .MuiAlert-message": { fontSize: 10.5 } }}>{error}</Alert>}
  </Stack>;
}
