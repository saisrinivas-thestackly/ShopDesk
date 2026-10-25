import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-ink text-page hover:opacity-85',
  secondary: 'bg-hover text-ink hover:bg-line',
  ghost: 'text-ink hover:bg-hover',
  danger: 'bg-danger text-white hover:opacity-85',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  icon: IconComponent,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control font-medium whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner size={14} /> : IconComponent && <IconComponent size={16} />}
      {children}
    </button>
  );
}
