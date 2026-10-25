export default function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-ink" />
        <path d="M9 12h14l-1.2 10.2a2 2 0 0 1-2 1.8h-7.6a2 2 0 0 1-2-1.8L9 12Z" className="fill-page" />
        <path d="M12.5 12V10.5a3.5 3.5 0 0 1 7 0V12" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-page" />
      </svg>
      <span className="text-sm font-semibold">ShopDesk</span>
    </span>
  );
}
