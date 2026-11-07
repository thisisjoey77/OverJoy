import { addDays, fmt, parse } from "./date";
import type { Subscription, SubscriptionCadence, Tag } from "./store";

type Range = { from: string; to: string };

const OPEN_ENDED = "9999-12-31";

const clampDay = (year: number, month: number, day: number) =>
  Math.min(day, new Date(year, month + 1, 0).getDate());

const monthlyDate = (anchor: Date, monthOffset: number) => {
  const monthIndex = anchor.getMonth() + monthOffset;
  const year = anchor.getFullYear() + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  return new Date(year, month, clampDay(year, month, anchor.getDate()));
};

const yearlyDate = (anchor: Date, yearOffset: number) => {
  const year = anchor.getFullYear() + yearOffset;
  const month = anchor.getMonth();
  return new Date(year, month, clampDay(year, month, anchor.getDate()));
};

const nextDate = (date: Date, cadence: SubscriptionCadence, anchor: Date) =>
  cadence === "monthly"
    ? monthlyDate(anchor, (date.getFullYear() - anchor.getFullYear()) * 12 + date.getMonth() - anchor.getMonth() + 1)
    : yearlyDate(anchor, date.getFullYear() - anchor.getFullYear() + 1);

const firstOccurrence = (startsOn: string, cadence: SubscriptionCadence, floor: string) => {
  const anchor = parse(startsOn);
  const floorDate = parse(floor);
  if (floor <= startsOn) return anchor;
  if (cadence === "monthly") {
    let monthOffset = (floorDate.getFullYear() - anchor.getFullYear()) * 12 + floorDate.getMonth() - anchor.getMonth();
    if (monthOffset < 0) monthOffset = 0;
    let candidate = monthlyDate(anchor, monthOffset);
    if (fmt(candidate) < floor) candidate = monthlyDate(anchor, monthOffset + 1);
    return candidate;
  }
  let yearOffset = floorDate.getFullYear() - anchor.getFullYear();
  if (yearOffset < 0) yearOffset = 0;
  let candidate = yearlyDate(anchor, yearOffset);
  if (fmt(candidate) < floor) candidate = yearlyDate(anchor, yearOffset + 1);
  return candidate;
};

const minDate = (a: string, b: string) => (a <= b ? a : b);
const maxDate = (a: string, b: string) => (a >= b ? a : b);

const subscriptionGeneralTagId = (general: Tag[]) =>
  general.find((tag) => tag.name.trim().toLowerCase() === "subscription")?.id ?? "";

export type SubscriptionCharge = {
  id: string;
  date: string;
  amount: number;
  general: string;
  specific: string;
  note: string;
  subscriptionId: string;
};

export function subscriptionChargesInRange(
  subscriptions: Subscription[],
  range: Range,
  generalTags: Tag[],
): SubscriptionCharge[] {
  const subscriptionGeneral = subscriptionGeneralTagId(generalTags);
  const charges: SubscriptionCharge[] = [];

  for (const subscription of subscriptions) {
    const plans = [...subscription.plans].sort((a, b) => a.startsOn.localeCompare(b.startsOn));
    if (!plans.length) continue;

    for (let i = 0; i < plans.length; i += 1) {
      const plan = plans[i];
      const segmentStart = plan.startsOn;
      let segmentEnd = subscription.endsOn || OPEN_ENDED;
      if (i < plans.length - 1) {
        const dayBeforeNext = fmt(addDays(parse(plans[i + 1].startsOn), -1));
        segmentEnd = minDate(segmentEnd, dayBeforeNext);
      }
      if (segmentStart > segmentEnd) continue;

      const from = maxDate(range.from, segmentStart);
      const to = minDate(range.to, segmentEnd);
      if (from > to) continue;

      const first = firstOccurrence(plan.startsOn, plan.cadence, from);
      const anchor = parse(plan.startsOn);
      for (let cursor = first; fmt(cursor) <= to; cursor = nextDate(cursor, plan.cadence, anchor)) {
        charges.push({
          id: `${subscription.id}:${plan.id}:${fmt(cursor)}`,
          date: fmt(cursor),
          amount: plan.amount,
          general: subscriptionGeneral,
          specific: subscription.specific,
          note: `Subscription (${plan.cadence})`,
          subscriptionId: subscription.id,
        });
      }
    }
  }

  return charges;
}

