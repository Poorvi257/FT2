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

export function MonthComparisonChart({ months }) {
  const items = months.map((month) => ({
    month: month.month,
    Spend: Number(month.totals.totalSpent || 0)
  }));

  return (
    <Card title="Month-to-month comparison" className="bg-white/[0.04]">
      <div className="mt-2 h-80 rounded-[28px] border border-white/[0.06] bg-[#0b0b10]/60 p-4 shadow-soft">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke={chartGridStroke} strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={chartAxisStyle} axisLine={false} tickLine={false} />
            <YAxis
              tick={chartAxisStyle}
              axisLine={false}
              tickLine={false}
              width={82}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<ChartTooltip valueFormatter={formatCurrency} variant="dark" />} cursor={false} />
            <Bar
              dataKey="Spend"
              fill={chartPalette.indigo}
              radius={[10, 10, 0, 0]}
              barSize={36}
              activeBar={{ stroke: "rgba(255,255,255,0.22)", strokeWidth: 1.5, filter: "brightness(1.06)" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
