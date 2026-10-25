import Button from './Button';
import { AlertIcon, InboxIcon, RefreshIcon } from './icons';

export function LoadingState({ rows = 5, label = 'Loading' }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 py-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-control bg-hover" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
      <AlertIcon size={32} className="text-danger" />
      <div>
        <p className="font-medium">Couldn't load this data</p>
        <p className="mt-1 text-sm text-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshIcon} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <InboxIcon size={32} className="text-muted" />
      <div>
        <p className="font-medium">{title}</p>
        {message && <p className="mt-1 text-sm text-muted">{message}</p>}
      </div>
      {action}
    </div>
  );
}

export default function DataState({ loading, error, onRetry, isEmpty, empty, loadingRows, children }) {
  if (loading) return <LoadingState rows={loadingRows} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return empty || <EmptyState />;
  return children;
}
