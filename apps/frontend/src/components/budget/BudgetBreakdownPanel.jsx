import { Card } from "../common/Card.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";
import { PiggyBankTrendChart } from "./PiggyBankTrendChart.jsx";

function sumDaily(items, key) {
  return items.reduce((sum, item) => sum + Number(item[key] || 0), 0);
}

function clampPercent(value, total) {
  if (!total) {
    return 0;
  }

  return Math.max(0, Math.min((value / total) * 100, 100));
}

function BudgetMetricBar({ label, amount, total, colorClassName, note }) {
  const width = clampPercent(amount, total);

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-[#0b0b10]/60 p-5 shadow-soft">
      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-baseline sm:justify-between">
        <span className="font-medium text-fg">{label}</span>
        <span className="text-xl font-semibold text-fg">{formatCurrency(amount)}</span>
      </div>
      <div className="metric-track mt-4">
        <div className={`metric-fill ${colorClassName}`} style={{ width: `${width}%` }} />
      </div>
      <div className="mt-4 flex flex-col gap-1 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <span>{formatCurrency(total)} total reference</span>
        {note ? <span>{note}</span> : null}
      </div>
    </div>
  );
}

function DetailRow({ label, value, valueClassName = "text-fg" }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 last:border-b-0 last:pb-0">
      <span className="text-sm uppercase tracking-[0.14em] text-fg-muted">{label}</span>
      <span className={`text-sm font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}

export function BudgetBreakdownPanel({ budget, budgetState, asOfDate }) {
  const dailySeries = budgetState?.dailySeries || [];
  const fixedSpent = sumDaily(dailySeries, "fixedSpend");
  const variableSpent = sumDaily(dailySeries, "variableSpend");
  const totalRemaining = Number(budgetState?.remainingMainBudget || 0) + Number(budgetState?.piggyBank || 0);
  const overspendToday = Math.max(Number(budgetState?.todaySpent || 0) - Number(budgetState?.todayBaseLimit || 0), 0);

  return (
    <Card
      title="Budget breakdown"
      className="bg-white/[0.04]"
      titleClassName="font-display text-xl font-semibold tracking-tight text-fg"
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <BudgetMetricBar
          label="Main budget left"
          amount={Number(budgetState?.remainingMainBudget || 0)}
          total={Number(budgetState?.budgetAmount || 0)}
          colorClassName="bg-gradient-to-r from-accent to-indigo-400"
          note={`${formatCurrency(totalRemaining)} total remaining including piggy bank`}
        />
        <BudgetMetricBar
          label="Today's allowance left"
          amount={Number(budgetState?.todayRemaining || 0)}
          total={Number(budgetState?.todayBaseLimit || 0)}
          colorClassName="bg-gradient-to-r from-emerald-400 to-cyan-400"
          note={overspendToday > 0 ? `${formatCurrency(overspendToday)} over today's limit` : `${formatCurrency(budgetState?.todaySpent || 0)} spent today`}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_1fr]">
        <section className="rounded-[28px] border border-white/[0.06] bg-[#0b0b10]/60 p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h4 className="font-display text-base font-semibold tracking-tight text-fg">Current budget details</h4>
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              As of {asOfDate || budget?.budget_start_date}
            </span>
          </div>
          <div>
            <DetailRow label="Budget window" value={`${budget?.budget_start_date} to ${budget?.budget_end_date}`} />
            <DetailRow label="Total budget" value={formatCurrency(budgetState?.budgetAmount || 0)} />
            <DetailRow label="Fixed spent to date" value={formatCurrency(fixedSpent)} />
            <DetailRow label="Variable spent to date" value={formatCurrency(variableSpent)} />
            <DetailRow label="Today's base limit" value={formatCurrency(budgetState?.todayBaseLimit || 0)} />
            <DetailRow
              label="Today's remaining"
              value={formatCurrency(budgetState?.todayRemaining || 0)}
              valueClassName={overspendToday > 0 ? "text-rose-300" : "text-emerald-300"}
            />
          </div>
        </section>

        <PiggyBankTrendChart budgetState={budgetState} />
      </div>
    </Card>
  );
}
