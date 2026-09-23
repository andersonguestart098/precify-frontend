import { useEffect, useMemo, useRef, useState } from "react";
import { saveWorkspaceFavorite, workspaceFavorites, type WorkspaceFavoriteType } from "../services/api";

const emptyFavorites = () => ({
  WORK: new Set<string>(),
  LABOR: new Set<string>(),
  COMPOSITION: new Set<string>(),
});

export function useWorkspaceFavorites() {
  const [favorites, setFavorites] = useState(emptyFavorites);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const pending = useRef(new Set<string>());

  useEffect(() => {
    mounted.current = true;
    let active = true;
    workspaceFavorites()
      .then(data => {
        if (!active) return;
        setFavorites({
          WORK: new Set(data.WORK ?? []),
          LABOR: new Set(data.LABOR ?? []),
          COMPOSITION: new Set(data.COMPOSITION ?? []),
        });
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : "Falha ao carregar favoritos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, []);

  const keyFor = (type: WorkspaceFavoriteType, id: string) => `${type}:${id}`;

  const toggle = async (type: WorkspaceFavoriteType, id: string) => {
    const key = keyFor(type, id);
    if (loading || pending.current.has(key)) return false;
    const next = !favorites[type].has(id);
    pending.current.add(key);
    setBusy(new Set(pending.current));
    setError(null);
    try {
      await saveWorkspaceFavorite(type, id, next);
      if (mounted.current) {
        setFavorites(current => {
          const updated = {
            WORK: new Set(current.WORK),
            LABOR: new Set(current.LABOR),
            COMPOSITION: new Set(current.COMPOSITION),
          };
          if (next) updated[type].add(id); else updated[type].delete(id);
          return updated;
        });
      }
      return true;
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : "Falha ao salvar favorito.");
      return false;
    } finally {
      pending.current.delete(key);
      if (mounted.current) setBusy(new Set(pending.current));
    }
  };

  const counts = useMemo(() => ({
    WORK: favorites.WORK.size,
    LABOR: favorites.LABOR.size,
    COMPOSITION: favorites.COMPOSITION.size,
  }), [favorites]);

  return {
    favorites,
    counts,
    loading,
    busy,
    error,
    toggle,
    isBusy: (type: WorkspaceFavoriteType, id: string) => busy.has(keyFor(type, id)),
  };
}
