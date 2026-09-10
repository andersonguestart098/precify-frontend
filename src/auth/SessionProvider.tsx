import { useEffect, useState, type ReactNode } from "react";
import { currentUser, type Account, type AuthSession } from "../services/api";
import { SessionContext } from "./session";
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [expiry, setExpiry] = useState(0);
  const signOut = () => {
    sessionStorage.removeItem("precify-token"); setUser(null); setExpiry(0); setError(null); setChecking(false);
  };
  const signIn = (session: AuthSession) => {
    sessionStorage.setItem("precify-token", session.accessToken);
    setExpiry(Date.parse(session.expiresAt)); setUser(session.user); setError(null); setChecking(false);
  };
  useEffect(() => {
    const controller = new AbortController();
    const expired = () => {
      sessionStorage.removeItem("precify-token"); setUser(null); setExpiry(0); setError(null); setChecking(false);
    };
    window.addEventListener("precify-session-expired", expired);
    const token = sessionStorage.getItem("precify-token");
    if (!token) setChecking(false);
    else {
      setChecking(true);
      currentUser(controller.signal).then(account => {
        if (controller.signal.aborted) return;
        // The API validates the token; exp here only schedules the login redirect.
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp: number };
        if (!Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) { expired(); return; }
        setUser(account); setExpiry(payload.exp * 1000); setError(null);
      }).catch(e => {
        if (!controller.signal.aborted && sessionStorage.getItem("precify-token"))
          setError(e instanceof Error ? e.message : "Não foi possível validar a sessão.");
      }).finally(() => { if (!controller.signal.aborted) setChecking(false); });
    }
    return () => { controller.abort(); window.removeEventListener("precify-session-expired", expired); };
  }, [revision]);
  useEffect(() => {
    if (!expiry) return;
    const timeout = window.setTimeout(() => {
      sessionStorage.removeItem("precify-token"); setUser(null); setExpiry(0);
    }, Math.max(0, expiry - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [expiry]);
  return <SessionContext.Provider value={{ user, checking, error, signIn, signOut, retry: () => setRevision(n => n + 1) }}>{children}</SessionContext.Provider>;
}
