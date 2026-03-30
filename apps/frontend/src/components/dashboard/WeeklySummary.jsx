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
import { EmptyState } from "../common/EmptyState.jsx";
import {
  ChartTooltip,
  darkChartAxisStyle,
  darkChartGridStroke
} from "../common/ChartTooltip.jsx";
import { formatCurrency } from "../../lib/formatCurrency.js";

export function WeeklySummary({ items }) {
  const normalized = items?.map((item) => ({ week: item.week, Spend: Number(item.amount || 0) })) || [];

  return (
    <Card
      title="Weekly summary"
      className="bg-white/[0.04]"
      titleClassName="font-display text-lg font-semibold tracking-tight text-fg"
    >
      {normalized.length ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={normalized} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke={darkChartGridStroke} strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={darkChartAxisStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={darkChartAxisStyle}
                axisLine={false}
                tickLine={false}
                width={82}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<ChartTooltip valueFormatter={formatCurrency} variant="dark" />} cursor={false} />
              <Bar
                dataKey="Spend"
                fill="#38BDF8"
                radius={[10, 10, 0, 0]}
                barSize={36}
                activeBar={{ stroke: "rgba(255,255,255,0.22)", strokeWidth: 1.5, filter: "brightness(1.06)" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <EmptyState title="No weekly data" description="Weekly rollups will show once entries exist." variant="dark" />}
    </Card>
  );
}
