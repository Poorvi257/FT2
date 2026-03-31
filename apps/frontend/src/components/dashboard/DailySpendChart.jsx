import { RiPulseLine } from "@remixicon/react";
import { Card } from "../common/Card.jsx";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState } from "../common/EmptyState.jsx";
import {
  chartAreaActiveDotStyle,
  ChartTooltip,
  darkChartAxisStyle,
  darkChartGridStroke
} from "../common/ChartTooltip.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";

export function DailySpendChart({ items }) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const normalized = items?.map((item) => ({
    day: `${item.date.slice(8)}/${item.date.slice(5, 7)}`,
    Spend: Number(item.amount || 0)
  })) || [];
  const chartWidth = Math.max(normalized.length * (isMobile ? 34 : 24), isMobile ? 360 : 0);

  return (
    <Card
      title="Daily activity"
      className="h-full bg-white/[0.04]"
      titleClassName="font-display text-lg font-semibold tracking-tight text-fg sm:text-xl"
      headerClassName="mb-6"
      actions={(
        <span className="inline-flex rounded-2xl border border-white/[0.08] bg-white/[0.05] p-2.5 text-accent shadow-soft">
          <RiPulseLine size={18} />
        </span>
      )}
    >
      {normalized.length ? (
        <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
          <div className="h-56 sm:h-80" style={{ width: isMobile ? `${chartWidth}px` : "100%", minWidth: isMobile ? `${chartWidth}px` : "0" }}>
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={normalized} margin={{ top: 12, right: isMobile ? 8 : 12, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="dailySpendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5E6AD2" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#5E6AD2" stopOpacity={0.02} />
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
                type="monotone"
                dataKey="Spend"
                stroke="#5E6AD2"
                strokeWidth={3}
                fill="url(#dailySpendGradient)"
                dot={false}
                activeDot={{ ...chartAreaActiveDotStyle, fill: "#5E6AD2" }}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      ) : <EmptyState title="No variable spend yet" description="Only variable transactions are included in the daily activity trend." variant="dark" />}
    </Card>
  );
}
