"use client";

import { useParams } from "next/navigation";
import { CalendarRoute } from "@/components/Calendar";

export default function Page() {
  const { date } = useParams<{ date: string }>();
  return <CalendarRoute view="day" param={date} />;
}
