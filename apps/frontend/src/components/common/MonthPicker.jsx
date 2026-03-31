export function MonthPicker({ value, onChange, variant = "light" }) {
  const isDark = variant === "dark";

  return (
    <label className={`month-picker w-full min-w-0 rounded-2xl border px-4 py-3 shadow-panel backdrop-blur-xl sm:min-w-[188px] sm:w-auto ${isDark
      ? "border-white/[0.08] bg-white/[0.05]"
      : "border-accent/20 bg-accent/10"}`}
    >
      <span className={isDark ? "text-fg-muted" : "text-accent"}>Month</span>
      <input
        className={isDark ? "bg-[#0f0f12] text-fg" : "border-accent/30 bg-[#101119] text-fg"}
        type="month"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
