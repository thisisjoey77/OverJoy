import { addDays, addMonths, fmt, parse } from "./date";

export type CalView = "day" | "week" | "month";

export const dayPath = (d: string) => `/day/${d}`;

export const pathFor = (view: CalView, d: Date) => {
  const s = fmt(d);
  return view === "month" ? `/month/${s.slice(0, 7)}` : `/${view}/${s}`;
};

// A month URL carries YYYY-MM, day and week URLs carry YYYY-MM-DD.
export function cursorFromParam(view: CalView, param: string): string | null {
  const s = view === "month" ? `${param}-01` : param;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return fmt(parse(s)) === s ? s : null;
}

export const stepDate = (view: CalView, d: Date, dir: number) =>
  view === "month" ? addMonths(d, dir) : addDays(d, dir * (view === "week" ? 7 : 1));
