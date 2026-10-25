const STATUS_STYLES = {
  Pending: 'text-status-pending bg-status-pending/10',
  Shipped: 'text-status-shipped bg-status-shipped/10',
  Delivered: 'text-status-delivered bg-status-delivered/10',
  Cancelled: 'text-status-cancelled bg-status-cancelled/10',
};

export default function Badge({ status }) {
  const style = STATUS_STYLES[status] || 'text-muted bg-hover';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}
