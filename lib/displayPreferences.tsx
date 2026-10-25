"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { TagAppearance } from "@/components/TagVisual";

const KEY = "dayquid:minimal-calendar-tags";
const APPEARANCE_KEY = "dayquid:tag-appearance";
const Context = createContext<{
  compact: boolean;
  setCompact: (value: boolean) => void;
  appearance: TagAppearance;
  setAppearance: (value: TagAppearance) => void;
} | null>(null);

export function DisplayPreferences({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);
  const [appearance, setAppearance] = useState<TagAppearance>("markers");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompact(localStorage.getItem(KEY) === "true");
    const savedAppearance = localStorage.getItem(APPEARANCE_KEY);
    setAppearance(savedAppearance === "amount" || savedAppearance === "squares" ? savedAppearance : "markers");
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(KEY, String(compact));
      localStorage.setItem(APPEARANCE_KEY, appearance);
    }
  }, [appearance, compact, ready]);

  return <Context.Provider value={{ compact, setCompact, appearance, setAppearance }}>{children}</Context.Provider>;
}

export function useDisplayPreferences() {
  const context = useContext(Context);
  if (!context) throw new Error("useDisplayPreferences outside DisplayPreferences");
  return context;
}
