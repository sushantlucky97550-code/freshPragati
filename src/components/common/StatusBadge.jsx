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
          bg: 'bg-[#E8F5E9] dark:bg-emerald-950/40',
          text: 'text-[#168A55] dark:text-emerald-300 font-semibold',
          border: 'border-[#168A55]/30',
          dot: 'bg-[#168A55]',
          pulse: false,
          label: status.replace(/_/g, ' ')
        };

      case 'SHADOW_ELIGIBLE':
      case 'SHADOW_BUNDLING':
      case 'INTEGRATED_SHADOW_BLOCK':
        return {
          bg: 'bg-[#EBF2FA] dark:bg-blue-950/40',
          text: 'text-[#173B73] dark:text-blue-300 font-semibold',
          border: 'border-[#173B73]/30',
          dot: 'bg-[#173B73]',
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
          bg: 'bg-[#FFF8E1] dark:bg-amber-950/40',
          text: 'text-[#D98C00] dark:text-amber-300 font-semibold',
          border: 'border-[#D98C00]/40',
          dot: 'bg-[#D98C00]',
          pulse: true,
          label: status.replace(/_/g, ' ')
        };

      case 'CRITICAL':
      case 'EMERGENCY':
      case 'CANCELLED':
      case 'FAILED':
      case 'DANGER':
        return {
          bg: 'bg-[#FFEBEE] dark:bg-red-950/40',
          text: 'text-[#C62828] dark:text-red-300 font-semibold',
          border: 'border-[#C62828]/40',
          dot: 'bg-[#C62828]',
          pulse: true,
          label: status.replace(/_/g, ' ')
        };

      default:
        return {
          bg: 'bg-[#F4F6F8] dark:bg-slate-800/40',
          text: 'text-[#5B6575] dark:text-slate-300',
          border: 'border-[#D9DEE7] dark:border-slate-700',
          dot: 'bg-[#5B6575]',
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
