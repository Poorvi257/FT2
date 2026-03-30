import { getMaxValue } from "../../lib/charts.js";

export function SimpleBarChart({ items, valueKey = "amount", labelKey = "label", color = "var(--accent)" }) {
  const max = getMaxValue(items, valueKey);

  return (
    <div className="chart-bars">
      {items.map((item) => (
        <div className="chart-bar-row" key={`${item[labelKey]}-${item[valueKey]}`}>
          <div className="chart-bar-meta">
            <span>{item[labelKey]}</span>
            <strong>{item[valueKey]}</strong>
          </div>
          <div className="chart-bar-track">
            <div
              className="chart-bar-fill"
              style={{ width: `${(Number(item[valueKey]) / max) * 100}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
