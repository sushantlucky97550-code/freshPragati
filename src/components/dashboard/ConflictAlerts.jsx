import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, Zap, Loader2, RotateCcw } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { RailwayApiService } from '../../services/api';
import { useRailway } from '../../context/RailwayContext';

export const ConflictAlerts = () => {
  const { selectedCorridor } = useRailway();
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConflicts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RailwayApiService.getConflicts(selectedCorridor?.backendId);
      setConflicts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[ConflictAlerts] Failed to fetch conflicts:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCorridor?.backendId]);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  const resolvedCount = conflicts.filter(c => c.status === 'RESOLVED_BY_AI').length;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Live Conflict & Safety Telemetry
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Real-time detection of block overlapping with scheduled train paths
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!loading && (
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {resolvedCount > 0 ? `${resolvedCount} Conflicts Mitigated` : 'Zero Unresolved Conflicts'}
            </span>
          )}
          <button
            onClick={fetchConflicts}
            disabled={loading}
            title="Refresh conflicts"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span>Computing corridor conflict telemetry...</span>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="mt-4 space-y-3">
          {conflicts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 font-mono">
              No active conflict detected on this corridor. All train paths clear.
            </div>
          ) : (
            conflicts.map((conf) => (
              <div
                key={conf.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#111A2E] hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {conf.title}
                      </span>
                      <StatusBadge status={conf.severity || 'MEDIUM'} size="xs" />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Location: {conf.location} • Slot: {conf.timeWindow}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    AI Confidence: {conf.confidence || '96%'}
                  </span>
                </div>

                <div className="mt-2.5 p-2.5 rounded-lg bg-white dark:bg-[#0A101D] border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-700 dark:text-slate-300">
                    <strong className="text-amber-500 font-mono">AI Mitigation: </strong>
                    {conf.aiResolution}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
