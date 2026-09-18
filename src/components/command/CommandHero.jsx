import React from 'react';
import { useRailway } from '../../context/RailwayContext';
import { ArrowRight, Cpu, Zap, Radio, Train } from 'lucide-react';

export const CommandHero = ({ onNavigate }) => {
  const { selectedCorridor, telemetrySummary, tasks, blockPlans } = useRailway();

  const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'EMERGENCY').length || 2;
  const activeBlocks = blockPlans.filter(p => p.status === 'APPROVED' || p.status === 'APPROVED_BY_CONTROLLER' || p.status === 'ACTIVE').length || 2;

  const stats = [
    { label: 'CAPACITY UTILIZATION', value: `${selectedCorridor?.capacityUtilization || 138}%`, color: 'text-cyan-400' },
    { label: 'ACTIVE BLOCKS', value: activeBlocks, color: 'text-amber-400' },
    { label: 'TRAIN CONFLICTS', value: telemetrySummary?.activeConflicts ?? 2, color: 'text-red-400' },
    { label: 'CRITICAL MAINTENANCE', value: `${criticalTasks} Tasks`, color: 'text-rose-400' },
    { label: 'ASSET AVAILABILITY', value: '100%', color: 'text-emerald-400' },
    { label: 'AI PRIORITY SCORE', value: '88.8', color: 'text-amber-300' },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#1C2C4E] bg-gradient-to-br from-[#0A162B] via-[#091122] to-[#050B14] shadow-2xl select-none">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#11203A_1px,transparent_1px),linear-gradient(to_bottom,#11203A_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />

      {/* Railway Track Graphic at bottom with moving Indian Railways train */}
      <div className="absolute bottom-0 left-0 right-0 h-14 overflow-hidden pointer-events-none">
        {/* Top rail */}
        <div className="absolute bottom-6 left-0 right-0 h-[2px] bg-slate-600/70" />
        {/* Bottom rail */}
        <div className="absolute bottom-3 left-0 right-0 h-[2px] bg-slate-600/70" />
        {/* Sleepers */}
        <div className="absolute bottom-2 left-0 right-0 flex">
          {Array.from({ length: 80 }, (_, i) => (
            <div key={i} className="w-1.5 h-6 bg-slate-700/40 mx-[10px] flex-shrink-0" />
          ))}
        </div>
        {/* Animated Moving Train */}
        <div className="absolute bottom-3 animate-train-move flex items-center">
          {/* Loco */}
          <div className="w-12 h-5 bg-gradient-to-r from-red-700 to-red-900 rounded-sm border border-red-500/60 shadow-lg shadow-red-950/80 flex items-center justify-between px-1">
            <span className="w-1 h-1 rounded-full bg-amber-300 animate-pulse" />
            <span className="text-[7px] font-mono text-white font-bold">WAP-7</span>
          </div>
          {/* Coach 1 */}
          <div className="w-9 h-4 bg-slate-800 rounded-sm border border-slate-600/40 ml-0.5" />
          {/* Coach 2 */}
          <div className="w-9 h-4 bg-slate-800 rounded-sm border border-slate-600/40 ml-0.5" />
          {/* Coach 3 */}
          <div className="w-9 h-4 bg-slate-800 rounded-sm border border-slate-600/40 ml-0.5" />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 pb-16 sm:pb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Left info */}
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-[0.2em]">
                RAILWAY OPERATIONS COMMAND CENTER
              </span>
            </div>

            <div>
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
                ACTIVE CORRIDOR:
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                DELHI — KANPUR CORRIDOR (HDN-1)
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs font-mono text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700/60 text-red-300 font-bold">
                NDLS - CNB
              </span>
              <span>NCR - Prayagraj Division</span>
              <span className="text-slate-600">•</span>
              <span>440 Route Km</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300">Automatic Block Signalling (ABS)</span>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigate('ai-planning')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-xs sm:text-sm font-bold font-mono tracking-wider shadow-xl shadow-red-950/50 flex items-center justify-center gap-2.5 transition-all group border border-red-500/50"
            >
              <Cpu className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>GENERATE AI BLOCK PLAN</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Live Corridor Stats Strip */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-lg sm:text-xl font-black font-mono tracking-tight ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
