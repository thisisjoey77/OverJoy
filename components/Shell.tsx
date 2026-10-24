"use client";

import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LedgerProvider, useLedger } from "@/lib/store";
import { AuthForm } from "./AuthForm";
import { Header } from "./Header";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Gate>{children}</Gate>
    </AuthProvider>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <AuthForm />;
  return (
    <LedgerProvider userId={String(user.id)}>
      <Content>{children}</Content>
    </LedgerProvider>
  );
}

function Content({ children }: { children: ReactNode }) {
  const { ready } = useLedger();
  if (!ready) return null;
  return (
    <div className="shell">
      <Header />
      {children}
    </div>
  );
}
