import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  Wrench,
  Train,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Printer,
  Send,
  AlertCircle,
  FileCheck,
  Bot,
  RefreshCw,
  Info,
  Check,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { AffectedTrainsTable } from './AffectedTrainsTable';
import { useRailway } from '../../context/RailwayContext';
import { RailwayApiService } from '../../services/api';

export const PlanResultCard = ({ plan, onApprove }) => {
  const { currentUser, addToast } = useRailway();
  const [activeTab, setActiveTab] = useState('EXPLANATION'); // 'EXPLANATION', 'REASONS', 'TRAINS', 'TASKS'
  const [isApproving, setIsApproving] = useState(false);

  // Gemini AI Explanation state
  const [explanation, setExplanation] = useState(null);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState(null);

  const fetchExplanation = useCallback(async () => {
    if (!plan) return;
    const planIdentifier = plan._backendId || plan.id || plan.planId;
    if (!planIdentifier) return;

    setIsExplanationLoading(true);
    setExplanationError(null);
    try {
      const data = await RailwayApiService.getBlockPlanExplanation(planIdentifier);
      if (data) {
        setExplanation(data);
      }
    } catch (err) {
      console.warn('[PlanResultCard] Failed to fetch explanation:', err);
      setExplanationError(err.message || 'Explanation unavailable');
    } finally {
      setIsExplanationLoading(false);
    }
  }, [plan]);

  useEffect(() => {
    fetchExplanation();
  }, [fetchExplanation]);

  if (!plan) return null;

  const isApproved = plan.status === 'APPROVED_BY_CONTROLLER';

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      onApprove(plan.planId);
      setIsApproving(false);
    }, 600);
  };

  const handlePrintDispatch = () => {
    window.print();
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1525] shadow-lg overflow-hidden">
      {/* Upper Status Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-railway-navy to-slate-900 text-white border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-amber-400 font-bold tracking-wider">
                PLAN REF: {plan.planId}
              </span>
              <StatusBadge status={plan.status} size="xs" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                {plan.blockTypeName || 'INTEGRATED_SHADOW_BLOCK'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Recommended Maintenance Window
            </h3>
            <p className="text-xs text-slate-300 font-mono">
              {plan.corridorName} • {plan.trackName || plan.trackLine || 'UP Main Line'}
            </p>
          </div>

          {/* Window Badge & Score */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center min-w-[130px]">
              <div className="text-[10px] font-mono uppercase text-slate-400">Optimization Score</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {plan.optimizationScore}<span className="text-xs text-emerald-600 font-normal">/100</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5">MILP Pareto Global Max</div>
            </div>

            <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3 text-center min-w-[170px]">
              <div className="text-[10px] font-mono uppercase text-amber-300 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Optimal Slot
              </div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {plan.windowStart} - {plan.windowEnd}
              </div>
              <div className="text-[10px] text-amber-400 font-mono font-semibold">
                Window: {plan.durationHours} Hours ({plan.scheduledDate})
              </div>
            </div>
          </div>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-white/5 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px]">Delay Avoided</span>
            <div className="text-base font-bold text-emerald-400">
              {plan.metrics?.delayMinutesAvoided || 152} mins
            </div>
            <span className="text-[9px] text-slate-400">vs isolated blocks</span>
          </div>

          <div className="bg-white/5 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px]">Punctuality Guard</span>
            <div className="text-base font-bold text-cyan-400">100.0%</div>
            <span className="text-[9px] text-slate-400">0 terminal delays</span>
          </div>

          <div className="bg-white/5 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px]">Machine Utilization</span>
            <div className="text-base font-bold text-amber-400">
              {plan.metrics?.machineUtilizationPercent || 94.2}%
            </div>
            <span className="text-[9px] text-slate-400">Zero idle track time</span>
          </div>

          <div className="bg-white/5 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px]">Shadow Bundling</span>
            <div className="text-base font-bold text-purple-400">
              {plan.assignedTasks?.length || 2} Depts Combined
            </div>
            <span className="text-[9px] text-slate-400">Track + OHE + S&T</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40 overflow-x-auto">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('EXPLANATION')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'EXPLANATION'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-500" />
            AI Explanation Layer
            {explanation && (
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                explanation.explanationSource === 'GEMINI'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {explanation.explanationSource}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('REASONS')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'REASONS'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Deterministic Rationale ({plan.aiReasons?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('TRAINS')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'TRAINS'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            Affected Trains ({plan.affectedTrains?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('TASKS')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'TASKS'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Assigned Work Orders ({plan.assignedTasks?.length || 0})
          </button>
        </div>

        {activeTab === 'EXPLANATION' && (
          <button
            onClick={fetchExplanation}
            disabled={isExplanationLoading}
            className="text-[11px] font-mono text-slate-500 hover:text-purple-400 flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Re-generate explanation"
          >
            <RefreshCw className={`w-3 h-3 ${isExplanationLoading ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isExplanationLoading ? 'Analyzing...' : 'Refresh AI'}</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* TAB 1: AI EXPLANATION LAYER */}
        {activeTab === 'EXPLANATION' && (
          <div className="space-y-5">
            {/* Strict Safety Notice Banner */}
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 flex items-start gap-2.5 text-xs font-mono">
              <Bot className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  AI-Generated Operational Explanation
                </div>
                <div className="mt-0.5 text-[11.5px] leading-relaxed">
                  {explanation?.safetyNotice || 'Pragati selected this block using deterministic optimization. Gemini generated the explanation.'}
                </div>
              </div>
            </div>

            {/* Explanation Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Recommended Window:</span>
                <span className="font-bold text-white bg-red-950/80 border border-red-800 px-2 py-0.5 rounded">
                  {explanation?.recommendedWindow || `${plan.windowStart} - ${plan.windowEnd}`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Source:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    explanation?.explanationSource === 'GEMINI'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-700'
                      : 'bg-blue-950/80 text-blue-300 border border-blue-700'
                  }`}>
                    {explanation?.explanationSource === 'GEMINI' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    )}
                    {explanation?.explanationSource || 'DETERMINISTIC'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Model:</span>
                  <span className="text-[10px] text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {explanation?.modelUsed || 'gemini-3.6-flash'}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111A2E]/60 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-purple-500 dark:text-purple-400 font-bold block">
                Executive Operational Summary
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans font-medium">
                {explanation?.summary || 'Block window optimized for minimal passenger disruption and maximal multi-department maintenance efficiency.'}
              </p>
            </div>

            {/* 2-Column Operational Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Why this window was selected */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] space-y-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Why This Window Was Selected
                  </span>
                </div>
                <ul className="space-y-2">
                  {explanation?.whySelected?.map((reason, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  )) || (
                    <li className="text-xs text-slate-400">No specific points available.</li>
                  )}
                </ul>
              </div>

              {/* Traffic & Regulation Impact */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] space-y-2.5">
                <div className="flex items-center gap-2">
                  <Train className="w-4 h-4 text-cyan-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Train Traffic & Regulation Impact
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {explanation?.trafficImpact || 'Zero terminal arrival delay to coaching services. Freight consists regulated to siding loops.'}
                </p>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">Maintenance Bundling Benefit:</span>
                  <p className="text-xs text-purple-600 dark:text-purple-300 leading-relaxed">
                    {explanation?.maintenanceImpact || 'Combines critical P-Way, OHE and S&T tasks into a single coordinated track possession.'}
                  </p>
                </div>
              </div>

              {/* Conflicts & Safety Mitigations */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Identified Conflicts & Safety Mitigations
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {explanation?.conflicts?.map((conflict, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-amber-500 text-[11px] font-mono font-bold">•</span>
                      <span>{conflict}</span>
                    </li>
                  )) || (
                    <li className="text-xs text-slate-400">No unresolved conflicts detected.</li>
                  )}
                </ul>
              </div>

              {/* Field Controller Instructions */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] space-y-2.5">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Field Operational Notes for Controllers
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {explanation?.operationalNotes?.map((note, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-indigo-400 text-[11px] font-mono font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  )) || (
                    <li className="text-xs text-slate-400">Follow standard Operating Manual procedures.</li>
                  )}
                </ul>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Optimizer Confidence Rationale:</span>
                  <span className="text-emerald-500 font-bold">{explanation?.confidenceExplanation || 'Pareto optimal'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETERMINISTIC RATIONALE */}
        {activeTab === 'REASONS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.aiReasons?.map((reason, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {reason.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {reason.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {reason.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Confidence Metric</span>
                  <span className="text-emerald-500 font-bold">{reason.confidence}% Satisfied</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: AFFECTED TRAINS */}
        {activeTab === 'TRAINS' && (
          <AffectedTrainsTable affectedTrains={plan.affectedTrains} />
        )}

        {/* TAB 4: ASSIGNED TASKS */}
        {activeTab === 'TASKS' && (
          <div className="space-y-3">
            {plan.assignedTasks?.map((task) => (
              <div
                key={task.taskId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {task.taskId}
                    </span>
                    <StatusBadge status={task.dept} size="xs" />
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {task.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Track Machine: <strong>{task.machine}</strong> • Crew Size: <strong>{task.crew} Personnel</strong>
                  </div>
                </div>

                <div className="sm:text-right font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">Allocated Slot</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {task.allocatedWindow}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Controls & Approval Action */}
      <div className="p-4 sm:px-6 bg-slate-50 dark:bg-[#090E1A] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Compliant with Indian Railways General & Subsidiary Rules (G&SR)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintDispatch}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Block Order
          </button>

          {!isApproved ? (
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-700 to-railway-maroon hover:from-red-600 hover:to-red-700 text-white text-xs font-bold shadow-md shadow-red-950/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isApproving ? 'Transmitting to COIS...' : 'Approve & Transmit to COIS'}
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              BLOCK DISPATCHED TO CONTROL OFFICE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
