import React from 'react';
import { useRailway } from '../context/RailwayContext';
import {
  Lightbulb,
  Sparkles,
  Zap,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Fuel
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const RecommendationsPage = ({ onNavigateToPlanning }) => {
  const { recommendations, addToast } = useRailway();

  const handleAdopt = (rec) => {
    addToast(`Adopted recommendation: "${rec.title}"`, 'success');
    if (onNavigateToPlanning) {
      onNavigateToPlanning();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              AI Prescriptive Optimization Insights
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400">
              {recommendations.length} Actionable Insights
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Proactive recommendations detecting shadow block bundling, machine staging, and punctuality recovery
          </p>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec) => {
          const isEmergency = rec.severity === 'CRITICAL';
          const isShadow = rec.type === 'SHADOW_BLOCK_OPPORTUNITY';

          return (
            <div
              key={rec.id}
              className={`rounded-2xl border p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all ${
                isEmergency
                  ? 'border-red-500/50 bg-red-50/20 dark:bg-red-950/10'
                  : isShadow
                  ? 'border-sky-500/50 bg-sky-50/20 dark:bg-sky-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {rec.id}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      isEmergency
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                        : isShadow
                        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                    }`}
                  >
                    {rec.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {rec.title}
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Section: {rec.section}
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rec.description}
                </p>

                {/* Metrics Pill Grid */}
                <div className="mt-4 p-3 rounded-xl bg-slate-100/70 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  {Object.entries(rec.metrics || {}).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-400 block text-[9px] uppercase">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <strong className="text-slate-800 dark:text-slate-100">{String(v)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {rec.estimatedSavings}
                </span>

                <button
                  onClick={() => handleAdopt(rec)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-railway-maroon hover:from-red-600 hover:to-red-700 text-white text-xs font-bold shadow-md shadow-red-950/30 flex items-center gap-1.5 transition-all"
                >
                  <span>{rec.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
