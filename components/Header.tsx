"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { fmt, parse } from "@/lib/date";
import { cursorFromParam, pathFor, type CalView } from "@/lib/routes";
import { ProfileMenu } from "./ProfileMenu";

const VIEWS: { id: CalView; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export function Header() {
  const [seg, param] = usePathname().split("/").filter(Boolean);
  const today = fmt(new Date());

  // Switching views keeps the date you are looking at.
  let anchor = today;
  if (seg === "day" || seg === "week" || seg === "month") {
    const c = cursorFromParam(seg, param ?? "");
    if (c && !(seg === "month" && c.slice(0, 7) === today.slice(0, 7))) anchor = c;
  }

  return (
    <header className="top">
      <Link href="/" className="brand">
        <Image src="/logo.webp" alt="DayQuid logo" width={24} height={24} className="brand-logo" />
        <span className="brand-text">DayQuid</span>
      </Link>
      <nav className="tabs">
        {VIEWS.map((v) => (
          <Link
            key={v.id}
            href={pathFor(v.id, parse(anchor))}
            className={"tab" + (seg === v.id ? " on" : "")}
          >
            {v.label}
          </Link>
        ))}
        <Link href="/tags" className={"tab" + (seg === "tags" ? " on" : "")}>Tags</Link>
        <Link href="/subscriptions" className={"tab" + (seg === "subscriptions" ? " on" : "")}>Subscriptions</Link>
      </nav>
      <ProfileMenu />
    </header>
  );
}
