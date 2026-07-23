import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange, total, limit }) {
  if (!totalPages || totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--border-subtle)]">
      <p className="text-sm text-[var(--text-secondary)]">
        Showing <span className="font-medium text-[var(--text-primary)]">{start}-{end}</span> of{" "}
        <span className="font-medium text-[var(--text-primary)]">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--surface-sunken)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-[var(--text-primary)] px-2">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--surface-sunken)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
