"use client";

import { useEffect, useMemo, useState } from "react";
import { money } from "@/lib/date";
import { useLedger, type Subscription, type SubscriptionCadence } from "@/lib/store";
import { Chip } from "./Chip";
import { TagSelect } from "./TagSelect";

function cadenceLabel(cadence: SubscriptionCadence) {
  return cadence === "monthly" ? "month" : "year";
}

function currentPlan(subscription: Subscription, onDate: string) {
  const sorted = [...subscription.plans].sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  return sorted.filter((plan) => plan.startsOn <= onDate).at(-1) ?? sorted[0];
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const { specific, updateSubscription, addSubscriptionPlan, removeSubscription } = useLedger();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [endsOn, setEndsOn] = useState(subscription.endsOn);
  const [planAmount, setPlanAmount] = useState("");
  const [planCadence, setPlanCadence] = useState<SubscriptionCadence>("monthly");
  const [planStartsOn, setPlanStartsOn] = useState(today);
  const tag = specific.find((entry) => entry.id === subscription.specific);
  const active = !subscription.endsOn || subscription.endsOn >= today;
  const plans = [...subscription.plans].sort((a, b) => b.startsOn.localeCompare(a.startsOn));
  const plan = currentPlan(subscription, today);

  useEffect(() => {
    setEndsOn(subscription.endsOn);
  }, [subscription.endsOn]);

  return (
    <details className={"subscription-card" + (active ? "" : " inactive")}>
      <summary className="subscription-head">
        <div className="subscription-meta">
          <Chip tag={tag} fallback="No specific tag" />
          <span className="muted small">{active ? "Active" : "Inactive"}</span>
        </div>
        <strong>{money(plan?.amount ?? 0)} / {cadenceLabel(plan?.cadence ?? "monthly")}</strong>
      </summary>
      <div className="subscription-body">
        <div className="subscription-grid">
          <label>
            End date
            <input type="date" value={endsOn} onChange={(event) => setEndsOn(event.target.value)} />
          </label>
          <div className="subscription-actions">
            <button
              className="btn"
              type="button"
              onClick={() => updateSubscription(subscription.id, { endsOn })}
            >
              Save end date
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setEndsOn("");
                updateSubscription(subscription.id, { endsOn: "" });
              }}
            >
              Mark active
            </button>
            <button className="btn danger" type="button" onClick={() => removeSubscription(subscription.id)}>
              Delete
            </button>
          </div>
        </div>

        <h3>Plan history</h3>
        <div className="subscription-history">
          {plans.map((entry) => (
            <div key={entry.id} className="subscription-history-row">
              <span>{entry.startsOn}</span>
              <span>{money(entry.amount)}</span>
              <span>{entry.cadence === "monthly" ? "Monthly" : "Yearly"}</span>
            </div>
          ))}
        </div>

        <form
          className="subscription-plan-form"
          onSubmit={(event) => {
            event.preventDefault();
            const amount = parseFloat(planAmount);
            if (!isFinite(amount) || amount <= 0 || !planStartsOn) return;
            addSubscriptionPlan(subscription.id, {
              startsOn: planStartsOn,
              amount,
              cadence: planCadence,
            });
            setPlanAmount("");
          }}
        >
          <h3>Add plan change</h3>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Amount"
            value={planAmount}
            onChange={(event) => setPlanAmount(event.target.value)}
            required
          />
          <select value={planCadence} onChange={(event) => setPlanCadence(event.target.value as SubscriptionCadence)}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="date"
            value={planStartsOn}
            onChange={(event) => setPlanStartsOn(event.target.value)}
            required
          />
          <button className="btn primary" type="submit">Save change</button>
        </form>
      </div>
    </details>
  );
}

export function Subscriptions() {
  const { specific, subscriptions, addSubscription } = useLedger();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState({
    specific: "",
    amount: "",
    cadence: "monthly" as SubscriptionCadence,
    startsOn: today,
    endsOn: "",
  });

  const active = subscriptions
    .filter((entry) => !entry.endsOn || entry.endsOn >= today)
    .sort((a, b) => a.id.localeCompare(b.id));
  const inactive = subscriptions
    .filter((entry) => entry.endsOn && entry.endsOn < today)
    .sort((a, b) => (b.endsOn || "").localeCompare(a.endsOn || ""));

  return (
    <div className="subscriptions-page">
      <section className="subscription-new">
        <h2>Add subscription</h2>
        <p className="muted small">Choose a specific tag, billing cycle, amount and start date.</p>
        <form
          className="subscription-form"
          onSubmit={(event) => {
            event.preventDefault();
            const amount = parseFloat(form.amount);
            if (!isFinite(amount) || amount <= 0 || !form.startsOn) return;
            addSubscription({
              specific: form.specific,
              endsOn: form.endsOn,
              plans: [{ startsOn: form.startsOn, amount, cadence: form.cadence }],
            });
            setForm((prev) => ({ ...prev, amount: "", endsOn: "" }));
          }}
        >
          <TagSelect
            value={form.specific}
            onChange={(id) => setForm((prev) => ({ ...prev, specific: id }))}
            tags={specific}
            placeholder="Specific tag"
            label="Subscription tag"
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Amount"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            required
          />
          <select
            value={form.cadence}
            onChange={(event) => setForm((prev) => ({ ...prev, cadence: event.target.value as SubscriptionCadence }))}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="date"
            value={form.startsOn}
            onChange={(event) => setForm((prev) => ({ ...prev, startsOn: event.target.value }))}
            required
          />
          <input
            type="date"
            value={form.endsOn}
            onChange={(event) => setForm((prev) => ({ ...prev, endsOn: event.target.value }))}
            aria-label="Optional end date"
          />
          <button className="btn primary" type="submit">Add subscription</button>
        </form>
      </section>

      <section>
        <h2>Active</h2>
        {!active.length && <p className="muted small">No active subscriptions yet.</p>}
        <div className="subscription-list">
          {active.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </div>
      </section>

      <section>
        <h2>Past / inactive</h2>
        {!inactive.length && <p className="muted small">No inactive subscriptions yet.</p>}
        <div className="subscription-list">
          {inactive.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </div>
      </section>
    </div>
  );
}

