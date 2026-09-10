import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { ProtectedImage } from "./ProtectedImage";
import { uploadImage } from "../services/api";
export function ImageUpload({ label, value, onChange, onBusy }: { label: string; value?: string | null; onChange: (url: string) => void; onBusy?: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <Stack gap={1}>
    <Typography variant="body2" fontWeight={700}>{label}</Typography>
    <Box sx={{ height: 120, bgcolor: "grey.50", borderRadius: 2, border: 1, borderColor: "divider", display: "grid", placeItems: "center", overflow: "hidden" }}>
      {value ? <ProtectedImage src={value} alt={label} sx={{ width: "100%", height: 110 }} /> : <ImageOutlinedIcon color="disabled" />}
    </Box>
    <Button component="label" variant="outlined" loading={busy} loadingPosition="start" startIcon={<AddPhotoAlternateOutlinedIcon />}>Escolher imagem
      <input hidden type="file" accept="image/png,image/jpeg" onChange={async e => {
        const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
        setBusy(true); onBusy?.(true); setError("");
        try { const uploaded = await uploadImage(file); onChange(uploaded.url); }
        catch (error) { setError(error instanceof Error ? error.message : "Falha ao enviar imagem."); }
        finally { setBusy(false); onBusy?.(false); }
      }} />
    </Button>
    <Typography variant="caption" color="text.secondary">PNG ou JPEG, até 5 MB.</Typography>
    {error && <Alert severity="error">{error}</Alert>}
  </Stack>;
}
