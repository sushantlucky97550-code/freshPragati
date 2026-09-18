import React, { useState } from 'react';
import {
  GitMerge,
  Layers,
  Wrench,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const DepartmentCoordination = ({ onNavigateToPlanning }) => {
  const [selectedScenario, setSelectedScenario] = useState('NIGHT_MEGA');

  const departments = [
    {
      id: 'PWAY',
      name: 'P-WAY (Engineering)',
      task: 'Tamping (CSM) & Rail Weld Stress Relief',
      originalDuration: '03:30 Hrs',
      color: 'border-blue-500/50 text-blue-400 bg-blue-950/40',
      icon: Wrench
    },
    {
      id: 'TRD',
      name: 'TRD / OHE (Electrical)',
      task: 'Catenary Wire Tension Adjustment & Insulator Wash',
      originalDuration: '03:00 Hrs',
      color: 'border-purple-500/50 text-purple-400 bg-purple-950/40',
      icon: Zap
    },
    {
      id: 'ST',
      name: 'S&T (Signalling)',
      task: 'Point Machine 104B Calibration & Axle Counter Check',
      originalDuration: '02:30 Hrs',
      color: 'border-amber-500/50 text-amber-400 bg-amber-950/40',
      icon: Activity
    }
  ];

  return (
    <div id="dept-coordination-section" className="rounded-2xl border border-[#1A2744] bg-[#0C1422] p-5 sm:p-6 shadow-xl relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base sm:text-lg font-mono">
                MULTI-DEPARTMENT COORDINATION & SHADOW BUNDLING
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                AI CO-OPTIMIZED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bundling Engineering, TRD, and Signalling requisitions into a single traffic possession
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToPlanning && onNavigateToPlanning()}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white text-xs font-mono font-bold shadow-md flex items-center gap-1.5 transition-all border border-red-500/30"
          >
            <span>Plan Bundled Block</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Coordination Diagram */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: 3 Departments Individual Requests (Col 5) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider mb-2">
            1. INDIVIDUAL DEPARTMENT REQUISITIONS:
          </div>

          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.id}
                className={`p-3.5 rounded-xl border ${dept.color} flex items-center justify-between gap-3 shadow-md relative`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{dept.name}</h4>
                    <p className="text-[10px] text-slate-300 font-mono mt-0.5">{dept.task}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 font-mono">
                  <span className="text-[10px] text-slate-400 block">REQ DURATION</span>
                  <span className="text-xs font-bold text-slate-200">{dept.originalDuration}</span>
                </div>
              </div>
            );
          })}

          <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-[11px] font-mono text-red-300 flex items-center justify-between">
            <span>Cumulative Unbundled Track Possession:</span>
            <strong className="text-white text-xs">9.0 Hours Total</strong>
          </div>
        </div>

        {/* Center: Bundling Arrow & Engine (Col 2) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 lg:py-0 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-950 border border-indigo-400/50 flex items-center justify-center text-amber-300 shadow-xl mb-2 animate-pulse">
            <GitMerge className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
            PRAGATI MILP
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            Temporal & Spatial Alignment
          </span>
          <div className="hidden lg:block w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-3" />
        </div>

        {/* Right: The Single Coordinated Block Output (Col 5) */}
        <div className="lg:col-span-5">
          <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider mb-2">
            2. RESULTING INTEGRATED POSSESSION (ONE BLOCK):
          </div>

          <div className="p-5 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-950/30 via-[#0A1526] to-[#070D18] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-white">ONE INTEGRATED MEGA-BLOCK</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                ALJN-TDL (KM 160-185)
              </span>
            </div>

            {/* Metric Comparison */}
            <div className="my-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">CORRIDOR SAVING</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">60%</span>
                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">5.5 HRS DOWNTIME REDUCED</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/30">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">COORDINATION</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">3 DEPTS</span>
                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">ZERO CONFLICT POINT</span>
              </div>
            </div>

            {/* Execution Slot */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Coordinated Window:</span>
                <strong className="text-amber-300">01:30 - 05:00 IST (3.5 Hrs)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Affected Coaching Trains:</span>
                <span className="text-emerald-400 font-bold">0 Trains Cancelled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Freight Routing:</span>
                <span className="text-slate-300">Regulated to 3rd Line Loop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
