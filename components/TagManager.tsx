"use client";

import { useState } from "react";
import { useLedger, type Kind } from "@/lib/store";
import { Chip } from "./Chip";

function TagList({ kind, title, hint }: { kind: Kind; title: string; hint: string }) {
  const { general, specific, addTag, updateTag, removeTag } = useLedger();
  const tags = kind === "general" ? general : specific;
  const [name, setName] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    addTag(kind, n);
    setName("");
  };

  return (
    <section className="tl">
      <h2>{title}</h2>
      <p className="muted small">{hint}</p>
      <div className="tl-head">
        <span className="grow">Name</span>
        <span className="col">Font</span>
        <span className="col">Background</span>
        <span className="col-preview">Preview</span>
        <span className="col-x" />
      </div>
      {tags.map((t) => (
        <div key={t.id} className="tl-row">
          <input
            className="grow"
            value={t.name}
            onChange={(e) => updateTag(kind, t.id, { name: e.target.value })}
            aria-label="Tag name"
          />
          <input
            className="col"
            type="color"
            value={t.color}
            onChange={(e) => updateTag(kind, t.id, { color: e.target.value })}
            aria-label="Font color"
          />
          <input
            className="col"
            type="color"
            value={t.bg}
            onChange={(e) => updateTag(kind, t.id, { bg: e.target.value })}
            aria-label="Background color"
          />
          <span className="col-preview"><Chip tag={t} /></span>
          <button className="link col-x" onClick={() => removeTag(kind, t.id)}>Remove</button>
        </div>
      ))}
      <form className="tl-add" onSubmit={add}>
        <input
          className="grow"
          placeholder="New tag name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn primary" type="submit">Add</button>
      </form>
    </section>
  );
}

export function TagManager() {
  return (
    <div className="tags-page">
      <TagList
        kind="general"
        title="General tags"
        hint="Broad categories shown in totals and summaries, such as Food or Transportation."
      />
      <TagList
        kind="specific"
        title="Specific tags"
        hint="What the payment was for, such as a store or service."
      />
    </div>
  );
}
