export const chartPalette = {
  indigo: "#5E6AD2",
  violet: "#8B5CF6",
  cyan: "#38BDF8",
  emerald: "#34D399",
  amber: "#F59E0B",
  slate: "#515764",
  rose: "#FB7185"
};

export const chartAxisStyle = {
  fill: "#8A8F98",
  fontSize: 12
};

export const chartGridStroke = "rgba(255,255,255,0.08)";
export const darkChartAxisStyle = {
  fill: "#8A8F98",
  fontSize: 12
};
export const darkChartGridStroke = "rgba(255,255,255,0.08)";
export const chartAreaActiveDotStyle = {
  r: 5,
  stroke: "#0b0b0f",
  strokeWidth: 2
};
export const chartLineActiveDotStyle = {
  r: 5,
  fill: "#5E6AD2",
  stroke: "#0b0b0f",
  strokeWidth: 2
};

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => String(value),
  variant = "light"
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const isDark = variant === "dark";
  const wrapperClassName = isDark
    ? "rounded-2xl border border-white/[0.08] bg-[#0b0b0f]/95 px-3 py-2.5 shadow-panel backdrop-blur-xl"
    : "rounded-2xl border border-white/[0.08] bg-[#0b0b0f]/95 px-3 py-2.5 shadow-panel backdrop-blur-xl";
  const labelClassName = isDark
    ? "mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-muted"
    : "mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-muted";
  const itemClassName = isDark
    ? "flex items-center justify-between gap-4 text-sm text-fg-muted"
    : "flex items-center justify-between gap-4 text-sm text-fg-muted";
  const valueClassName = "font-semibold text-fg";

  return (
    <div className={wrapperClassName}>
      {label ? (
        <p className={labelClassName}>
          {label}
        </p>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={`${entry.dataKey}-${entry.name}`} className={itemClassName}>
            <span className="flex items-center gap-2 text-fg-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill || chartPalette.slate }}
              />
              {entry.name}
            </span>
            <span className={valueClassName}>{valueFormatter(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
