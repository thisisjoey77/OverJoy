"use client";

import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LedgerProvider, useLedger } from "@/lib/store";
import { AuthForm } from "./AuthForm";
import { Header } from "./Header";
import { DisplayPreferences } from "@/lib/displayPreferences";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Gate>{children}</Gate>
    </AuthProvider>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const { user, token, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <AuthForm />;
  return (
    <LedgerProvider userId={String(user.id)} token={token!}>
      <Content>{children}</Content>
    </LedgerProvider>
  );
}

function Content({ children }: { children: ReactNode }) {
  const { ready, loadError, saveError, retryLoad, retrySave } = useLedger();
  if (!ready) return null;
  if (loadError) {
    return (
      <main className="page storage-error">
        <p className="err">Could not load your calendar: {loadError}</p>
        <button className="btn" onClick={retryLoad}>Retry</button>
      </main>
    );
  }
  return (
    <div className="shell">
      <DisplayPreferences>
        <Header />
        {saveError && (
          <div className="storage-warning" role="alert">
            <span>Calendar changes could not be saved: {saveError}</span>
            <button className="link" onClick={retrySave}>Retry</button>
          </div>
        )}
        {children}
      </DisplayPreferences>
    </div>
  );
}
