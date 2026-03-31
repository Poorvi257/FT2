import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card } from "../common/Card.jsx";
import { EmptyState } from "../common/EmptyState.jsx";
import {
  chartAreaActiveDotStyle,
  ChartTooltip,
  chartPalette,
  darkChartAxisStyle,
  darkChartGridStroke
} from "../common/ChartTooltip.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";

export function PiggyBankTrendChart({ budgetState }) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const items = (budgetState?.dailySeries || [])
    .map((item) => ({
      day: item.label,
      "Piggy balance": Number(item.piggyBank || 0),
      dayType: item.dayType
    }));
  const currentValue = items[items.length - 1]?.["Piggy balance"] || Number(budgetState?.piggyBank || 0);
  const chartWidth = Math.max(items.length * (isMobile ? 38 : 26), isMobile ? 360 : 0);

  return (
    <Card
      title="Piggy bank growth trend"
      className="h-full bg-[#0b0b10]/60"
      titleClassName="font-display text-base font-semibold tracking-tight text-fg"
      actions={<span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300 sm:text-sm">Current: {formatCurrency(currentValue)}</span>}
    >
      {items.length ? (
        <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
        <div className="h-64 sm:h-80" style={{ width: isMobile ? `${chartWidth}px` : "100%", minWidth: isMobile ? `${chartWidth}px` : "0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={items} margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="piggyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={darkChartGridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ ...darkChartAxisStyle, fontSize: isMobile ? 10 : 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ ...darkChartAxisStyle, fontSize: isMobile ? 10 : 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={isMobile ? 56 : 82}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<ChartTooltip valueFormatter={formatCurrency} variant="dark" />} cursor={false} />
                <Area
                  type="stepAfter"
                  dataKey="Piggy balance"
                  stroke="#34D399"
                  strokeWidth={3}
                  fill="url(#piggyGradient)"
                  dot={false}
                  activeDot={{ ...chartAreaActiveDotStyle, fill: "#34D399" }}
                />
              </AreaChart>
            </ResponsiveContainer>
        </div>
        </div>
      ) : <EmptyState title="No piggy bank movement yet" description="Savings start appearing here after the first underspend day closes." variant="dark" />}
    </Card>
  );
}
