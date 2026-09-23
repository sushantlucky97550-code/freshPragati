import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  GitMerge,
  ShieldCheck,
  CheckSquare,
  Square,
  AlertTriangle,
  Clock,
  MapPin,
  Train,
  ArrowRight,
  Info,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Activity,
  Wrench,
  CheckCircle2,
  TrendingDown,
  Users,
  Flame,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { useRailway } from '../../context/RailwayContext';
import { analyzeCombinedDepartments } from '../../services/aiSpatialTemporalEngine';

export const AiCombinedPriorityQueue = ({ onAddSelectedToToday }) => {
  const { tasks, currentZone, currentDivision } = useRailway();
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [expandedBundleIds, setExpandedBundleIds] = useState({});
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'COMBINED_ONLY' | 'STANDALONE_ONLY'
  const [activeDepartmentFilter, setActiveDepartmentFilter] = useState('ALL');

  // Run AI Spatial-Temporal Overlap Engine dynamically whenever tasks change
  const { combinedBundles, standaloneTasks } = useMemo(() => {
    return analyzeCombinedDepartments(tasks);
  }, [tasks]);

  const toggleExpand = (bundleId) => {
    setExpandedBundleIds(prev => ({
      ...prev,
      [bundleId]: !prev[bundleId]
    }));
  };

  const toggleSelectBundle = (bundle) => {
    const bTaskIds = bundle.taskIds;
    setSelectedTaskIds(prev => {
      const allSelected = bTaskIds.every(id => prev.includes(id));
      if (allSelected) {
        // Deselect all
        return prev.filter(id => !bTaskIds.includes(id));
      } else {
        // Select all
        const set = new Set([...prev, ...bTaskIds]);
        return Array.from(set);
      }
    });
  };

  const toggleSelectStandalone = (taskId) => {
    setSelectedTaskIds(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const isBundleFullySelected = (bundle) => {
    return bundle.taskIds.every(id => selectedTaskIds.includes(id));
  };

  const handleAuthorizeSingleBundle = (bundle) => {
    if (onAddSelectedToToday) {
      onAddSelectedToToday(bundle.taskIds);
    }
  };

  const handleAddBatchToToday = () => {
    if (selectedTaskIds.length > 0 && onAddSelectedToToday) {
      onAddSelectedToToday(selectedTaskIds);
    }
  };

  return (
    <div className="space-y-5 relative select-none font-sans">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. AI ENGINE STATUS & LIVE BUNDLING BANNER                */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#071120] via-[#0B1A33] to-[#071120] border border-cyan-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-950 border border-cyan-400/50 flex items-center justify-center text-white shadow-lg shadow-cyan-950/60 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-mono tracking-tight text-white flex items-center gap-2">
                  <span>AI SPATIAL & TEMPORAL JOINT BLOCK ENGINE</span>
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME CO-LOCATION ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Automatically monitors geographical overlaps (identical corridor & KM markers) and timing needs across Engineering (P-Way), S&T, and TRD.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto font-mono text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-slate-800 text-slate-300 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              <span>
                <strong className="text-emerald-400">{combinedBundles.length}</strong> Joint Multi-Dept Blocks
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-slate-800 text-slate-400">
              <span>SCOPE: {currentZone} • {currentDivision.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Live Notification Bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-cyan-300">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse flex-shrink-0" />
            <span>
              <strong>Spatial-Temporal Logic:</strong> Tasks on identical corridor sections within ±5 KM and compatible window are unified into single traffic possessions.
            </span>
          </div>
          <div className="text-[11px] text-amber-300/90 font-semibold">
            ⚡ G&SR Appendix-A Approved Co-Location
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. SECTION: COMBINED DEPARTMENTS (WHO CAN WORK TOGETHER)  */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-200 uppercase">
              Combined Departments Who Can Work Together ({combinedBundles.length} Joint Opportunities)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold hidden sm:inline">
            Single Possession • Multi-Department Execution
          </span>
        </div>

        {combinedBundles.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#080E1A] border border-slate-800 text-center font-mono">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm text-slate-300 font-bold">No Overlapping Maintenance Requisitions Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Use the "OPEN MAINTENANCE ENTRY" buttons above to submit Engineering, S&T, or TRD requisitions.
              When entries share section/KM coordinates, AI will automatically generate joint blocks here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {combinedBundles.map((bundle, bIdx) => {
              const isSelected = isBundleFullySelected(bundle);
              const isExpanded = expandedBundleIds[bundle.id] ?? true; // expanded by default to show details

              return (
                <div
                  key={bundle.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl ${
                    isSelected
                      ? 'border-cyan-400 bg-[#0C162A] ring-1 ring-cyan-500/50 shadow-cyan-950/50'
                      : 'border-slate-800 bg-[#080E1C] hover:border-slate-700'
                  }`}
                >
                  {/* Top Joint Opportunity Banner */}
                  <div className="px-5 py-2.5 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-bold text-cyan-300 uppercase tracking-wider">
                        ★ {bundle.departments.length}-DEPARTMENT SYNCHRONIZED BLOCK
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{bundle.bundleId}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold">
                        {bundle.synergyScore}/100 AI CO-LOCATION SYNERGY
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-bold flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-amber-400" />
                        SAVES {bundle.savedHours}h LINE CLOSURE
                      </span>
                    </div>
                  </div>

                  {/* Main Bundle Card Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Checkbox + Department Badges + Geographical Overlap */}
                      <div className="flex items-start gap-3.5 flex-1">
                        {/* Bundle Select Checkbox */}
                        <button
                          onClick={() => toggleSelectBundle(bundle)}
                          className="mt-1 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-mono text-xs flex-shrink-0"
                          title="Select entire combined block for Today's Work"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-cyan-400 fill-cyan-950" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500" />
                          )}
                          <span className="hidden sm:inline font-bold">
                            {isSelected ? 'SELECTED' : 'SELECT'}
                          </span>
                        </button>

                        <div className="space-y-2 flex-1 min-w-0">
                          {/* Combined Departments Headline Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                              Combined Departments:
                            </span>
                            {bundle.departments.map((d, dIdx) => (
                              <span
                                key={dIdx}
                                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border flex items-center gap-1.5 ${d.badgeClass}`}
                              >
                                {d.code === 'P_WAY' && <Wrench className="w-3.5 h-3.5 text-amber-400" />}
                                {d.code === 'ST' && <Activity className="w-3.5 h-3.5 text-sky-400" />}
                                {d.code === 'TRD' && <Zap className="w-3.5 h-3.5 text-purple-400" />}
                                <span>{d.name}</span>
                              </span>
                            ))}
                          </div>

                          {/* Geographical Overlap Strip */}
                          <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-white">
                            <span className="px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-700/60 text-cyan-300 font-bold flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{bundle.locationSummary}</span>
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              Shared Track Zone: Km {bundle.minKm} to {bundle.maxKm}
                            </span>
                          </div>

                          {/* AI Explanation Callout */}
                          <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2">
                            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-cyan-300">AI Co-Location Insight:</strong> {bundle.aiExplanation}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Timing Metrics & Direct Action */}
                      <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-start lg:items-end gap-3 font-mono text-xs flex-shrink-0">
                        {/* Timing Comparison Tile */}
                        <div className="p-3 rounded-xl bg-black/50 border border-slate-800 w-full sm:w-auto text-left lg:text-right space-y-1">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                            SYNCHRONIZED POSSESSION
                          </div>
                          <div className="text-base font-black text-amber-300">
                            {bundle.unifiedHours} Hours <span className="text-xs text-slate-400 font-normal">({bundle.recommendedWindow})</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Separate individual blocks: <span className="line-through text-red-400">{bundle.sumHours} Hours</span>
                          </div>
                        </div>

                        {/* Direct DOM Action Button */}
                        <button
                          onClick={() => handleAuthorizeSingleBundle(bundle)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 border border-red-500/50 transition-all hover:scale-[1.02]"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-300" />
                          <span>AUTHORIZE COMBINED BLOCK</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expand/Collapse Toggle for Included Works */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => toggleExpand(bundle.id)}
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 py-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>
                          {isExpanded ? 'Hide' : 'View'} {bundle.tasksCount} Departmental Tasks Included in this Joint Block
                        </span>
                      </button>

                      {/* Included Department Tasks Breakdown */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2.5">
                          {bundle.tasks.map((task, tIdx) => {
                            const d = bundle.departments.find(dept => {
                              const deptUpper = (task.department || '').toUpperCase();
                              return deptUpper.includes(dept.code);
                            }) || bundle.departments[tIdx % bundle.departments.length];

                            return (
                              <div
                                key={task.taskId || task.id || tIdx}
                                className="p-3 rounded-xl bg-[#050A14] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                              >
                                <div className="flex items-start sm:items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 text-[11px] font-bold">
                                    #{tIdx + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${d.badgeClass}`}>
                                        {d.short}
                                      </span>
                                      <span className="font-bold text-white">
                                        {task.title || task.workDescription}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        ({task.taskId || task.id})
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      📍 {task.location || task.section} • Track: {task.track || 'UP_MAIN'} • Machine: {task.machineRequired || task.specialEquipment || 'Standard Department Tools'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto text-[11px] text-slate-400 flex-shrink-0">
                                  <span>Duration: <strong>{(Number(task.estimatedDurationMinutes || task.durationMinutes || 120) / 60).toFixed(1)}h</strong></span>
                                  <span className="px-2 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-800/50 font-bold">
                                    {task.criticality || task.priority || 'HIGH'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. SECTION: STANDALONE DEPARTMENT REQUISITIONS             */}
      {/* ────────────────────────────────────────────────────────── */}
      {standaloneTasks.length > 0 && (
        <div className="mt-8 space-y-3 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                Standalone Department Requisitions ({standaloneTasks.length} Awaiting Co-Location)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              No overlapping counterpart in identical section currently
            </span>
          </div>

          <div className="space-y-2.5">
            {standaloneTasks.map((item) => {
              const checked = selectedTaskIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all duration-150 bg-[#070D18] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs ${
                    checked ? 'border-cyan-400 bg-[#0B1528]' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => toggleSelectStandalone(item.id)}
                      className="mt-0.5 sm:mt-0 p-0.5 text-slate-500 hover:text-cyan-400"
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${item.department.badgeClass}`}>
                          {item.department.short}
                        </span>
                        <span className="font-bold text-slate-200">{item.title}</span>
                        <span className="text-[10px] text-slate-500">({item.id})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        📍 {item.locationSummary} • Individual Duration: {item.durationHours}h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                      {item.criticality}
                    </span>
                    <button
                      onClick={() => onAddSelectedToToday && onAddSelectedToToday([item.id])}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-bold"
                    >
                      Add Single
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. STICKY BOTTOM ACTION BAR FOR DOM SELECTION             */}
      {/* ────────────────────────────────────────────────────────── */}
      {selectedTaskIds.length > 0 && (
        <div className="sticky bottom-6 z-40 p-4 rounded-2xl bg-[#070D18]/95 border-2 border-cyan-500/80 shadow-2xl shadow-cyan-950/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/60 text-cyan-400 flex items-center justify-center font-bold text-lg">
              {selectedTaskIds.length}
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                {selectedTaskIds.length} REQUISITION{selectedTaskIds.length > 1 ? 'S' : ''} SELECTED BY DOM
              </div>
              <div className="text-[11px] text-slate-400">
                Ready for Divisional Operations Manager authorization and addition to Today's Maintenance Work.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTaskIds([])}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              Clear Selection
            </button>
            <button
              onClick={handleAddBatchToToday}
              className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 border border-red-500/40"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>AUTHORIZE SELECTED FOR TODAY'S WORK</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
