export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.05] px-4 py-3 font-mono text-sm uppercase tracking-[0.18em] text-accent shadow-panel backdrop-blur-xl">
      <span className="relative inline-flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      <span>{label}</span>
    </div>
  );
}
