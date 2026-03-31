export function Pagination({ page, pageSize, total, onPageChange, disabled = false }) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-fg-muted shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <button className="w-full border border-white/[0.08] bg-white/[0.05] text-fg shadow-panel hover:bg-white/[0.08] sm:w-auto" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
      <span className="font-medium text-fg">Page {page} of {totalPages}</span>
      <button className="w-full border border-white/[0.08] bg-white/[0.05] text-fg shadow-panel hover:bg-white/[0.08] sm:w-auto" disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
    </div>
  );
}
