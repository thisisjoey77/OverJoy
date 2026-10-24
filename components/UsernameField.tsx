"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export type CheckState = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

const USERNAME_RE = /^[A-Za-z0-9_]{3,30}$/;

export const blocksSubmit = (s: CheckState) => s === "taken" || s === "invalid" || s === "checking";

export function useUsernameCheck(value: string, own?: string): CheckState {
  const { checkUsername } = useAuth();
  const [state, setState] = useState<CheckState>("idle");

  useEffect(() => {
    if (!value || value.toLowerCase() === own?.toLowerCase()) {
      setState("idle");
      return;
    }
    if (!USERNAME_RE.test(value)) {
      setState("invalid");
      return;
    }
    setState("checking");
    let stale = false;
    const t = setTimeout(async () => {
      try {
        const r = await checkUsername(value);
        if (!stale) setState(r.available ? "available" : "taken");
      } catch {
        if (!stale) setState("error");
      }
    }, 400);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [value, own, checkUsername]);

  return state;
}

const MESSAGES: Record<CheckState, string> = {
  idle: "",
  checking: "Checking",
  available: "Username is available",
  taken: "Username is already taken",
  invalid: "3-30 letters, numbers or underscores",
  error: "Could not check right now",
};

export function UsernameField({
  label,
  value,
  onChange,
  state,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  state: CheckState;
  autoFocus?: boolean;
}) {
  return (
    <label>
      {label}
      <div className="ind-wrap">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="username"
          autoFocus={autoFocus}
          required
          className={state === "taken" || state === "invalid" ? "bad" : state === "available" ? "good" : ""}
        />
        <span className="ind" aria-hidden="true">
          {state === "checking" && <span className="spin" />}
          {state === "available" && (
            <svg key="ok" width="18" height="18" viewBox="0 0 20 20" className="ind-ok">
              <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
          {(state === "taken" || state === "invalid") && (
            <svg key="x" width="18" height="18" viewBox="0 0 20 20" className="ind-x">
              <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </span>
      </div>
      <span className={"ind-msg " + state} role="status" aria-live="polite">
        {MESSAGES[state]}
      </span>
    </label>
  );
}
