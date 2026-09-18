import React from 'react';
import { useRailway } from '../../context/RailwayContext';
import {
  Cpu,
  Wrench,
  Layers,
  Train,
  Calendar,
  Lightbulb,
  BarChart3,
  GitMerge,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Radio,
  Clock
} from 'lucide-react';

export const OperationsModulesGrid = ({ onNavigate }) => {
  const { tasks, blockPlans, liveTrains, recommendations } = useRailway();

  const criticalTasksCount = tasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'EMERGENCY').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'PENDING_BLOCK' || t.status === 'PENDING').length;
  const activeBlocksCount = blockPlans.filter(p => p.status === 'APPROVED' || p.status === 'APPROVED_BY_CONTROLLER' || p.status === 'ACTIVE').length;
  const delayedTrainsCount = liveTrains.filter(t => t.currentDelayMins > 0 || t.status === 'DELAYED').length;
  const totalTrainsCount = liveTrains.length || 18;
  const recsCount = recommendations.length || 4;

  const modules = [
    {
      id: 'ai-planning',
      title: 'AUTOMATIC BLOCK PLANNING',
      subtitle: 'AI OPTIMIZATION',
      stat: `${activeBlocksCount || 12} ACTIVE REQUESTS`,
      badge: 'MILP-v4.2',
      badgeColor: 'bg-red-950/80 text-red-300 border-red-800/60',
      icon: Cpu,
      gradient: 'from-red-950/40 via-[#0D1525] to-[#0A101D]',
      accentColor: 'text-red-400',
      borderColor: 'border-red-600/30 hover:border-red-500/80',
      visualType: 'signal-track',
      description: 'Automated corridor shadow possession bundling & timetable deconfliction engine.'
    },
    {
      id: 'maintenance-tasks',
      title: 'MAINTENANCE CONTROL',
      subtitle: 'INFRASTRUCTURE REQUISITIONS',
      stat: `${criticalTasksCount || 3} CRITICAL TASKS • ${pendingTasksCount || 12} PENDING`,
      badge: 'CRITICAL',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
      icon: Wrench,
      gradient: 'from-amber-950/40 via-[#0D1525] to-[#0A101D]',
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-600/30 hover:border-amber-500/80',
      visualType: 'track-wrench',
      description: 'P-Way, TRD & S&T possession requisitions with safety clearance workflows.'
    },
    {
      id: 'railway-assets',
      title: 'RAILWAY ASSETS & TELEMETRY',
      subtitle: 'ASSET DEGRADATION',
      stat: '840 TKm MONITORED • 100% HEALTH',
      badge: 'IOT SENSORS',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      icon: Layers,
      gradient: 'from-emerald-950/40 via-[#0D1525] to-[#0A101D]',
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-600/30 hover:border-emerald-500/80',
      visualType: 'infrastructure',
      description: 'Turnouts, OHE substations, bridges, rail stress telemetry & electronic interlocking.'
    },
    {
      id: 'trains-corridors',
      title: 'LIVE TRAINS & CORRIDORS',
      subtitle: 'RAILRADAR INTEGRATED',
      stat: `${totalTrainsCount} MONITORED • ${delayedTrainsCount || 2} DELAYED`,
      badge: 'COIS / FOIS',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
      icon: Train,
      gradient: 'from-cyan-950/40 via-[#0D1525] to-[#0A101D]',
      accentColor: 'text-cyan-400',
      borderColor: 'border-cyan-600/30 hover:border-cyan-500/80',
      visualType: 'train-route',
      description: 'Live sectional throughput, section occupancy, and train headway monitoring.'
    },
    {
      id: 'planner',
      title: 'WEEKLY / MONTHLY PLANNER',
      subtitle: 'CORRIDOR SCHEDULE',
      stat: '7-DAY ROLLING HORIZON',
      badge: 'SCHEDULED',
      badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
      icon: Calendar,
      gradient: 'from-blue-950/40 via-[#0D1525] to-[#0A101D]',
      accentColor: 'text-blue-400',
      borderColor: 'border-blue-600/30 hover:border-blue-500/80',
      visualType: 'calendar-block',
      description: 'Pre-planned traffic blocks, machine stabling slots, and weekend mega possessions.'
    },
    {
      id: 'recommendations',
      title: 'AI RECOMMENDATIONS',
      subtitle: 'PRESCRIPTIVE ENGINE',
      stat: `${recsCount} ACTIONABLE INSIGHTS`,
      badge: 'AI INSIGHTS',
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
      icon: Lightbulb,
      gradient: 'from-purple-950/40 via-[#0D1525] to-[#0A101D]',
      accentColor: 'text-purple-400',
      borderColor: 'border-purple-600/30 hover:border-purple-500/80',
      visualType: 'neural-signal',
      description: 'Prescriptive decision optimization with speed recovery and shadow bundling.'
    },
    {
      id: 'reports',
      title: 'REPORTS & ANALYTICS',
      subtitle: 'OPERATIONS AUDIT',
      stat: '94% POSSESSION EFFICIENCY',
      badge: 'ANALYTICS',
      badgeColor: 'bg-teal-950/80 text-teal-300 border-teal-800/60',
      icon: BarChart3,
      gradient: 'from-teal-950/40 via-[#0D1525] to-[#0A101D]',
      accentColor: 'text-teal-400',
      borderColor: 'border-teal-600/30 hover:border-teal-500/80',
      visualType: 'charts',
      description: 'Sectional punctuality index, block burst audits, and machine utilization logs.'
    },
    {
      id: 'department-coordination',
      title: 'MULTI-DEPT COORDINATION',
      subtitle: 'SHADOW BUNDLING',
      stat: '60% TIME SAVINGS • 3 DEPTS',
      badge: 'COORDINATED',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
      icon: GitMerge,
      gradient: 'from-indigo-950/40 via-[#0D1525] to-[#0A101D]',
      accentColor: 'text-indigo-400',
      borderColor: 'border-indigo-600/30 hover:border-indigo-500/80',
      visualType: 'multi-dept',
      description: 'Synchronized possession grants combining Engineering, TRD, and S&T into one window.'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-mono">
              RAILOPT AI OPERATIONS MODULES
            </h2>
            <p className="text-xs text-slate-400">
              Direct access to all Indian Railways AI operations, block scheduling, and telemetry systems
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-[10px] font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
          8 ACTIVE SUBSYSTEMS
        </span>
      </div>

      {/* Grid of 8 High-Impact Railway Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => {
                if (mod.id === 'department-coordination') {
                  const el = document.getElementById('dept-coordination-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onNavigate('ai-planning');
                  }
                } else {
                  onNavigate(mod.id);
                }
              }}
              className={`group relative rounded-2xl border ${mod.borderColor} bg-gradient-to-br ${mod.gradient} p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 cursor-pointer overflow-hidden select-none`}
            >
              {/* Subtle background rail line graphic */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
                <Icon className="w-full h-full text-white" />
              </div>

              {/* Top Row: Icon + Badge */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-slate-900/90 border border-slate-700/50 ${mod.accentColor} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>

                {/* Subtitle & Title */}
                <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1">
                  {mod.subtitle}
                </div>
                <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors tracking-tight leading-snug mb-2">
                  {mod.title}
                </h3>

                {/* Stat Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 border border-white/5 font-mono text-[11px] font-bold text-slate-200 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{mod.stat}</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {mod.description}
                </p>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-slate-300 group-hover:text-white transition-colors">
                <span className="flex items-center gap-1">
                  OPEN MODULE
                </span>
                <span className="flex items-center gap-1 text-amber-400 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
