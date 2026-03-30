import { RiBarChartGroupedLine } from "@remixicon/react";
import { Card } from "../common/Card.jsx";
import {
  Bar,
  BarChart,
  Cell,
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

const barColors = [
  "#FB7185",
  "#F59E0B",
  "#FACC15",
  "#84CC16",
  "#34D399",
  "#2DD4BF",
  "#38BDF8",
  "#60A5FA",
  "#818CF8",
  "#A78BFA",
  "#C084FC",
  "#E879F9"
];

export function CategorySplitChart({ items }) {
  const normalized = items
    ?.map((item) => ({ category: item.category, Spend: Number(item.amount || 0) }))
    .sort((left, right) => right.Spend - left.Spend) || [];

  return (
    <Card
      title="Spending by category"
      className="h-full bg-white/[0.04]"
      titleClassName="font-display text-xl font-semibold tracking-tight text-fg"
      headerClassName="mb-6"
      actions={(
        <span className="inline-flex rounded-2xl border border-white/[0.08] bg-white/[0.05] p-2.5 text-accent shadow-soft">
          <RiBarChartGroupedLine size={18} />
        </span>
      )}
    >
      {normalized.length ? (
        <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={normalized} margin={{ top: 12, right: 12, left: 0, bottom: 28 }}>
                <CartesianGrid vertical={false} stroke={darkChartGridStroke} strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  interval={0}
                  angle={-42}
                  textAnchor="end"
                  height={72}
                  tick={darkChartAxisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={darkChartAxisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<ChartTooltip valueFormatter={formatCurrency} variant="dark" />} cursor={false} />
                <Bar
                  dataKey="Spend"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                  activeBar={{ stroke: "rgba(255,255,255,0.24)", strokeWidth: 1.5, filter: "brightness(1.06)" }}
                >
                  {normalized.map((entry, index) => (
                    <Cell key={`${entry.category}-${entry.Spend}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
      ) : <EmptyState title="No categories yet" description="Category distribution will appear after transactions are added." variant="dark" />}
    </Card>
  );
}
