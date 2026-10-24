"use client";

import { useEffect, useRef, useState } from "react";
import { useLedger, type Entry } from "@/lib/store";
import { money } from "@/lib/date";
import { Chip } from "./Chip";
import { TagSelect } from "./TagSelect";

type Values = Omit<Entry, "id">;

export function EntryForm({
  defaultDate,
  initial,
  onDone,
}: {
  defaultDate?: string;
  initial?: Entry;
  onDone?: () => void;
}) {
  const { general, specific, addEntry, updateEntry } = useLedger();
  const amountRef = useRef<HTMLInputElement>(null);
  const [v, setV] = useState({
    date: initial?.date ?? defaultDate ?? "",
    amount: initial ? String(initial.amount) : "",
    general: initial?.general ?? "",
    specific: initial?.specific ?? "",
    note: initial?.note ?? "",
  });

  useEffect(() => {
    if (!initial && defaultDate) setV((p) => ({ ...p, date: defaultDate }));
  }, [defaultDate, initial]);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(v.amount);
    if (!v.date || !isFinite(amount) || amount <= 0) return;
    const values: Values = { ...v, amount };
    if (initial) updateEntry(initial.id, values);
    else addEntry(values);
    if (initial) onDone?.();
    else {
      setV((p) => ({ ...p, amount: "", note: "" }));
      amountRef.current?.focus();
    }
  };

  return (
    <form className={"form" + (initial ? " editing" : "")} onSubmit={submit}>
      <input type="date" value={v.date} onChange={set("date")} aria-label="Date" required />
      <input
        ref={amountRef}
        className="amount"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        placeholder="Amount"
        value={v.amount}
        onChange={set("amount")}
        aria-label="Amount"
        autoFocus={!initial}
        required
      />
      <TagSelect
        value={v.general}
        onChange={(id) => setV((p) => ({ ...p, general: id }))}
        tags={general}
        placeholder="General"
        label="General tag"
      />
      <TagSelect
        value={v.specific}
        onChange={(id) => setV((p) => ({ ...p, specific: id }))}
        tags={specific}
        placeholder="Specific"
        label="Specific tag"
      />
      <input
        className="note"
        placeholder="Note (optional)"
        value={v.note}
        onChange={set("note")}
        aria-label="Note"
      />
      <button className="btn primary" type="submit">{initial ? "Save" : "Add"}</button>
      {initial && (
        <button className="btn" type="button" onClick={onDone}>Cancel</button>
      )}
    </form>
  );
}

export function EntryRow({ entry, showDate }: { entry: Entry; showDate?: boolean }) {
  const { tag, removeEntry } = useLedger();
  const [editing, setEditing] = useState(false);
  if (editing) return <EntryForm initial={entry} onDone={() => setEditing(false)} />;
  return (
    <div className="row">
      {showDate && <span className="muted date">{entry.date}</span>}
      <span className="amt">{money(entry.amount)}</span>
      <Chip tag={tag("general", entry.general)} fallback="No category" />
      <Chip tag={tag("specific", entry.specific)} />
      <span className="muted grow">{entry.note}</span>
      <span className="actions">
        <button className="link" onClick={() => setEditing(true)}>Edit</button>
        <button className="link" onClick={() => removeEntry(entry.id)}>Delete</button>
      </span>
    </div>
  );
}
