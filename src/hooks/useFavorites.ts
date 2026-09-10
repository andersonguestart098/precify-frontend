import { useEffect, useRef, useState } from "react";
import { favoriteCodes, saveFavorite } from "../services/api";
export function useFavorites() {
  const [codes, setCodes] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const pending = useRef(new Set<string>());
  useEffect(() => {
    mounted.current = true;
    let active = true;
    favoriteCodes().then(values => { if (active) setCodes(new Set(values)); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Falha nos favoritos."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; mounted.current = false; };
  }, []);
  const toggle = async (code: string) => {
    if (loading || pending.current.has(code)) return false;
    const next = !codes.has(code);
    pending.current.add(code); setBusy(new Set(pending.current)); setError(null);
    try {
      await saveFavorite(code, next);
      if (mounted.current) setCodes(current => { const updated = new Set(current); if (next) updated.add(code); else updated.delete(code); return updated; });
      return true;
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : "Falha ao salvar favorito."); return false; }
    finally { pending.current.delete(code); if (mounted.current) setBusy(new Set(pending.current)); }
  };
  return { codes, busy, loading, error, toggle };
}
