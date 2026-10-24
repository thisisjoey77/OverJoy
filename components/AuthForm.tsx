"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { UsernameField, blocksSubmit, useUsernameCheck } from "./UsernameField";

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [f, setF] = useState({ username: "", password: "", email: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const uState = useUsernameCheck(mode === "up" ? f.username : "");

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
          first_name: f.first_name || undefined,
          last_name: f.last_name || undefined,
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
        <div className="brand">DayQuid</div>
        <h1>{mode === "in" ? "Sign in" : "Create account"}</h1>

        {mode === "in" ? (
          <label>
            Username or email
            <input value={f.username} onChange={set("username")} autoComplete="username" autoFocus required />
          </label>
        ) : (
          <UsernameField
            label="Username"
            value={f.username}
            onChange={(v) => setF((p) => ({ ...p, username: v }))}
            state={uState}
            autoFocus
          />
        )}
        {mode === "up" && (
          <>
            <div className="row2">
              <label>
                First name <span className="muted">(optional)</span>
                <input value={f.first_name} onChange={set("first_name")} autoComplete="given-name" />
              </label>
              <label>
                Last name <span className="muted">(optional)</span>
                <input value={f.last_name} onChange={set("last_name")} autoComplete="family-name" />
              </label>
            </div>
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
        <button className="btn primary wide" type="submit" disabled={busy || (mode === "up" && blocksSubmit(uState))}>
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
