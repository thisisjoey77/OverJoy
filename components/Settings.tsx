"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { UsernameField, blocksSubmit, useUsernameCheck } from "./UsernameField";

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
  const [p, setP] = useState({
    username: user?.username ?? "",
    display_name: user?.display_name ?? "",
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
        <h2>Profile</h2>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            profile.run(
              () =>
                updateProfile({
                  username: p.username,
                  display_name: p.display_name || null,
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
          <label>
            Name
            <input value={p.display_name} onChange={(e) => setP({ ...p, display_name: e.target.value })} />
          </label>
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
