import React, { useState, useEffect } from 'react';
import { useRailway } from '../../context/RailwayContext';
import { RailwayApiService } from '../../services/api';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  Cpu,
  Layers
} from 'lucide-react';

export const AiCommandPanel = ({ onNavigate }) => {
  const { tasks, blockPlans } = useRailway();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    RailwayApiService.getDashboardSummary()
      .then(data => { if (data) setSummary(data); })
      .catch(() => {});
  }, []);

  const aiScore = summary?.aiPriorityScore ?? 88.8;
  const aiLevel = summary?.aiPriorityLevel || 'CRITICAL';
  const aiAction = summary?.aiRecommendedAction || 'Immediate maintenance block recommended. Regulate conflicting freight to siding loops.';

  const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'EMERGENCY').length || 2;

  const checklist = [
    { text: '3 departments can be coordinated', checked: true },
    { text: 'Corridor window available (00:30 - 05:00 IST)', checked: true },
    { text: 'Freight regulation possible (3rd Line loop)', checked: true },
    { text: 'Critical asset involved (Turnout 102B & OHE Mast 164)', checked: true },
    { text: 'Train conflict detected (Grain Special regulated)', checked: true },
    { text: 'Estimated downtime reduction: 60%', checked: true },
  ];

  return (
    <div className="rounded-2xl border border-[#1A2744] bg-[#0C1422] p-5 sm:p-6 shadow-xl select-none relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-amber-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base sm:text-lg font-mono">
                AI OPERATIONS INTELLIGENCE
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800">
                AI PRIORITY ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Prescriptive corridor optimization, conflict resolution, and multi-department scheduling
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('ai-planning')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-xs font-mono font-bold shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 border border-red-500/40 transition-all group self-start sm:self-auto"
        >
          <Cpu className="w-4 h-4 text-amber-300" />
          <span>GENERATE AI BLOCK PLAN</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Content layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Score gauge (Col 4) */}
        <div className="lg:col-span-4 flex flex-col items-center p-6 rounded-2xl bg-[#09101D] border border-slate-800/80 text-center">
          <div className="relative w-32 h-32 mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1A2744" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#DC2626"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(aiScore / 100) * 264} 264`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-3xl font-black text-amber-300">{aiScore}</span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="inline-block text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-red-950/90 text-red-300 border border-red-800 uppercase tracking-wider">
              {aiLevel} PRIORITY
            </span>
            <p className="text-xs text-slate-400 font-medium mt-2">
              Immediate maintenance block recommended
            </p>
          </div>
        </div>

        {/* Action & checklist (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block mb-1">
              RECOMMENDED AI ACTION
            </span>
            <p className="text-sm font-semibold text-slate-200 leading-relaxed">
              "{aiAction}"
            </p>
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
