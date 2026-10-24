"use client";

import { useLedger, type Entry, type Kind } from "@/lib/store";
import { money } from "@/lib/date";
import { Chip } from "./Chip";

function Group({ kind, title, entries, total }: {
  kind: Kind;
  title: string;
  entries: Entry[];
  total: number;
}) {
  const { tag } = useLedger();
  const sums = new Map<string, number>();
  for (const e of entries) sums.set(e[kind], (sums.get(e[kind]) ?? 0) + e.amount);
  const rows = [...sums.entries()].sort((a, b) => b[1] - a[1]);
  return (
    <div className="group">
      <h2>{title}</h2>
      {rows.length === 0 && <p className="muted small">Nothing yet.</p>}
      {rows.map(([id, sum]) => (
        <div key={id} className="srow">
          <div className="srow-top">
            <Chip tag={tag(kind, id)} fallback="Untagged" />
            <span>{money(sum)}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${total ? (sum / total) * 100 : 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Summary({ entries, total }: { entries: Entry[]; total: number }) {
  return (
    <div>
      <div className="group">
        <h2>Total</h2>
        <div className="big">{money(total)}</div>
        <p className="muted small">{entries.length} payments</p>
      </div>
      <Group kind="general" title="By category" entries={entries} total={total} />
      <Group kind="specific" title="By tag" entries={entries} total={total} />
    </div>
  );
}
