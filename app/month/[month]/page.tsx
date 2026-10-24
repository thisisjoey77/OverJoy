"use client";

import { useParams } from "next/navigation";
import { CalendarRoute } from "@/components/Calendar";

export default function Page() {
  const { month } = useParams<{ month: string }>();
  return <CalendarRoute view="month" param={month} />;
}
