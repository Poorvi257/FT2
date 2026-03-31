import { RiPulseLine, RiSafe2Line, RiWallet3Line } from "@remixicon/react";
import { Card } from "../common/Card.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";

export function SummaryCards({ totals }) {
  const items = [
    {
      label: "Total spent",
      value: formatCurrency(totals.totalSpent),
      icon: RiWallet3Line,
      accentClassName: "border-sky-400/20 bg-sky-400/10 text-sky-300"
    },
    {
      label: "Fixed spend",
      value: formatCurrency(totals.fixedTotal),
      icon: RiSafe2Line,
      accentClassName: "border-indigo-400/20 bg-indigo-400/10 text-indigo-300"
    },
    {
      label: "Variable spend",
      value: formatCurrency(totals.variableTotal),
      icon: RiPulseLine,
      accentClassName: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.label}
          className="min-h-[132px] bg-white/[0.05] sm:min-h-[156px]"
          titleClassName="sr-only"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-muted">{item.label}</span>
              <strong className="mt-4 block break-words text-[1.75rem] font-semibold tracking-tight text-fg sm:mt-5 sm:text-3xl">{item.value}</strong>
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
