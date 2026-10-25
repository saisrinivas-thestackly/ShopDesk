import { ChevronLeftIcon, ChevronRightIcon } from './icons';

export default function Pagination({ page, totalPages, total, limit = 10, onChange }) {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const buttonClass =
    'grid size-8 cursor-pointer place-items-center rounded-control text-sm transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" className={buttonClass} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeftIcon size={16} />
        </button>
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`${buttonClass} ${n === page ? 'bg-hover font-semibold' : 'text-muted'}`}
          >
            {n}
          </button>
        ))}
        <button type="button" className={buttonClass} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRightIcon size={16} />
        </button>
      </div>
    </nav>
  );
}
