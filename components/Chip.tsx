import type { Tag } from "@/lib/store";

export function Chip({ tag, fallback }: { tag?: Tag; fallback?: string }) {
  if (!tag) return fallback ? <span className="chip none">{fallback}</span> : null;
  return (
    <span className="chip" style={{ color: tag.color, background: tag.bg }}>
      {tag.name}
    </span>
  );
}
