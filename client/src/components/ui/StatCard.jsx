import { TrendUpIcon, TrendDownIcon } from './icons';

const COLORS = {
  purple: 'bg-stat-purple',
  blue: 'bg-stat-blue',
};

export default function StatCard({ title, value, change, subtitle, color = 'purple' }) {
  const hasChange = typeof change === 'number';
  const TrendIcon = change < 0 ? TrendDownIcon : TrendUpIcon;

  return (
    <div className={`rounded-card p-4 text-brand sm:p-6 ${COLORS[color]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
        {hasChange ? (
          <p className="flex items-center gap-1 text-xs" title="Compared with the previous 7 days">
            {change > 0 ? '+' : ''}
            {change}%
            <TrendIcon size={16} />
          </p>
        ) : (
          subtitle && <p className="text-xs opacity-60">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
