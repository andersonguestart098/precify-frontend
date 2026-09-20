import { useEffect, useRef, useState } from "react";
import { saveFavorite } from "../services/api";
import { useAccount } from "../auth/session";
import {
  getCachedFavoriteCodes, loadFavoriteCodesCached, saveCachedFavoriteCodes,
} from "../services/appWarmCache";

export function useFavorites() {
  const user = useAccount();
  const [codes, setCodes] = useState<Set<string>>(() => new Set(getCachedFavoriteCodes(user.id) ?? []));
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(() => !getCachedFavoriteCodes(user.id));
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const pending = useRef(new Set<string>());

  useEffect(() => {
    mounted.current = true;
    let active = true;
    loadFavoriteCodesCached(user.id)
      .then(values => { if (active) setCodes(new Set(values)); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Falha nos favoritos."); })
      .finally(() => { if (active) setLoading(false); });

    const syncFromCache = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId && detail.userId !== user.id) return;
      const cached = getCachedFavoriteCodes(user.id);
      if (cached) setCodes(new Set(cached));
    };
    window.addEventListener("precify-app-data-refreshed", syncFromCache);

    return () => {
      active = false;
      mounted.current = false;
      window.removeEventListener("precify-app-data-refreshed", syncFromCache);
    };
  }, [user.id]);

  const toggle = async (code: string) => {
    if (loading || pending.current.has(code)) return false;
    const next = !codes.has(code);
    pending.current.add(code);
    setBusy(new Set(pending.current));
    setError(null);
    try {
      await saveFavorite(code, next);
      if (mounted.current) {
        setCodes(current => {
          const updated = new Set(current);
          if (next) updated.add(code); else updated.delete(code);
          saveCachedFavoriteCodes(user.id, [...updated]);
          return updated;
        });
      }
      return true;
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : "Falha ao salvar favorito.");
      return false;
    } finally {
      pending.current.delete(code);
      if (mounted.current) setBusy(new Set(pending.current));
    }
  };

  return { codes, busy, loading, error, toggle };
}
