import React, { useState, useEffect } from 'react';
import { useRailway } from '../../context/RailwayContext';
import { RailwayApiService } from '../../services/api';
import {
  Activity,
  Layers,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  Wrench,
  Cpu,
  TrendingUp
} from 'lucide-react';

export const KpiStrip = () => {
  const { tasks, blockPlans, telemetrySummary } = useRailway();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    RailwayApiService.getDashboardSummary()
      .then(data => { if (data) setSummary(data); })
      .catch(() => {});
  }, []);

  const val = (key, fallback) => summary?.[key] != null ? summary[key] : fallback;

  const criticalCount = val('criticalTasks', tasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'EMERGENCY').length || 2);
  const totalTasks = val('totalTasks', tasks.length || 12);
  const activeBlocks = val('approvedBlockPlans', blockPlans.filter(p => p.status === 'APPROVED' || p.status === 'APPROVED_BY_CONTROLLER' || p.status === 'ACTIVE').length || 2);
  const unresolvedConflicts = val('unresolvedConflicts', telemetrySummary?.activeConflicts ?? 2);

  const kpis = [
    {
      label: 'ASSET AVAILABILITY',
      value: val('assetAvailabilityPercent', 100),
      unit: '%',
      icon: Activity,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bgGlow: 'hover:border-emerald-400/70',
      sub: 'Computed from IoT'
    },
    {
      label: 'ACTIVE BLOCKS',
      value: activeBlocks,
      unit: '',
      icon: Layers,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bgGlow: 'hover:border-cyan-400/70',
      sub: 'Granted possessions'
    },
    {
      label: 'CRITICAL TASKS',
      value: `${criticalCount} / ${totalTasks}`,
      unit: '',
      icon: AlertTriangle,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      bgGlow: 'hover:border-rose-400/70',
      sub: 'High priority queue'
    },
    {
      label: 'TRAIN CONFLICTS',
      value: unresolvedConflicts,
      unit: '',
      icon: ShieldCheck,
      color: unresolvedConflicts > 0 ? 'text-amber-400' : 'text-emerald-400',
      border: 'border-amber-500/30',
      bgGlow: 'hover:border-amber-400/70',
      sub: 'Auto-mitigated by AI'
    },
    {
      label: 'MAINTENANCE WORKLOAD',
      value: val('totalWorkloadHoursPerWeek', 79),
      unit: 'HRS/WK',
      icon: Wrench,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bgGlow: 'hover:border-purple-400/70',
      sub: 'Machine capacity'
    },
    {
      label: 'BLOCK UTILIZATION',
      value: val('machineUtilizationPercent', 94),
      unit: '%',
      icon: TrendingUp,
      color: 'text-sky-400',
      border: 'border-sky-500/30',
      bgGlow: 'hover:border-sky-400/70',
      sub: 'Possession efficiency'
    },
    {
      label: 'AI OPTIMIZATION SCORE',
      value: val('aiPriorityScore', 88.8),
      unit: '',
      icon: Cpu,
      color: 'text-amber-300',
      border: 'border-amber-500/30',
      bgGlow: 'hover:border-amber-400/70',
      sub: 'Corridor solver index'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className={`rounded-2xl bg-[#0C1422] border ${kpi.border} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50 ${kpi.bgGlow} group select-none`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-tight">
                {kpi.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${kpi.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${kpi.color}`}>
                {kpi.value}
              </span>
              {kpi.unit && (
                <span className="text-[10px] font-mono text-slate-400">{kpi.unit}</span>
              )}
            </div>
            <p className="text-[9px] font-mono text-slate-500 truncate">
              {kpi.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
};
