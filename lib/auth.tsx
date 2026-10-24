"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, type User } from "./api";

const TOKEN_KEY = "account-site:token";

type Profile = { username?: string; email?: string | null; display_name?: string | null };

type Ctx = {
  ready: boolean;
  user: User | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (b: { username: string; password: string; email?: string; display_name?: string }) => Promise<void>;
  signOut: () => void;
  updateProfile: (p: Profile) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setReady(true);
      return;
    }
    api<User>("/me", { token: t })
      .then((u) => {
        setToken(t);
        setUser(u);
      })
      .catch((e) => {
        // Keep the token when the server is merely unreachable.
        if (e.status === 401) localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setReady(true));
  }, []);

  const start = useCallback((r: { token: string; user: User }) => {
    localStorage.setItem(TOKEN_KEY, r.token);
    setToken(r.token);
    setUser(r.user);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      user,
      signIn: async (username, password) =>
        start(await api("/auth/signin", { body: { username, password } })),
      signUp: async (b) => start(await api("/auth/signup", { body: b })),
      signOut,
      updateProfile: async (p) =>
        setUser(await api<User>("/me", { method: "PATCH", body: p, token })),
      changePassword: (current_password, new_password) =>
        api("/me/password", { body: { current_password, new_password }, token }),
      deleteAccount: async (password) => {
        await api("/me", { method: "DELETE", body: { password }, token });
        signOut();
      },
    }),
    [ready, user, token, start, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
