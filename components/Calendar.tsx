"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLedger } from "@/lib/store";
import { DOW, MONTHS, addDays, fmt, money, parse, shortDate, startOfWeek } from "@/lib/date";
import { cursorFromParam, dayPath, pathFor, stepDate, type CalView } from "@/lib/routes";
import { EntryForm, EntryRow } from "./Entries";
import { MonthView, WeekView } from "./Views";
import { Summary } from "./Summary";
import { ExportMonth } from "./ExportMonth";

export function GoToToday({ view }: { view: CalView }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(pathFor(view, new Date()));
  }, [router, view]);
  return null;
}

export function CalendarRoute({ view, param }: { view: CalView; param: string }) {
  const cursor = cursorFromParam(view, param);
  if (!cursor) return <GoToToday view={view} />;
  return <Calendar view={view} cursor={cursor} />;
}

function Calendar({ view, cursor }: { view: CalView; cursor: string }) {
  const { entries } = useLedger();
  const router = useRouter();
  const cur = parse(cursor);

  const [from, to, label] = useMemo(() => {
    const d = parse(cursor);
    if (view === "week") {
      const s = startOfWeek(d);
      const e = addDays(s, 6);
      return [fmt(s), fmt(e), `${shortDate(s)} – ${shortDate(e)}, ${e.getFullYear()}`];
    }
    if (view === "month") {
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return [fmt(s), fmt(e), `${MONTHS[d.getMonth()]} ${d.getFullYear()}`];
    }
    return [cursor, cursor, `${DOW[d.getDay()]}, ${shortDate(d)}, ${d.getFullYear()}`];
  }, [view, cursor]);

  const inRange = useMemo(
    () => entries.filter((e) => e.date >= from && e.date <= to),
    [entries, from, to],
  );
  const total = inRange.reduce((s, e) => s + e.amount, 0);

  const todayStr = fmt(new Date());
  const entryDate = view === "month" && todayStr.slice(0, 7) === cursor.slice(0, 7) ? todayStr : cursor;

  return (
    <main className="page">
      <div className="bar">
        <h1>{label}</h1>
        <div className="bar-right">
          {view === "month" && <ExportMonth month={cursor.slice(0, 7)} />}
          <span className="total">{money(total)}</span>
          <Link className="btn" href={pathFor(view, stepDate(view, cur, -1))} aria-label="Previous">‹</Link>
          <Link className="btn" href={pathFor(view, new Date())}>Today</Link>
          <Link className="btn" href={pathFor(view, stepDate(view, cur, 1))} aria-label="Next">›</Link>
        </div>
      </div>

      <EntryForm defaultDate={entryDate} />

      <div className="cols">
        <section className="main fade" key={view + cursor}>
          {view === "day" && <DayList date={cursor} />}
          {view === "week" && <WeekView start={startOfWeek(cur)} onOpen={(d) => router.push(dayPath(d))} />}
          {view === "month" && <MonthView cursor={cur} onOpen={(d) => router.push(dayPath(d))} />}
        </section>
        <aside className="side">
          <Summary entries={inRange} total={total} />
        </aside>
      </div>
    </main>
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
