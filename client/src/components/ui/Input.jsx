import { useId } from 'react';

export default function Input({ label, error, hint, className = '', id, rightSlot, ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  const messageId = `${inputId}-message`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className={`h-10 w-full rounded-control border bg-page px-3 text-sm text-ink transition outline-none placeholder:text-muted focus:border-ink/40 focus:ring-2 focus:ring-ink/10 ${
            error ? 'border-danger' : 'border-line'
          } ${rightSlot ? 'pr-10' : ''}`}
          {...props}
        />
        {rightSlot && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightSlot}</div>}
      </div>
      {error ? (
        <p id={messageId} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="mt-1 text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
