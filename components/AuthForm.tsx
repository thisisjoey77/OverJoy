"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [f, setF] = useState({ username: "", password: "", email: "", display_name: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "in") await signIn(f.username, f.password);
      else
        await signUp({
          username: f.username,
          password: f.password,
          email: f.email || undefined,
          display_name: f.display_name || undefined,
        });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth fade" onSubmit={submit}>
        <div className="brand">Ledger</div>
        <h1>{mode === "in" ? "Sign in" : "Create account"}</h1>

        <label>
          {mode === "in" ? "Username or email" : "Username"}
          <input value={f.username} onChange={set("username")} autoComplete="username" autoFocus required />
        </label>
        {mode === "up" && (
          <>
            <label>
              Name <span className="muted">(optional)</span>
              <input value={f.display_name} onChange={set("display_name")} autoComplete="name" />
            </label>
            <label>
              Email <span className="muted">(optional)</span>
              <input type="email" value={f.email} onChange={set("email")} autoComplete="email" />
            </label>
          </>
        )}
        <label>
          Password
          <input
            type="password"
            value={f.password}
            onChange={set("password")}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            minLength={mode === "up" ? 8 : undefined}
            required
          />
        </label>

        {error && <p className="err">{error}</p>}
        <button className="btn primary wide" type="submit" disabled={busy}>
          {mode === "in" ? "Sign in" : "Sign up"}
        </button>
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError("");
          }}
        >
          {mode === "in" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
