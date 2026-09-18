import React from 'react';
import { useRailway } from '../../context/RailwayContext';
import { ArrowRight, Cpu, Zap, Radio } from 'lucide-react';

/**
 * CommandHero — Cinematic hero banner for the command center dashboard.
 * Shows active corridor, live operational metrics, and an animated railway track.
 */
export const CommandHero = ({ onNavigate }) => {
  const { selectedCorridor, telemetrySummary, tasks, blockPlans } = useRailway();

  const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'EMERGENCY').length;
  const activeBlocks = blockPlans.filter(p => p.status === 'APPROVED' || p.status === 'APPROVED_BY_CONTROLLER' || p.status === 'ACTIVE').length;

  const stats = [
    { label: 'CAPACITY', value: `${selectedCorridor?.capacityUtilization || 87}%`, color: 'text-cyan-400' },
    { label: 'ACTIVE BLOCKS', value: activeBlocks, color: 'text-amber-400' },
    { label: 'CONFLICTS', value: telemetrySummary?.activeConflicts ?? 1, color: 'text-red-400' },
    { label: 'CRITICAL MAINT.', value: criticalTasks, color: 'text-rose-400' },
    { label: 'AI SCORE', value: '88.8', color: 'text-emerald-400' },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-command-border bg-hero-gradient">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-command opacity-30 pointer-events-none" />

      {/* Animated railway track line */}
      <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden opacity-40">
        <div className="absolute bottom-4 left-0 right-0 h-[2px] bg-slate-600" />
        <div className="absolute bottom-[14px] left-0 right-0 h-[2px] bg-slate-600" />
        {/* Track ties */}
        <div className="absolute bottom-2 left-0 right-0 flex">
          {Array.from({ length: 60 }, (_, i) => (
            <div key={i} className="w-1 h-5 bg-slate-700/40 mx-[12px] flex-shrink-0" />
          ))}
        </div>
        {/* Moving train */}
        <div className="absolute bottom-3 animate-train-move">
          <div className="flex items-center">
            <div className="w-8 h-4 bg-gradient-to-r from-red-800 to-red-900 rounded-sm border border-red-600/30" />
            <div className="w-5 h-3 bg-slate-800 rounded-sm border border-slate-700/30 -ml-0.5" />
            <div className="w-5 h-3 bg-slate-800 rounded-sm border border-slate-700/30 -ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Left: Main info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-[0.2em]">
                Railway Operations Command Center
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {selectedCorridor?.name || 'Delhi — Kanpur Corridor'}
            </h1>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-800/50 text-red-300">
                {selectedCorridor?.code || 'NDLS-CNB'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedCorridor?.division || 'NCR - Prayagraj'} • {selectedCorridor?.lengthKm || 440} TKm • {selectedCorridor?.signaling || 'MACLS'}
              </span>
            </div>
          </div>

          {/* Right: CTA */}
          <button
            onClick={() => onNavigate('ai-planning')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white text-sm font-bold shadow-lg shadow-red-950/40 transition-all group border border-red-600/30 self-start lg:self-auto"
          >
            <Cpu className="w-4 h-4 text-amber-300" />
            <span>Generate AI Block Plan</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-black font-mono ${stat.color} mt-0.5`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
