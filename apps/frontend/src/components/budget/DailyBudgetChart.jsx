import { Card } from "../common/Card.jsx";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState } from "../common/EmptyState.jsx";
import {
  chartAxisStyle,
  chartGridStroke,
  chartLineActiveDotStyle,
  chartPalette,
  ChartTooltip
} from "../common/ChartTooltip.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";

export function DailyBudgetChart({ budgetState }) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const items = (budgetState?.dailySeries || [])
    .map((item) => ({
      day: item.label,
      "Base limit": Number(item.baseLimit || 0),
      "Variable spend": Number(item.variableSpend || 0)
    }));
  const chartWidth = Math.max(items.length * (isMobile ? 38 : 26), isMobile ? 360 : 0);

  return (
    <Card title="Daily spend vs base limit" className="bg-white/[0.04]">
      {items.length ? (
        <>
          <p className="text-sm leading-6 text-fg-muted">
            Fixed transactions lower future days through the main budget pool. Variable transactions reduce only the current day&apos;s allowance.
          </p>
          <div className="-mx-2 mt-6 overflow-x-auto px-2 sm:mx-0 sm:px-0">
          <div className="h-64 rounded-[24px] border border-white/[0.06] bg-[#0b0b10]/60 p-3 shadow-soft sm:h-80 sm:rounded-[28px] sm:p-4" style={{ width: isMobile ? `${chartWidth}px` : "100%", minWidth: isMobile ? `${chartWidth}px` : "0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={items} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                <defs>
                  <linearGradient id="budgetSpendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartPalette.cyan} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={chartPalette.indigo} stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={chartGridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ ...chartAxisStyle, fontSize: isMobile ? 10 : 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ ...chartAxisStyle, fontSize: isMobile ? 10 : 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={isMobile ? 56 : 82}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<ChartTooltip valueFormatter={formatCurrency} variant="dark" />} cursor={false} />
                <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12, color: "#8A8F98" }} />
                <Bar
                  dataKey="Variable spend"
                  fill="url(#budgetSpendGradient)"
                  radius={[10, 10, 0, 0]}
                  barSize={isMobile ? 20 : 28}
                  activeBar={{ stroke: "rgba(255,255,255,0.22)", strokeWidth: 1.5, filter: "brightness(1.06)" }}
                />
                <Line
                  type="monotone"
                  dataKey="Base limit"
                  stroke={chartPalette.indigo}
                  strokeWidth={3}
                  dot={{ r: 3, fill: chartPalette.indigo, stroke: "#0b0b0f", strokeWidth: 1.5 }}
                  activeDot={chartLineActiveDotStyle}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={`${item.day}-${item["Variable spend"]}`}
                className="rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-xs font-medium text-fg-muted"
              >
                {item.day}: {formatCurrency(item["Variable spend"])} spent / {formatCurrency(item["Base limit"])} base
              </span>
            ))}
          </div>
        </>
      ) : <EmptyState title="No budget activity yet" description="Daily spend appears as transactions are recorded in the budget window." variant="dark" />}
    </Card>
  );
}
