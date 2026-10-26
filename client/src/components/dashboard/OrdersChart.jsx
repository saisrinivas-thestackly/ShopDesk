import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { formatCompact, formatCurrency, formatDayLabel } from '../../utils/format';

const TABS = [
  { key: 'orders', label: 'Orders' },
  { key: 'revenue', label: 'Revenue' },
];

function ChartTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-control border border-line bg-page px-3 py-2 text-xs text-ink shadow-md">
      <p className="text-muted">{formatDayLabel(point.date)}</p>
      <p className="mt-0.5 font-semibold">
        {metric === 'revenue' ? formatCurrency(point.revenue) : `${point.orders} orders`}
      </p>
    </div>
  );
}

export default function OrdersChart({ data }) {
  const { theme } = useTheme();
  const [metric, setMetric] = useState('orders');

  const lineColor = theme === 'dark' ? '#ffffff' : '#1c1c1c';
  const axisColor = theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(28,28,28,0.4)';

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2" role="tablist" aria-label="Chart metric">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={metric === tab.key}
            onClick={() => setMetric(tab.key)}
            className={`cursor-pointer text-sm transition-colors ${metric === tab.key ? 'font-semibold text-ink' : 'text-muted hover:text-ink'}`}
          >
            {tab.label}
          </button>
        ))}
        <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
        <span className="flex items-center gap-1.5 text-xs">
          <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
          Last 14 days
        </span>
      </div>
      <div className="h-64" role="img" aria-label={`${metric === 'orders' ? 'Orders' : 'Revenue'} per day for the last 14 days`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.12} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatDayLabel}
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
              dy={8}
            />
            <YAxis
              allowDecimals={false}
              tickFormatter={metric === 'revenue' ? formatCompact : undefined}
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<ChartTooltip metric={metric} />} cursor={{ stroke: axisColor, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={lineColor}
              strokeWidth={2}
              fill="url(#chartFill)"
              activeDot={{ r: 4, fill: lineColor, stroke: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
