import { RiCalendarScheduleLine, RiCoinsLine, RiShieldCheckLine } from "@remixicon/react";
import { Card } from "../common/Card.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";

function daysRemaining(asOfDate, endDate, status) {
  if (!endDate || status === "complete") {
    return 0;
  }

  const start = new Date(`${asOfDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const diff = Math.floor((end.getTime() - start.getTime()) / 86_400_000);

  return Math.max(diff + 1, 0);
}

export function BudgetSummaryCards({ budget, budgetState, asOfDate }) {
  const totalRemaining = Number(budgetState?.remainingMainBudget || 0) + Number(budgetState?.piggyBank || 0);
  const remainingDays = daysRemaining(asOfDate || budget?.budget_start_date, budget?.budget_end_date, budgetState?.status);

  const items = [
    {
      label: "Days remaining",
      value: `${remainingDays} Days`,
      hint: "Days left in this budget window.",
      icon: RiCalendarScheduleLine,
      accentClassName: "border-violet-400/20 bg-violet-400/10 text-violet-300"
    },
    {
      label: "Piggy bank (saved)",
      value: formatCurrency(budgetState?.piggyBank || 0),
      hint: "Closed-day underspend saved so far.",
      icon: RiCoinsLine,
      accentClassName: "border-amber-400/20 bg-amber-400/10 text-amber-300"
    },
    {
      label: "Total remaining",
      value: formatCurrency(totalRemaining),
      hint: "Main budget plus piggy bank available.",
      icon: RiShieldCheckLine,
      accentClassName: "border-sky-400/20 bg-sky-400/10 text-sky-300"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.label}
          className="min-h-[156px] bg-white/[0.05] sm:min-h-[180px]"
          titleClassName="sr-only"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-muted">{item.label}</span>
              <strong className="mt-5 block break-words text-[1.9rem] font-semibold tracking-tight text-fg sm:mt-6 sm:text-4xl">{item.value}</strong>
              <p className="mt-4 text-sm leading-6 text-fg-muted">{item.hint}</p>
            </div>
            <span className={`inline-flex rounded-2xl border p-3 shadow-soft ${item.accentClassName}`}>
              <item.icon size={20} />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
