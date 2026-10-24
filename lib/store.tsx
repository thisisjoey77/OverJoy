"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { repository } from "./repository";

export type Tag = { id: string; name: string; color: string; bg: string };
export type Entry = {
  id: string;
  date: string;
  amount: number;
  note: string;
  general: string;
  specific: string;
};
export type Kind = "general" | "specific";
export type Data = { general: Tag[]; specific: Tag[]; entries: Entry[] };

const uid = () => crypto.randomUUID();

const seed = (): Data => {
  const g = (name: string, color: string, bg: string): Tag => ({ id: uid(), name, color, bg });
  const general = [
    g("Food", "#5c4a1a", "#fbeab8"),
    g("Groceries", "#2f4a22", "#d5e8c8"),
    g("Transportation", "#555555", "#ececea"),
    g("Date", "#6b2d4a", "#f3d3e2"),
    g("Personal", "#ffffff", "#2f5a4e"),
    g("Subscription", "#ffffff", "#5a3c8c"),
  ];
  const s = (name: string, color: string, bg: string): Tag => ({ id: uid(), name, color, bg });
  const specific = [
    s("CVS", "#ffffff", "#c0281e"),
    s("Uber", "#ffffff", "#000000"),
    s("Lime", "#000000", "#5fd33e"),
    s("Zipcar", "#ffffff", "#66a52f"),
    s("Restaurant", "#ffffff", "#ee7a30"),
    s("Vending", "#000000", "#a9d6e0"),
    s("Hotel", "#c4e05a", "#243624"),
  ];
  return { general, specific, entries: [] };
};

type Ctx = {
  ready: boolean;
  general: Tag[];
  specific: Tag[];
  entries: Entry[];
  tag: (kind: Kind, id: string) => Tag | undefined;
  addEntry: (e: Omit<Entry, "id">) => void;
  updateEntry: (id: string, e: Omit<Entry, "id">) => void;
  removeEntry: (id: string) => void;
  addTag: (kind: Kind, name: string) => void;
  updateTag: (kind: Kind, id: string, patch: Partial<Tag>) => void;
  removeTag: (kind: Kind, id: string) => void;
};

const LedgerContext = createContext<Ctx | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({ general: [], specific: [], entries: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    repository
      .load()
      .then((d) => setData(d ?? seed()))
      .catch(() => setData(seed()))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) void repository.save(data);
  }, [data, ready]);

  const tag = useCallback(
    (kind: Kind, id: string) => data[kind].find((t) => t.id === id),
    [data],
  );

  const value = useMemo<Ctx>(
    () => ({
      ready,
      general: data.general,
      specific: data.specific,
      entries: data.entries,
      tag,
      addEntry: (e) =>
        setData((d) => ({ ...d, entries: [...d.entries, { ...e, id: uid() }] })),
      updateEntry: (id, e) =>
        setData((d) => ({
          ...d,
          entries: d.entries.map((x) => (x.id === id ? { ...e, id } : x)),
        })),
      removeEntry: (id) =>
        setData((d) => ({ ...d, entries: d.entries.filter((x) => x.id !== id) })),
      addTag: (kind, name) =>
        setData((d) => ({
          ...d,
          [kind]: [...d[kind], { id: uid(), name, color: "#111111", bg: "#ececea" }],
        })),
      updateTag: (kind, id, patch) =>
        setData((d) => ({
          ...d,
          [kind]: d[kind].map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTag: (kind, id) =>
        setData((d) => ({
          ...d,
          [kind]: d[kind].filter((t) => t.id !== id),
          entries: d.entries.map((e) => (e[kind] === id ? { ...e, [kind]: "" } : e)),
        })),
    }),
    [data, ready, tag],
  );

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export const useLedger = () => {
  const c = useContext(LedgerContext);
  if (!c) throw new Error("useLedger outside provider");
  return c;
};
