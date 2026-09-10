import { createContext, useContext } from "react";
import type { Account, AuthSession } from "../services/api";
export interface SessionState {
  user: Account | null; checking: boolean; error: string | null;
  signIn: (session: AuthSession) => void; signOut: () => void; retry: () => void;
}
export const SessionContext = createContext<SessionState | null>(null);
export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("SessionProvider ausente.");
  return session;
}
export function useAccount() {
  const { user } = useSession();
  if (!user) throw new Error("Página exige sessão autenticada.");
  return user;
}
