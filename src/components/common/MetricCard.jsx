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
    blue: 'border-l-[#173B73] text-[#173B73]',
    green: 'border-l-[#168A55] text-[#168A55]',
    amber: 'border-l-[#D98C00] text-[#D98C00]',
    red: 'border-l-[#C62828] text-[#C62828]',
    purple: 'border-l-[#24477F] text-[#24477F]',
    maroon: 'border-l-[#C62828] text-[#C62828]'
  };

  const iconBg = {
    blue: 'bg-[#173B73]/10 text-[#173B73] dark:text-blue-300',
    green: 'bg-[#168A55]/10 text-[#168A55] dark:text-emerald-400',
    amber: 'bg-[#D98C00]/10 text-[#D98C00] dark:text-amber-400',
    red: 'bg-[#C62828]/10 text-[#C62828] dark:text-red-400',
    purple: 'bg-[#24477F]/10 text-[#24477F] dark:text-blue-300',
    maroon: 'bg-[#C62828]/10 text-[#C62828] dark:text-red-400'
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#D9DEE7] dark:border-slate-800 bg-white dark:bg-[#0E1C35] p-5 shadow-sm transition-all duration-200 hover:shadow-md border-l-4 ${accentBorders[accentColor] || accentBorders.blue} ${className}`}
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
