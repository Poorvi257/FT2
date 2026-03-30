import { getMaxValue } from "../../lib/charts.js";

export function SimpleLineChart({ items, xKey = "date", yKey = "amount" }) {
  const max = getMaxValue(items, yKey);
  const labelStep = items.length > 8 ? Math.ceil(items.length / 6) : 1;
  const points = items.map((item, index) => {
    const x = items.length === 1 ? 50 : (index / (items.length - 1)) * 100;
    const y = 100 - (Number(item[yKey]) / max) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="line-chart-wrapper">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart">
        <polyline fill="none" stroke="var(--accent-strong)" strokeWidth="2" points={points} />
        {items.map((item, index) => {
          const x = items.length === 1 ? 50 : (index / (items.length - 1)) * 100;
          const y = 100 - (Number(item[yKey]) / max) * 100;
          return <circle key={`${item[xKey]}-${item[yKey]}`} cx={x} cy={y} r="2.2" fill="var(--accent)" />;
        })}
      </svg>
      <div className="line-chart-labels">
        {items.filter((_, index) => index % labelStep === 0 || index === items.length - 1).map((item) => (
          <span key={`${item[xKey]}-${item[yKey]}`}>{item[xKey]}</span>
        ))}
      </div>
    </div>
  );
}
