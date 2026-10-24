"use client";

import { useEffect, useRef, useState } from "react";
import type { Tag } from "@/lib/store";
import { Chip } from "./Chip";

export function TagSelect({
  value,
  onChange,
  tags,
  placeholder,
  label,
}: {
  value: string;
  onChange: (id: string) => void;
  tags: Tag[];
  placeholder: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = tags.find((t) => t.id === value);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="tsel" ref={ref}>
      <button
        type="button"
        className={"tsel-btn" + (open ? " open" : "")}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        {selected ? <Chip tag={selected} /> : <span className="muted">{placeholder}</span>}
        <svg className="chev" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      {open && (
        <div className="tsel-menu" role="listbox">
          <button type="button" role="option" className="tsel-opt" onClick={() => pick("")}>
            <span className="muted">None</span>
          </button>
          {tags.map((t) => (
            <button
              type="button"
              key={t.id}
              role="option"
              aria-selected={t.id === value}
              className={"tsel-opt" + (t.id === value ? " on" : "")}
              onClick={() => pick(t.id)}
            >
              <Chip tag={t} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
