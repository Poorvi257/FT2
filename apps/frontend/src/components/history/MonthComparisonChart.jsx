import { Card } from "../common/Card.jsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  chartAxisStyle,
  chartGridStroke,
  chartPalette,
  ChartTooltip
} from "../common/ChartTooltip.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";

export function MonthComparisonChart({ months }) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const items = months.map((month) => ({
    month: month.month,
    Spend: Number(month.totals.totalSpent || 0)
  }));
  const chartWidth = Math.max(items.length * (isMobile ? 72 : 56), isMobile ? 340 : 0);

  return (
    <Card title="Month-to-month comparison" className="bg-white/[0.04]">
      <div className="-mx-2 mt-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
      <div className="h-64 rounded-[24px] border border-white/[0.06] bg-[#0b0b10]/60 p-3 shadow-soft sm:h-80 sm:rounded-[28px] sm:p-4" style={{ width: isMobile ? `${chartWidth}px` : "100%", minWidth: isMobile ? `${chartWidth}px` : "0" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke={chartGridStroke} strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ ...chartAxisStyle, fontSize: isMobile ? 10 : 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ ...chartAxisStyle, fontSize: isMobile ? 10 : 12 }}
              axisLine={false}
              tickLine={false}
              width={isMobile ? 56 : 82}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<ChartTooltip valueFormatter={formatCurrency} variant="dark" />} cursor={false} />
            <Bar
              dataKey="Spend"
              fill={chartPalette.indigo}
              radius={[10, 10, 0, 0]}
              barSize={isMobile ? 26 : 36}
              activeBar={{ stroke: "rgba(255,255,255,0.22)", strokeWidth: 1.5, filter: "brightness(1.06)" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      </div>
    </Card>
  );
}
