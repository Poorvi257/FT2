export function Card({
  title,
  actions,
  children,
  className = "",
  titleClassName = "font-display text-lg font-semibold tracking-tight text-fg",
  headerClassName = ""
}) {
  return (
    <section className={`rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 shadow-panel backdrop-blur-xl transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:border-white/[0.1] hover:shadow-panel-hover ${className}`}>
      {(title || actions) && (
        <div className={`mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${headerClassName}`}>
          <h3 className={titleClassName}>{title}</h3>
          {actions ? <div>{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
