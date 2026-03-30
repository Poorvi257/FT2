export function EmptyState({ title, description, variant = "light" }) {
  const isDark = variant === "dark";

  return (
    <div className={isDark
      ? "rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center shadow-soft"
      : "rounded-3xl border border-dashed border-accent/20 bg-accent/5 px-5 py-8 text-center shadow-soft"}
    >
      <strong className={`block text-base font-semibold ${isDark ? "text-fg" : "text-fg"}`}>{title}</strong>
      <p className={`mt-2 text-sm leading-6 ${isDark ? "text-fg-muted" : "text-fg-muted"}`}>{description}</p>
    </div>
  );
}
