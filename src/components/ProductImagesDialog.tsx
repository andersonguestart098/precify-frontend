import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { CatalogOffer } from "../domain/search";
import { updateProductImages } from "../services/api";
import { ImageUpload } from "./ImageUpload";
export function ProductImagesDialog({ offer, onClose, onSaved }: { offer: CatalogOffer; onClose: () => void; onSaved: () => void }) {
  const [changes, setChanges] = useState<{ imageUrl?: string; supplierLogoUrl?: string }>({});
  const [uploads, setUploads] = useState(0); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const onBusy = (busy: boolean) => setUploads(n => n + (busy ? 1 : -1));
  return <Dialog open onClose={saving || uploads ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>Fotos de {offer.name}</DialogTitle><DialogContent>
      {error && <Alert severity="error">{error}</Alert>}
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2} mt={1}>
        <ImageUpload label="Foto do produto" value={changes.imageUrl ?? offer.imageUrl} onChange={url => setChanges(c => ({ ...c, imageUrl: url }))} onBusy={onBusy} />
        <ImageUpload label="Logo do fornecedor" value={changes.supplierLogoUrl ?? offer.supplierLogoUrl} onChange={url => setChanges(c => ({ ...c, supplierLogoUrl: url }))} onBusy={onBusy} />
      </Box>
    </DialogContent><DialogActions><Button disabled={saving || uploads > 0} onClick={onClose}>Cancelar</Button><Button variant="contained" loading={saving} loadingPosition="start" startIcon={<SaveOutlinedIcon />} disabled={saving || uploads > 0 || !Object.keys(changes).length} onClick={async () => {
      setSaving(true); setError("");
      try { await updateProductImages(offer.productId, changes); onSaved(); onClose(); }
      catch (e) { setError(e instanceof Error ? e.message : "Falha ao salvar."); }
      finally { setSaving(false); }
    }}>Salvar imagens</Button></DialogActions>
  </Dialog>;
}
