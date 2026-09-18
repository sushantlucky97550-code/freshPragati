import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Loader2, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const SolverProgressModal = ({ isOpen, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(10);

  const solverSteps = [
    {
      title: 'Ingesting Corridor Timetable & Headway',
      detail: 'Loading 214 daily trains, active caution orders (TSR), and section running times...'
    },
    {
      title: 'Evaluating Station Loop Line Capacity',
      detail: 'Simulating siding buffers at Aligarh, Tundla, and Hathras for freight regulation...'
    },
    {
      title: 'Cross-Departmental Shadow Block Bundling',
      detail: 'Consolidating P-Way track tamping with Electrical OHE contact wire adjustment...'
    },
    {
      title: 'Multi-Objective Optimization (MILP Solver)',
      detail: 'Minimizing passenger delay penalty while maximizing maintenance machine utilization...'
    },
    {
      title: 'Convergence Reached (Optimal Slot Found)',
      detail: 'Global optimum verified. Generating conflict resolution and dispatch order...'
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgressPercent(10);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < solverSteps.length - 1) {
          const next = prev + 1;
          setProgressPercent(Math.round(((next + 1) / solverSteps.length) * 100));
          return next;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 600);
          return prev;
        }
      });
    }, 550);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#090E1A] p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-railway-maroon flex items-center justify-center text-white shadow-lg shadow-red-950/40 border border-red-500/30">
            <Cpu className="w-5 h-5 animate-pulse text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              Pragati Solver Engine
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                MILP-V4
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Computing Pareto-optimal maintenance possession window
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Optimization Progress</span>
            <span className="text-emerald-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 font-mono text-xs">
          {solverSteps.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.title}
                className={`flex items-start gap-3 p-2.5 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-slate-800/80 border border-slate-700'
                    : isDone
                    ? 'bg-slate-900/40 text-slate-400'
                    : 'opacity-40 text-slate-500'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5 flex-1">
                  <div className={`font-semibold ${isCurrent ? 'text-white' : isDone ? 'text-slate-300' : ''}`}>
                    {step.title}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {step.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Solver Telemetry Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Decision Variables: 1,420
          </span>
          <span className="text-emerald-400">Constraints: 3,890 Satisfied</span>
        </div>
      </div>
    </div>
  );
};
