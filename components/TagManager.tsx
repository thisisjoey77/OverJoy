"use client";

import { useEffect, useState } from "react";
import { useLedger, type Kind } from "@/lib/store";
import { Chip } from "./Chip";

function TagList({ kind, title, hint }: { kind: Kind; title: string; hint: string }) {
  const { general, specific, addTag, updateTag, removeTag } = useLedger();
  const tags = kind === "general" ? general : specific;
  const { entries } = useLedger();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [replacementId, setReplacementId] = useState("");
  const pendingTag = tags.find((tag) => tag.id === pendingDelete);
  const affectedCount = entries.filter((entry) => entry[kind] === pendingDelete).length;

  useEffect(() => {
    if (!pendingDelete) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingDelete(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pendingDelete]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    addTag(kind, n);
    setName("");
  };

  return (
    <section className={"tl" + (editing ? " editing" : "")}>
      <div className="tl-title">
        <h2>{title}</h2>
        <button
          type="button"
          className={"icon-btn" + (editing ? " active" : "")}
          onClick={() => setEditing((value) => !value)}
          aria-label={editing ? `Finish editing ${title}` : `Edit ${title}`}
          aria-pressed={editing}
          title={editing ? "Finish editing" : "Edit tags"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 11.8 11.5 3.3l1.2 1.2-8.5 8.5L2 13.5zM10.7 4.1l1.2-1.2a1.1 1.1 0 0 1 1.6 0l.6.6a1.1 1.1 0 0 1 0 1.6l-1.2 1.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
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
          <span className="col-x">
            <button
              type="button"
              className="link remove-tag"
              tabIndex={editing ? 0 : -1}
              aria-hidden={!editing}
              onClick={() => {
                setReplacementId("");
                setPendingDelete(t.id);
              }}
            >
              Remove
            </button>
          </span>
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
      {pendingTag && (
        <div
          className="tag-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null);
          }}
        >
          <section
            className="tag-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tag-delete-title"
            aria-describedby="tag-delete-description"
          >
            <h2 id="tag-delete-title">Remove {pendingTag.name}?</h2>
            <p id="tag-delete-description" className="muted">
              {affectedCount === 1
                ? "1 expenditure uses this tag."
                : `${affectedCount} expenditures use this tag.`} Choose where to move them.
            </p>
            <label>
              Move expenditures to
              <select
                autoFocus
                value={replacementId}
                onChange={(event) => setReplacementId(event.target.value)}
              >
                <option value="">Unassigned</option>
                {tags.filter((tag) => tag.id !== pendingTag.id).map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </label>
            <div className="tag-dialog-actions">
              <button className="btn" type="button" onClick={() => setPendingDelete(null)}>Cancel</button>
              <button
                className="btn danger"
                type="button"
                onClick={() => {
                  removeTag(kind, pendingTag.id, replacementId);
                  setPendingDelete(null);
                }}
              >
                Apply
              </button>
            </div>
          </section>
        </div>
      )}
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
