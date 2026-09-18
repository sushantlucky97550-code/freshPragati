import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { RailwayApiService } from '../services/api';
import {
  Cpu,
  Sparkles,
  Calendar,
  Clock,
  Wrench,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Layers,
  History,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { SolverProgressModal } from '../components/planning/SolverProgressModal';
import { PlanResultCard } from '../components/planning/PlanResultCard';
import { StatusBadge } from '../components/common/StatusBadge';

export const BlockPlanningPage = () => {
  const {
    selectedCorridor,
    selectedCorridorId,
    setSelectedCorridorId,
    corridors,
    tasks,
    blockPlans,
    approveBlockPlan,
    addGeneratedBlockPlan,
    addToast
  } = useRailway();

  // Planning Form State
  const [selectedTrack, setSelectedTrack] = useState(selectedCorridor.tracks[0]?.id || 'UP_MAIN');
  const [targetDate, setTargetDate] = useState('2026-09-12');
  const [targetShift, setTargetShift] = useState('NIGHT'); // NIGHT, MORNING, AFTERNOON
  const [departments, setDepartments] = useState(['P_WAY', 'TRD_OHE', 'S_AND_T']);
  const [selectedMachine, setSelectedMachine] = useState('CSM (09-32 Tamping Machine)');
  const [requiredWindowHours, setRequiredWindowHours] = useState(3.5);
  const [maxDelayTolerance, setMaxDelayTolerance] = useState(20);
  const [allowShadowBlocks, setAllowShadowBlocks] = useState(true);

  // Solver modal & results state
  const [isSolverRunning, setIsSolverRunning] = useState(false);
  const [activeResultPlan, setActiveResultPlan] = useState(blockPlans[0] || null);

  const availableMachines = [
    'CSM (09-32 Tamping Machine)',
    'BCM (Ballast Cleaning Machine)',
    'UNIMAT 08-4S (Point Tamping)',
    '4-Wheeler OHE Tower Wagon',
    'PQRS (Portal Crane Track Relaying)'
  ];

  const handleDepartmentToggle = (dept) => {
    if (departments.includes(dept)) {
      if (departments.length > 1) {
        setDepartments(departments.filter(d => d !== dept));
      } else {
        addToast('At least one department must be selected', 'error');
      }
    } else {
      setDepartments([...departments, dept]);
    }
  };

  const handleGeneratePlan = () => {
    setIsSolverRunning(true);
  };

  const handleSolverComplete = async () => {
    setIsSolverRunning(false);
    try {
      const generatedPlan = await RailwayApiService.generateAiBlockPlan({
        corridor: selectedCorridor,
        trackLine: selectedTrack,
        date: targetDate,
        targetShift: targetShift,
        departments: departments,
        allowShadowBlocks: allowShadowBlocks,
        maxDelayToleranceMinutes: maxDelayTolerance,
        selectedMachine: selectedMachine,
        requiredWindowHours: requiredWindowHours,
        tasks: tasks
      });

      setActiveResultPlan(generatedPlan);
      addGeneratedBlockPlan(generatedPlan);
    } catch (err) {
      addToast('Error solving block plan: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-railway-navy to-slate-900 text-white p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>INDIAN RAILWAYS AUTOMATIC BLOCK OPTIMIZER</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              AI-Powered Automatic Block Planning
            </h1>
            <p className="text-xs text-slate-300 font-mono">
              Constraint satisfaction solver balancing track maintenance possession against coaching & freight punctuality
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            MILP Mathematical Solver Online
          </div>
        </div>
      </div>

      {/* Main Grid: Control Parameters vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Constraints & Parameters Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600 dark:text-red-400" />
                Block Optimization Parameters
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Step 1 of 2</span>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Corridor Selection */}
              <div>
                <label className="font-mono font-bold uppercase text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Corridor Section
                </label>
                <select
                  value={selectedCorridorId}
                  onChange={(e) => setSelectedCorridorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {corridors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Track Line */}
              <div>
                <label className="font-mono font-bold uppercase text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Target Track Line
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedCorridor.tracks.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setSelectedTrack(track.id)}
                      className={`p-2 rounded-xl border text-center font-mono font-semibold text-[11px] transition-all ${
                        selectedTrack === track.id
                          ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111A2E] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {track.name.split(' ')[0]} {track.direction}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Shift Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold uppercase text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold uppercase text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Shift Window
                  </label>
                  <select
                    value={targetShift}
                    onChange={(e) => setTargetShift(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="NIGHT">Night Valley (00-08)</option>
                    <option value="MORNING">Day Slack (08-14)</option>
                    <option value="AFTERNOON">Afternoon (13-17)</option>
                  </select>
                </div>
              </div>

              {/* Maintenance Departments */}
              <div>
                <label className="font-mono font-bold uppercase text-[11px] text-slate-500 dark:text-slate-400 block mb-1.5">
                  Departments Included
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'P_WAY', label: 'P-Way Track', color: 'blue' },
                    { id: 'TRD_OHE', label: 'TRD / OHE', color: 'purple' },
                    { id: 'S_AND_T', label: 'S&T Signals', color: 'amber' }
                  ].map((dept) => {
                    const isSelected = departments.includes(dept.id);
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => handleDepartmentToggle(dept.id)}
                        className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111A2E] text-slate-500'
                        }`}
                      >
                        {dept.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Machine Constraint */}
              <div>
                <label className="font-mono font-bold uppercase text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Primary Track Machine
                </label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {availableMachines.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sliders: Duration & Delay Tolerance */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold uppercase text-[11px] text-slate-500 dark:text-slate-400">
                      Required Window Duration
                    </span>
                    <span className="font-mono font-bold text-red-600 dark:text-red-400 text-xs">
                      {requiredWindowHours} Hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="5.0"
                    step="0.5"
                    value={requiredWindowHours}
                    onChange={(e) => setRequiredWindowHours(parseFloat(e.target.value))}
                    className="w-full accent-red-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>1.5 hrs (Quick)</span>
                    <span>3.5 hrs (Standard)</span>
                    <span>5.0 hrs (Mega Block)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold uppercase text-[11px] text-slate-500 dark:text-slate-400">
                      Max Permissible Passenger Delay
                    </span>
                    <span className="font-mono font-bold text-amber-500 text-xs">
                      {maxDelayTolerance} Minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="5"
                    value={maxDelayTolerance}
                    onChange={(e) => setMaxDelayTolerance(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>5 mins (Strict)</span>
                    <span>20 mins (Balanced)</span>
                    <span>45 mins (Permissive)</span>
                  </div>
                </div>
              </div>

              {/* Shadow Block Toggle */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Multi-Department Shadow Bundling
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Combine OHE & S&T work in single track possession
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowShadowBlocks}
                    onChange={(e) => setAllowShadowBlocks(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Generate Action Button */}
              <button
                type="button"
                onClick={handleGeneratePlan}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-railway-maroon to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm shadow-xl shadow-red-950/40 flex items-center justify-center gap-2.5 transition-all group"
              >
                <Cpu className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>Generate AI Block Plan</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

          {/* Historical / Saved Plans List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Recent AI Block Plans for Section
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {blockPlans.length} Generated
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {blockPlans.map((plan) => (
                <button
                  key={plan.planId}
                  onClick={() => setActiveResultPlan(plan)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    activeResultPlan?.planId === plan.planId
                      ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div>
                    <div className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                      {plan.planId}
                      <StatusBadge status={plan.status} size="xs" />
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {plan.windowStart} - {plan.windowEnd} ({plan.scheduledDate})
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-emerald-500 font-bold text-sm block">
                      {plan.optimizationScore}%
                    </span>
                    <span className="text-[9px] text-slate-400">Score</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Plan Results Display (7 Cols) */}
        <div className="lg:col-span-7">
          {activeResultPlan ? (
            <PlanResultCard
              plan={activeResultPlan}
              onApprove={approveBlockPlan}
            />
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0D1525]/40 text-center">
              <Cpu className="w-12 h-12 text-slate-400 mb-3 animate-pulse" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No Block Plan Selected
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Configure your maintenance constraints on the left and click "Generate AI Block Plan" to run the mathematical solver.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Animated Solver Progress Modal */}
      <SolverProgressModal
        isOpen={isSolverRunning}
        onComplete={handleSolverComplete}
      />
    </div>
  );
};
