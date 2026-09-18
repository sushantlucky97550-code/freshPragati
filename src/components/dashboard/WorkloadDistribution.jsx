import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { getDepartments } from '../../services/departmentService';
import { RailwayApiService } from '../../services/api';
import { useRailway } from '../../context/RailwayContext';

// Department color palette for visual hierarchy
const DEPARTMENT_COLORS = {
  PWAY: '#0284C7', // Sky blue
  TRD: '#8B5CF6',  // Purple
  ST: '#F59E0B',   // Amber
  MECH: '#10B981', // Emerald
  DEFAULT: '#6366F1'
};

export const WorkloadDistribution = () => {
  const [departments, setLocalDepartments] = useState([]);
  const [workloadSummary, setWorkloadSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Optional sync with global context if available
  const context = useRailway();
  const setGlobalDepartments = context?.setDepartments;

  const fetchDepartmentData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First try the comprehensive maintenance workload endpoint
      const workloadData = await RailwayApiService.getMaintenanceWorkload();
      if (workloadData && Array.isArray(workloadData.departments) && workloadData.departments.length > 0) {
        setWorkloadSummary(workloadData);
        setLocalDepartments(workloadData.departments);
        if (setGlobalDepartments) {
          setGlobalDepartments(workloadData.departments);
        }
        return;
      }

      // Fallback to department service
      const data = await getDepartments();
      const deptArray = Array.isArray(data) ? data : [];
      setLocalDepartments(deptArray);
      if (setGlobalDepartments) {
        setGlobalDepartments(deptArray);
      }
    } catch (err) {
      console.warn('[WorkloadDistribution] Falling back to department service:', err);
      try {
        const data = await getDepartments();
        const deptArray = Array.isArray(data) ? data : [];
        setLocalDepartments(deptArray);
      } catch (fallbackErr) {
        setError(fallbackErr.message || 'Unable to connect to backend service.');
      }
    } finally {
      setLoading(false);
    }
  }, [setGlobalDepartments]);

  useEffect(() => {
    fetchDepartmentData();
  }, [fetchDepartmentData]);

  // Total tasks across all departments
  const totalTasks = workloadSummary?.totalTasks != null
    ? workloadSummary.totalTasks
    : departments.reduce((acc, d) => acc + (d.taskCount || 0), 0);

  const totalHours = workloadSummary?.totalEstimatedHours != null
    ? `${workloadSummary.totalEstimatedHours}h Estimated`
    : null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            Departmental Maintenance Workload
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Dynamic task backlog & possession hours from PostgreSQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && !error && (
            <span className="text-xs font-mono text-slate-500">
              {totalTasks} Tasks Active {totalHours ? `• ${totalHours}` : ''}
            </span>
          )}
          <button
            onClick={fetchDepartmentData}
            disabled={loading}
            title="Refresh departments"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-4 space-y-3.5 py-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            <span>Loading workload from backend...</span>
          </div>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="space-y-1.5 animate-pulse">
              <div className="flex justify-between">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800/60 rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-4 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 text-center space-y-2.5">
          <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-red-800 dark:text-red-300">
              Failed to load departments
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-mono">
              {error}
            </p>
          </div>
          <button
            onClick={fetchDepartmentData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && departments.length === 0 && (
        <div className="mt-4 p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No departments found in the system.
          </p>
          <button
            onClick={fetchDepartmentData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loaded Department List */}
      {!loading && !error && departments.length > 0 && (
        <div className="mt-4 space-y-3.5">
          {departments.map((dept) => {
            const color = DEPARTMENT_COLORS[dept.code] || DEPARTMENT_COLORS.DEFAULT;
            const taskCount = dept.taskCount || 0;
            const percentage = dept.workloadPercent != null
              ? Math.round(dept.workloadPercent)
              : (totalTasks > 0 ? Math.round((taskCount / totalTasks) * 100) : 0);

            return (
              <div key={dept.id || dept.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {dept.name}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {dept.code}
                    </span>
                    {dept.status && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                          dept.status === 'ACTIVE'
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60'
                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {dept.status}
                      </span>
                    )}
                  </div>

                  <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0">
                    {percentage}% ({taskCount} {taskCount === 1 ? 'task' : 'tasks'}{dept.estimatedHours ? ` • ${dept.estimatedHours}h` : ''})
                  </span>
                </div>

                {dept.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 pl-4">
                    {dept.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(percentage, 4))}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
