"use client";

import { useLedger, type Entry } from "@/lib/store";
import { DOW, addDays, fmt, money, startOfWeek } from "@/lib/date";
import { Chip } from "./Chip";
import { TagVisual, type TagAppearance } from "./TagVisual";

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

function Mini({ e, compact, appearance }: { e: Entry; compact: boolean; appearance: TagAppearance }) {
  const { tag } = useLedger();
  const general = tag("general", e.general);
  const specific = tag("specific", e.specific);
  const labels = [general?.name, specific?.name].filter(Boolean);
  const label = labels.join(" + ") || "Other";

  if (compact) {
    return (
      <div className="mini compact-mini" title={label} aria-label={`${money(e.amount)}; ${label}`}>
        {appearance !== "amount" && <span className="mini-amt">{money(e.amount)}</span>}
        <TagVisual general={general} specific={specific} amount={money(e.amount)} appearance={appearance} />
      </div>
    );
  }

  return (
    <div className="mini">
      <span className="mini-amt">{money(e.amount)}</span>
      <span className="mini-tags">
        <Chip tag={general} />
        <Chip tag={specific} />
        {!general && !specific && <Chip fallback="Other" />}
      </span>
    </div>
  );
}

function Cell({
  date, day, outside, onOpen, max, compact, appearance,
}: {
  date: string;
  day: number;
  outside?: boolean;
  onOpen: (d: string) => void;
  max: number;
  compact: boolean;
  appearance: TagAppearance;
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
        <Mini key={`${e.id}-${compact ? "minimal" : "full"}`} e={e} compact={compact} appearance={appearance} />
      ))}
      {list.length > max && <div className="more">+{list.length - max} more</div>}
    </button>
  );
}

export function MonthView({ cursor, onOpen, compact, appearance }: { cursor: Date; onOpen: (d: string) => void; compact: boolean; appearance: TagAppearance }) {
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
          compact={compact}
          appearance={appearance}
        />
      ))}
    </div>
  );
}

export function WeekView({ start, onOpen, compact, appearance }: { start: Date; onOpen: (d: string) => void; compact: boolean; appearance: TagAppearance }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <div className="week">
      {days.map((d) => (
        <div key={fmt(d)}>
          <div className="dow">{DOW[d.getDay()]}</div>
          <Cell date={fmt(d)} day={d.getDate()} onOpen={onOpen} max={20} compact={compact} appearance={appearance} />
        </div>
      ))}
    </div>
  );
}
