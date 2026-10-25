import { useId } from 'react';
import { ChevronDownIcon } from './icons';

export default function Select({ label, error, options, placeholder, className = '', size = 'md', id, ...props }) {
  const autoId = useId();
  const selectId = id || autoId;
  const height = size === 'sm' ? 'h-8 text-xs' : 'h-10 text-sm';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          className={`w-full cursor-pointer appearance-none rounded-control border bg-page pr-8 pl-3 text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10 ${height} ${
            error ? 'border-danger' : 'border-line'
          }`}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const text = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <ChevronDownIcon size={16} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted" />
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
