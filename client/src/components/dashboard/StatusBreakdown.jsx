const BAR_COLORS = {
  Pending: 'bg-status-pending',
  Shipped: 'bg-status-shipped',
  Delivered: 'bg-status-delivered',
  Cancelled: 'bg-status-cancelled',
};

export default function StatusBreakdown({ counts }) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <ul className="space-y-5">
      {Object.entries(counts).map(([status, count]) => {
        const percent = total ? Math.round((count / total) * 100) : 0;
        return (
          <li key={status}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>{status}</span>
              <span className="text-muted">
                {count} <span className="text-xs">({percent}%)</span>
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div className={`h-full rounded-full ${BAR_COLORS[status]}`} style={{ width: `${percent}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
