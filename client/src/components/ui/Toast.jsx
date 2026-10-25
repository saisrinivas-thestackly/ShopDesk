import { CheckCircleIcon, AlertIcon, CloseIcon } from './icons';

export default function Toast({ type = 'success', message, onClose }) {
  const isError = type === 'error';
  const Icon = isError ? AlertIcon : CheckCircleIcon;

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className="animate-toast-in flex items-start gap-3 rounded-control border border-line bg-page p-3 text-sm text-ink shadow-lg"
    >
      <Icon size={20} className={isError ? 'text-danger' : 'text-status-delivered'} />
      <p className="flex-1 pt-0.5">{message}</p>
      <button type="button" onClick={onClose} aria-label="Close message" className="cursor-pointer rounded text-muted hover:text-ink">
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
