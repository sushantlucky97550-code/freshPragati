import React from 'react';

export const StatusBadge = ({ status, size = 'sm', className = '' }) => {
  const normalized = (status || '').toUpperCase();

  const getBadgeConfig = () => {
    switch (normalized) {
      case 'OPERATIONAL':
      case 'EXCELLENT':
      case 'ON_TIME':
      case 'APPROVED':
      case 'APPROVED_BY_CONTROLLER':
      case 'OPTIMAL':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-500',
          pulse: false,
          label: status.replace(/_/g, ' ')
        };

      case 'SHADOW_ELIGIBLE':
      case 'SHADOW_BUNDLING':
      case 'INTEGRATED_SHADOW_BLOCK':
        return {
          bg: 'bg-sky-500/10 dark:bg-sky-950/40',
          text: 'text-sky-700 dark:text-sky-400',
          border: 'border-sky-500/30',
          dot: 'bg-sky-500',
          pulse: true,
          label: 'SHADOW BUNDLED'
        };

      case 'RESTRICTED':
      case 'FAIR':
      case 'SLIGHT_DELAY':
      case 'PENDING_BLOCK':
      case 'PROPOSED':
      case 'MEDIUM':
      case 'HIGH':
      case 'REGULATED':
      case 'ATTENTION_REQUIRED':
      case 'CONGESTED':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/40',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-500/30',
          dot: 'bg-amber-500',
          pulse: true,
          label: status.replace(/_/g, ' ')
        };

      case 'CRITICAL':
      case 'EMERGENCY':
      case 'CANCELLED':
      case 'FAILED':
      case 'DANGER':
        return {
          bg: 'bg-red-500/10 dark:bg-red-950/40',
          text: 'text-red-700 dark:text-red-400',
          border: 'border-red-500/30',
          dot: 'bg-red-500',
          pulse: true,
          label: status.replace(/_/g, ' ')
        };

      default:
        return {
          bg: 'bg-slate-500/10 dark:bg-slate-800/40',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-500/30',
          dot: 'bg-slate-400',
          pulse: false,
          label: status.replace(/_/g, ' ')
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses = size === 'xs' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : size === 'md' 
      ? 'px-3 py-1 text-xs' 
      : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium font-mono border tracking-wide uppercase ${sizeClasses} ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-ping' : ''}`}
      />
      <span>{config.label}</span>
    </span>
  );
};
