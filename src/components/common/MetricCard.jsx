import React from 'react';

export const MetricCard = ({
  title,
  value,
  unit = '',
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  subtitle,
  accentColor = 'blue', // 'blue', 'green', 'amber', 'red', 'purple', 'maroon'
  className = '',
  footer
}) => {
  const accentBorders = {
    blue: 'border-l-sky-500 text-sky-500',
    green: 'border-l-emerald-500 text-emerald-500',
    amber: 'border-l-amber-500 text-amber-500',
    red: 'border-l-red-500 text-red-500',
    purple: 'border-l-purple-500 text-purple-500',
    maroon: 'border-l-railway-maroonBright text-railway-maroonBright'
  };

  const iconBg = {
    blue: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    maroon: 'bg-red-900/20 text-red-700 dark:text-red-400'
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1626] p-5 shadow-sm transition-all duration-200 hover:shadow-md border-l-4 ${accentBorders[accentColor] || accentBorders.blue} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-medium font-mono text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`rounded-lg p-2.5 ${iconBg[accentColor] || iconBg.blue}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`font-mono font-medium ${
                changeType === 'positive'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : changeType === 'negative'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {footer && (
        <div className="mt-3 border-t border-slate-100 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
