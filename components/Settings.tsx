"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { UsernameField, blocksSubmit, useUsernameCheck } from "./UsernameField";
import { useDisplayPreferences } from "@/lib/displayPreferences";
import { TagVisual, type TagAppearance } from "./TagVisual";

const sampleGeneral = { id: "preview-food", name: "Food", color: "#5c4a1a", bg: "#fbeab8" };
const sampleSpecific = { id: "preview-cafe", name: "Cafe", color: "#ffffff", bg: "#2f5a4e" };

function AppearancePreview({ appearance }: { appearance: TagAppearance }) {
  return (
    <div className="appearance-day" aria-label="Example day with two expenditures">
      <div className="appearance-day-head"><span>Tue 24</span><span>$18.50</span></div>
      <div className="appearance-entry">
        {appearance === "markers" && <span className="mini-amt">$12.50</span>}
        <TagVisual general={sampleGeneral} specific={sampleSpecific} amount="$12.50" appearance={appearance} />
      </div>
      <div className="appearance-entry">
        {appearance === "markers" && <span className="mini-amt">$6.00</span>}
        <TagVisual general={sampleGeneral} amount="$6.00" appearance={appearance} />
      </div>
    </div>
  );
}

function useAction() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (fn: () => Promise<void>, done: string) => {
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: done });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  };
  return { msg, run };
}

const Msg = ({ m }: { m: { ok: boolean; text: string } | null }) =>
  m && <p className={m.ok ? "ok" : "err"}>{m.text}</p>;

export function Settings() {
  const { user, updateProfile, changePassword, deleteAccount, signOut } = useAuth();
  const { appearance, setAppearance } = useDisplayPreferences();
  const [p, setP] = useState({
    username: user?.username ?? "",
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
  });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [del, setDel] = useState("");
  const profile = useAction();
  const uState = useUsernameCheck(p.username, user?.username);
  const password = useAction();
  const danger = useAction();

  return (
    <div className="settings">
      <section className="fade">
        <h2>Appearance</h2>
        <p className="muted small section-intro">Choose how minimized calendar entries are displayed.</p>
        <div className="appearance-options" role="radiogroup" aria-label="Minimal tag style">
          <button
            type="button"
            role="radio"
            aria-checked={appearance === "markers"}
            className={"appearance-choice" + (appearance === "markers" ? " selected" : "")}
            onClick={() => setAppearance("markers")}
          >
            <span className="appearance-choice-title">Minimal markers</span>
            <span className="muted small">Keep the amount separate from the tags.</span>
            <AppearancePreview appearance="markers" />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={appearance === "amount"}
            className={"appearance-choice" + (appearance === "amount" ? " selected" : "")}
            onClick={() => setAppearance("amount")}
          >
            <span className="appearance-choice-title">Amount inside tag</span>
            <span className="muted small">Combine the amount and tag shape.</span>
            <AppearancePreview appearance="amount" />
          </button>
        </div>
      </section>

      <section className="fade">
        <h2>Profile</h2>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            profile.run(
              () =>
                updateProfile({
                  username: p.username,
                  first_name: p.first_name || null,
                  last_name: p.last_name || null,
                  email: p.email || null,
                }),
              "Saved",
            );
          }}
        >
          <UsernameField
            label="Username"
            value={p.username}
            onChange={(v) => setP({ ...p, username: v })}
            state={uState}
          />
          <div className="row2">
            <label>
              First name
              <input value={p.first_name} onChange={(e) => setP({ ...p, first_name: e.target.value })} autoComplete="given-name" />
            </label>
            <label>
              Last name
              <input value={p.last_name} onChange={(e) => setP({ ...p, last_name: e.target.value })} autoComplete="family-name" />
            </label>
          </div>
          <label>
            Email
            <input type="email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} />
          </label>
          <Msg m={profile.msg} />
          <button className="btn primary" type="submit" disabled={blocksSubmit(uState)}>Save</button>
        </form>
      </section>

      <section className="fade">
        <h2>Password</h2>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            password.run(async () => {
              await changePassword(pw.current, pw.next);
              setPw({ current: "", next: "" });
            }, "Password updated");
          }}
        >
          <label>
            Current password
            <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" required />
          </label>
          <label>
            New password
            <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" minLength={8} required />
          </label>
          <Msg m={password.msg} />
          <button className="btn primary" type="submit">Update password</button>
        </form>
      </section>

      <section className="fade">
        <h2>Session</h2>
        <button className="btn" onClick={signOut}>Sign out</button>
      </section>

      <section className="fade">
        <h2>Delete account</h2>
        <p className="muted small">Permanently removes your account and all its data on the server.</p>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (confirm("Delete your account permanently?")) danger.run(() => deleteAccount(del), "Deleted");
          }}
        >
          <label>
            Confirm with password
            <input type="password" value={del} onChange={(e) => setDel(e.target.value)} autoComplete="current-password" required />
          </label>
          <Msg m={danger.msg} />
          <button className="btn danger" type="submit">Delete account</button>
        </form>
      </section>
    </div>
  );
}
