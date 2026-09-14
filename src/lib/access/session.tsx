import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import {
  getSession,
  login as loginFn,
  logout as logoutFn,
} from "./actions";
import type { SessionInfo } from "./types";
import type { PageKey } from "./types";

const sessionKey = ["access-session"] as const;

export function useAccessSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: () => getSession(),
    staleTime: 30_000,
    retry: false,
  });
}

export function useAccessAuth() {
  const qc = useQueryClient();
  const sessionQuery = useAccessSession();

  const login = useMutation({
    mutationFn: (data: { username: string; password: string }) => loginFn({ data }),
    onSuccess: (data) => {
      qc.setQueryData(sessionKey, data);
    },
  });

  const logout = useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => {
      qc.setQueryData(sessionKey, null);
    },
  });

  const session = sessionQuery.data ?? null;
  const canEdit = Boolean(session?.permissions.canEdit || session?.user.role === "admin");
  const canPage = (page: PageKey) => {
    if (!session) return false;
    if (session.user.role === "admin") return true;
    return session.permissions.pages.includes(page);
  };

  return {
    session,
    isLoading: sessionQuery.isLoading,
    canEdit,
    canPage,
    login,
    logout,
    refresh: () => qc.invalidateQueries({ queryKey: sessionKey }),
  };
}

const AccessCtx = createContext<ReturnType<typeof useAccessAuth> | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const value = useAccessAuth();
  return <AccessCtx.Provider value={value}>{children}</AccessCtx.Provider>;
}

export function useAccess() {
  const ctx = useContext(AccessCtx);
  if (!ctx) throw new Error("useAccess must be used within AccessProvider");
  return ctx;
}
