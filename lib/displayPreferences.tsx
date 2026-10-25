"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "dayquid:minimal-calendar-tags";
const Context = createContext<{ compact: boolean; setCompact: (value: boolean) => void } | null>(null);

export function DisplayPreferences({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompact(localStorage.getItem(KEY) === "true");
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, String(compact));
  }, [compact, ready]);

  return <Context.Provider value={{ compact, setCompact }}>{children}</Context.Provider>;
}

export function useDisplayPreferences() {
  const context = useContext(Context);
  if (!context) throw new Error("useDisplayPreferences outside DisplayPreferences");
  return context;
}
