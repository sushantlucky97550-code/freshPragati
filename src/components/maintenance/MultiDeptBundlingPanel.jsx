import React, { useState } from 'react';
import {
  Layers,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Wrench,
  Activity
} from 'lucide-react';
import { useRailway } from '../../context/RailwayContext';
import { StatusBadge } from '../common/StatusBadge';

/**
 * Computes multi-department overlapping corridor clusters and automatic priority rankings.
 * Analyzes P-Way, TRD (OHE), and S&T tasks sharing the same railway block section / corridor.
 */
export function computeOverlappingBundles(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  // Group by common corridor and approximate section/station
  const clusters = {};

  tasks.forEach((task) => {
    const rawSection = (task.section || task.location || 'Main Section').toUpperCase();
    const corridor = task.corridorName || task.corridorId || 'Corridor';
    
    // Extract key anchor (e.g., ALJN, TDL, GZB, ETW, CNB, ST, GAYA)
    let groupKey = 'GENERAL';
    if (rawSection.includes('ALJN') || rawSection.includes('16') || rawSection.includes('138')) {
      groupKey = 'ALJN - TDL Section (Km 138-170)';
    } else if (rawSection.includes('TDL') || rawSection.includes('20')) {
      groupKey = 'TDL - Tundla Outer Yard (Km 200-205)';
    } else if (rawSection.includes('GZB') || rawSection.includes('GHAZIABAD')) {
      groupKey = 'GZB - Ghaziabad Yard & Interlocking';
    } else if (rawSection.includes('ETW') || rawSection.includes('CNB')) {
      groupKey = 'ETW - CNB Main Trunk Line';
    } else {
      groupKey = `${corridor} • Interlocking Zone`;
    }

    if (!clusters[groupKey]) {
      clusters[groupKey] = [];
    }
    clusters[groupKey].push(task);
  });

  // Calculate automatic bundle priority and time savings
  return Object.entries(clusters).map(([sectionName, clusterTasks], idx) => {
    // Unique departments involved
    const deptCodes = Array.from(new Set(clusterTasks.map(t => t.departmentCode || t.department || 'PWAY')));
    
    // Calculate isolated vs bundled time
    const individualHours = clusterTasks.reduce((sum, t) => {
      const h = parseFloat(t.requiredWindowHours || (t.durationMinutes ? t.durationMinutes / 60 : 2.5));
      return sum + h;
    }, 0);

    // Bundled simultaneous window needed: max individual duration + 30m buffer
    const maxSingle = Math.max(...clusterTasks.map(t => parseFloat(t.requiredWindowHours || (t.durationMinutes ? t.durationMinutes / 60 : 2.5))), 1.5);
    const bundledHours = parseFloat((maxSingle + 0.5).toFixed(1));
    const savedHours = Math.max(0, parseFloat((individualHours - bundledHours).toFixed(1)));

    // Auto Priority calculation: higher for multi-department, critical tasks, power blocks
    let score = 70;
    if (deptCodes.length >= 3) score += 20;
    else if (deptCodes.length >= 2) score += 12;
    
    const hasCritical = clusterTasks.some(t => t.priority === 'CRITICAL' || t.priority === 'EMERGENCY' || t.priority === 'URGENT');
    if (hasCritical) score += 10;

    const hasPowerBlock = clusterTasks.some(t => t.powerBlockRequired);
    if (hasPowerBlock) score += 5;

    score = Math.min(score, 99);

    let priorityLevel = 'HIGH';
    if (score >= 90) priorityLevel = 'CRITICAL';
    else if (score >= 75) priorityLevel = 'HIGH';
    else priorityLevel = 'MEDIUM';

    return {
      id: `BUNDLE-NCR-00${idx + 1}`,
      title: `${deptCodes.join(' + ')} Multi-Department Shadow Block`,
      sectionName,
      departmentCodes: deptCodes,
      tasks: clusterTasks,
      individualHours: parseFloat(individualHours.toFixed(1)),
      bundledHours,
      savedHours,
      priorityLevel,
      priorityScore: score,
      requiresPowerBlock: hasPowerBlock,
      estimatedSpeedRecovery: '+15 km/h TSR lifting'
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

export const MultiDeptBundlingPanel = ({ onPlanBundle }) => {
  const { tasks, todayWorkTasks, addToTodayWork, removeFromTodayWork, currentUser, addToast } = useRailway();
  const [selectedBundleId, setSelectedBundleId] = useState(null);

  const bundles = computeOverlappingBundles(tasks);

  const handleAddBundleToTodayWork = (bundle, e) => {
    e.stopPropagation();
    let countAdded = 0;
    bundle.tasks.forEach(t => {
      const taskId = t.taskId || t.id;
      const alreadyIn = todayWorkTasks?.some(tw => (tw.taskId || tw.id) === taskId);
      if (!alreadyIn) {
        addToTodayWork(t);
        countAdded++;
      }
    });
    if (countAdded > 0) {
      addToast(`DOM Officer approved entire ${bundle.id} (${countAdded} multi-dept tasks) for Today's Work`, 'success');
    } else {
      addToast(`All tasks in ${bundle.id} are already queued in Today's Work`, 'info');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Multi-Department Overlapping Area Bundles & AI Priority
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 font-bold border border-red-500/20">
              AUTO-COMBINED
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Spatial-temporal clustering of P-Way, TRD (OHE 25kV), and S&T tasks sharing the same track block window.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
            {bundles.length} Overlapping Zones Identified
          </span>
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {bundles.map((bundle) => {
          const isSelected = selectedBundleId === bundle.id;
          const allTasksInTodayWork = bundle.tasks.every(t => 
            todayWorkTasks?.some(tw => (tw.taskId || tw.id) === (t.taskId || t.id))
          );

          return (
            <div
              key={bundle.id}
              onClick={() => setSelectedBundleId(isSelected ? null : bundle.id)}
              className={`rounded-xl border p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 shadow-md ring-1 ring-red-500/50'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#111A2D]'
              }`}
            >
              {/* Bundle Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {bundle.id}
                    </span>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-600 text-white shadow-xs">
                      Priority Score: {bundle.priorityScore}/100
                    </span>
                    <StatusBadge status={bundle.priorityLevel} size="xs" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {bundle.sectionName}
                  </h4>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Saves {bundle.savedHours} hrs</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Window: {bundle.bundledHours}h vs {bundle.individualHours}h
                  </span>
                </div>
              </div>

              {/* Department Badges & Overlap Tag */}
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Combined Depts:
                </span>
                {bundle.departmentCodes.map((dCode) => {
                  const isPway = dCode === 'PWAY' || dCode === 'P_WAY';
                  const isTrd = dCode === 'TRD' || dCode === 'TRD_OHE';
                  const isSt = dCode === 'ST' || dCode === 'S_AND_T';
                  return (
                    <span
                      key={dCode}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        isPway
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                          : isTrd
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                          : isSt
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-slate-500/10 text-slate-600 border-slate-500/30'
                      }`}
                    >
                      {dCode}
                    </span>
                  );
                })}
                {bundle.requiresPowerBlock && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    25kV Power Block
                  </span>
                )}
              </div>

              {/* Tasks List within Bundle */}
              <div className="mt-3 space-y-1.5 border-t border-slate-200/60 dark:border-slate-800/80 pt-2.5">
                <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center justify-between">
                  <span>Included Requisitions ({bundle.tasks.length})</span>
                  <span className="text-slate-500">{bundle.estimatedSpeedRecovery}</span>
                </div>
                {bundle.tasks.map((t) => {
                  const tId = t.taskId || t.id;
                  const inToday = todayWorkTasks?.some(tw => (tw.taskId || tw.id) === tId);

                  return (
                    <div
                      key={tId}
                      className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-[#0B1322] text-[11px] border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {tId}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                          {t.title || t.taskType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-slate-500 font-bold">
                          {t.requiredWindowHours || 2.5}h
                        </span>
                        {inToday ? (
                          <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Queued
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToTodayWork(t);
                            }}
                            className="px-1.5 py-0.5 rounded bg-red-100 hover:bg-red-200 dark:bg-red-950/70 dark:hover:bg-red-900 text-red-700 dark:text-red-300 text-[9px] font-bold transition-colors"
                          >
                            + DOM Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => handleAddBundleToTodayWork(bundle, e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    allTasksInTodayWork
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {allTasksInTodayWork
                      ? '✓ DOM: Added to Today\'s Work'
                      : `DOM: Add Entire Bundle (${bundle.tasks.length} Tasks)`}
                  </span>
                </button>

                {onPlanBundle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlanBundle(bundle);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Simulate Block</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
