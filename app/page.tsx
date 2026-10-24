"use client";

import { useMemo, useState } from "react";
import { LedgerProvider, useLedger } from "@/lib/store";
import {
  DOW, MONTHS, addDays, addMonths, fmt, money, parse, shortDate, startOfWeek,
} from "@/lib/date";
import { EntryForm, EntryRow } from "@/components/Entries";
import { MonthView, WeekView } from "@/components/Views";
import { Summary } from "@/components/Summary";
import { TagManager } from "@/components/TagManager";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";
import { Settings } from "@/components/Settings";

type View = "day" | "week" | "month" | "tags" | "settings";
const VIEWS: { id: View; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "tags", label: "Tags" },
  { id: "settings", label: "Settings" },
];

function App() {
  const { entries, ready } = useLedger();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => fmt(new Date()));
  const cur = parse(cursor);

  const [from, to, label] = useMemo(() => {
    if (view === "week") {
      const s = startOfWeek(cur);
      const e = addDays(s, 6);
      return [fmt(s), fmt(e), `${shortDate(s)} – ${shortDate(e)}, ${e.getFullYear()}`];
    }
    if (view === "month") {
      const s = new Date(cur.getFullYear(), cur.getMonth(), 1);
      const e = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
      return [fmt(s), fmt(e), `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`];
    }
    return [cursor, cursor, `${DOW[cur.getDay()]}, ${shortDate(cur)}, ${cur.getFullYear()}`];
  }, [view, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  const inRange = useMemo(
    () => entries.filter((e) => e.date >= from && e.date <= to),
    [entries, from, to],
  );
  const total = inRange.reduce((s, e) => s + e.amount, 0);

  const step = (dir: number) => {
    if (view === "month") setCursor(fmt(addMonths(cur, dir)));
    else setCursor(fmt(addDays(cur, dir * (view === "week" ? 7 : 1))));
  };
  const openDay = (d: string) => {
    setCursor(d);
    setView("day");
  };

  if (!ready) return null;

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">OverJoy</div>
        <nav className="tabs">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={"tab" + (view === v.id ? " on" : "")}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </nav>
      </header>

      {view === "settings" ? (
        <main className="page narrow">
          <Settings />
        </main>
      ) : view === "tags" ? (
        <main className="page">
          <TagManager />
        </main>
      ) : (
        <main className="page">
          <div className="bar">
            <h1>{label}</h1>
            <div className="bar-right">
              <span className="total">{money(total)}</span>
              <button className="btn" onClick={() => step(-1)} aria-label="Previous">‹</button>
              <button className="btn" onClick={() => setCursor(fmt(new Date()))}>Today</button>
              <button className="btn" onClick={() => step(1)} aria-label="Next">›</button>
            </div>
          </div>

          <EntryForm defaultDate={cursor} />

          <div className="cols">
            <section className="main fade" key={view + (view === "month" ? "" : cursor)}>
              {view === "day" && <DayList date={cursor} />}
              {view === "week" && <WeekView start={startOfWeek(cur)} onOpen={openDay} />}
              {view === "month" && <MonthView cursor={cur} onOpen={openDay} />}
            </section>
            <aside className="side">
              <Summary entries={inRange} total={total} />
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}

function DayList({ date }: { date: string }) {
  const { entries } = useLedger();
  const list = entries.filter((e) => e.date === date);
  if (!list.length) return <p className="empty">No spending recorded for this day.</p>;
  return (
    <div className="list">
      {list.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <AuthForm />;
  return (
    <LedgerProvider userId={String(user.id)}>
      <App />
    </LedgerProvider>
  );
}
