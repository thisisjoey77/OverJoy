"use client";

import { useLedger, type Entry } from "@/lib/store";
import { DOW, addDays, fmt, money, startOfWeek } from "@/lib/date";
import { Chip } from "./Chip";

function useByDate() {
  const { entries } = useLedger();
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const l = map.get(e.date);
    if (l) l.push(e);
    else map.set(e.date, [e]);
  }
  return map;
}

function Mini({ e }: { e: Entry }) {
  const { tag } = useLedger();
  const t = tag("specific", e.specific) ?? tag("general", e.general);
  return (
    <div className="mini">
      <span className="mini-amt">{money(e.amount)}</span>
      <Chip tag={t} fallback="Other" />
    </div>
  );
}

function Cell({
  date, day, outside, onOpen, max,
}: {
  date: string;
  day: number;
  outside?: boolean;
  onOpen: (d: string) => void;
  max: number;
}) {
  const list = useByDate().get(date) ?? [];
  const sum = list.reduce((s, e) => s + e.amount, 0);
  const today = date === fmt(new Date());
  return (
    <button className={"cell" + (outside ? " out" : "")} onClick={() => onOpen(date)}>
      <div className="cell-head">
        <span className={"dnum" + (today ? " today" : "")}>{day}</span>
        {sum > 0 && <span className="dsum">{money(sum)}</span>}
      </div>
      {list.slice(0, max).map((e) => (
        <Mini key={e.id} e={e} />
      ))}
      {list.length > max && <div className="more">+{list.length - max} more</div>}
    </button>
  );
}

export function MonthView({ cursor, onOpen }: { cursor: Date; onOpen: (d: string) => void }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = startOfWeek(first);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
  return (
    <div className="month">
      {DOW.map((d) => (
        <div key={d} className="dow">{d}</div>
      ))}
      {days.map((d) => (
        <Cell
          key={fmt(d)}
          date={fmt(d)}
          day={d.getDate()}
          outside={d.getMonth() !== cursor.getMonth()}
          onOpen={onOpen}
          max={3}
        />
      ))}
    </div>
  );
}

export function WeekView({ start, onOpen }: { start: Date; onOpen: (d: string) => void }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <div className="week">
      {days.map((d) => (
        <div key={fmt(d)}>
          <div className="dow">{DOW[d.getDay()]}</div>
          <Cell date={fmt(d)} day={d.getDate()} onOpen={onOpen} max={20} />
        </div>
      ))}
    </div>
  );
}
