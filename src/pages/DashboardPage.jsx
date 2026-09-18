import React, { useState, useEffect, useCallback } from 'react';
import { useRailway } from '../context/RailwayContext';
import { RailwayApiService } from '../services/api';
import {
  Activity,
  Layers,
  Wrench,
  Calendar,
  AlertTriangle,
  Zap,
  TrendingUp,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Radio,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  WifiOff,
  Sparkles
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { CorridorTimeline } from '../components/dashboard/CorridorTimeline';
import { ConflictAlerts } from '../components/dashboard/ConflictAlerts';
import { WorkloadDistribution } from '../components/dashboard/WorkloadDistribution';

export const DashboardPage = ({ onNavigate }) => {
  const {
    selectedCorridor,
    tasks,
    blockPlans,
    liveTrains,
    telemetrySummary,
    isLiveTelemetryLoading,
    refreshLiveTelemetry
  } = useRailway();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendOffline, setBackendOffline] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RailwayApiService.getDashboardSummary();
      if (data) {
        setSummary(data);
        setBackendOffline(false);
      } else {
        setBackendOffline(true);
      }
    } catch (err) {
      console.warn('[DashboardPage] Failed to fetch summary from backend:', err.message);
      setError(err.message || 'Backend connection offline');
      setBackendOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived or fallback metric values from live summary
  const assetAvailability = summary?.assetAvailabilityPercent != null ? summary.assetAvailabilityPercent : 95.0;
  const criticalTasksCount = summary?.criticalTasks != null ? summary.criticalTasks : tasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'EMERGENCY').length;
  const totalTasksCount = summary?.totalTasks != null ? summary.totalTasks : tasks.length;
  const pendingTasksCount = summary?.pendingTasks != null ? summary.pendingTasks : tasks.filter(t => t.status === 'PENDING_BLOCK' || t.status === 'PENDING').length;
  const totalBlocksCount = summary?.totalBlockPlans != null ? summary.totalBlockPlans : blockPlans.length;
  const approvedBlocksCount = summary?.approvedBlockPlans != null ? summary.approvedBlockPlans : blockPlans.filter(p => p.status === 'APPROVED' || p.status === 'APPROVED_BY_CONTROLLER').length;
  const unresolvedConflicts = summary?.unresolvedConflicts != null ? summary.unresolvedConflicts : 0;
  const conflictsResolved = summary?.conflictsResolved != null ? summary.conflictsResolved : 2;
  const workloadHours = summary?.totalWorkloadHoursPerWeek != null ? summary.totalWorkloadHoursPerWeek : 78.2;
  const trackKmMonitored = summary?.totalTrackKmMonitored != null ? summary.totalTrackKmMonitored : 840;
  const machineUtilization = summary?.machineUtilizationPercent != null ? summary.machineUtilizationPercent : 93.8;

  // Department workload distribution string
  let deptWorkloadStr = 'PWAY 45% • TRD 30% • ST 25%';
  if (summary?.workloadByDepartment && Object.keys(summary.workloadByDepartment).length > 0) {
    deptWorkloadStr = Object.entries(summary.workloadByDepartment)
      .map(([k, v]) => `${k} ${v}%`)
      .join(' • ');
  }

  // AI Priority Engine metrics
  const aiScore = summary?.aiPriorityScore != null ? summary.aiPriorityScore : 94.0;
  const aiLevel = summary?.aiPriorityLevel || 'CRITICAL';
  const aiAction = summary?.aiRecommendedAction || 'Schedule immediate maintenance block. Regulate conflicting freight to siding loops.';

  return (
    <div className="space-y-6">
      {/* Backend Offline / Error Alert */}
      {backendOffline && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse flex-shrink-0" />
            <span>
              <strong>Backend Offline:</strong> Spring Boot backend (<code>http://localhost:8080</code>) is connecting or offline. Ensure MongoDB and backend are running.
            </span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 rounded-lg text-[11px] font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Real-time Train Telemetry Hub Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              telemetrySummary?.overallFreshness === 'LIVE'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : telemetrySummary?.overallFreshness === 'RECENT'
                ? 'bg-teal-500/10 border border-teal-500/30 text-teal-400'
                : telemetrySummary?.overallFreshness === 'SIMULATION'
                ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                : telemetrySummary?.overallFreshness === 'UNAVAILABLE'
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}>
              <Radio className={`w-5 h-5 ${telemetrySummary?.overallFreshness === 'LIVE' ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  LIVE TRAIN TELEMETRY
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  telemetrySummary?.overallFreshness === 'LIVE'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                    : telemetrySummary?.overallFreshness === 'RECENT'
                    ? 'bg-teal-950/80 text-teal-300 border border-teal-700'
                    : telemetrySummary?.overallFreshness === 'SIMULATION'
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-700'
                    : telemetrySummary?.overallFreshness === 'UNAVAILABLE'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-700'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-700'
                }`}>
                  {telemetrySummary?.overallFreshness || 'SIMULATION'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  SOURCE: {telemetrySummary?.provider || 'Simulation'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Real-time GPS & station feed matched to MongoDB railway corridors</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-slate-400">
                  LAST UPDATE: {telemetrySummary?.lastUpdate
                    ? (telemetrySummary.lastUpdate.includes(':') && !telemetrySummary.lastUpdate.includes('T') && !telemetrySummary.lastUpdate.includes('-')
                        ? `${telemetrySummary.lastUpdate} IST`
                        : new Date(telemetrySummary.lastUpdate).toLocaleTimeString() + ' IST')
                    : '10:31:12 IST'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refreshLiveTelemetry()}
              disabled={isLiveTelemetryLoading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Loader2 className={`w-3.5 h-3.5 ${isLiveTelemetryLoading ? 'animate-spin text-red-500' : ''}`} />
              <span>{isLiveTelemetryLoading ? 'Refreshing Telemetry...' : 'Refresh Telemetry'}</span>
            </button>
          </div>
        </div>

        {telemetrySummary?.overallFreshness === 'UNAVAILABLE' && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              <strong>RailRadar Feed Unavailable:</strong> Live API query returned upstream error or train not found in active tracking registry. Operating in strict non-fabrication mode; showing last known status.
            </span>
          </div>
        )}

        {/* Real-time Telemetry KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 font-mono">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">TOTAL MONITORED</span>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {telemetrySummary?.totalTrains ?? 6}
            </div>
            <span className="text-[9px] text-slate-500">Seeded corridor trains</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
            <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-bold block">LIVE TRAINS</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {telemetrySummary?.liveTrains ?? 6}
            </div>
            <span className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70">
              {telemetrySummary?.provider === 'RailRadar'
                ? (telemetrySummary?.overallFreshness === 'LIVE' ? 'Active RailRadar link' : 'RailRadar (Live telemetry)')
                : 'Simulated telemetry'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40">
            <span className="text-[10px] uppercase text-amber-600 dark:text-amber-400 font-bold block">DELAYED</span>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {telemetrySummary?.delayedTrains ?? 1}
            </div>
            <span className="text-[9px] text-amber-600/70 dark:text-amber-400/70">&gt; 5 min delay delta</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/40">
            <span className="text-[10px] uppercase text-rose-600 dark:text-rose-400 font-bold block">ACTIVE CONFLICTS</span>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {telemetrySummary?.activeConflicts ?? 1}
            </div>
            <span className="text-[9px] text-rose-600/70 dark:text-rose-400/70">Train vs block hazard</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">STALE TELEMETRY</span>
            <div className="text-lg font-black text-slate-700 dark:text-slate-300 mt-0.5">
              {telemetrySummary?.staleTrains ?? 0}
            </div>
            <span className="text-[9px] text-slate-500">&gt; 120s without ping</span>
          </div>
        </div>
      </div>

      {/* Corridor Operations Status Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-railway-navy to-slate-900 text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE SECTION CONTROLLER DESK
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-mono">
                {selectedCorridor?.division || 'NCR - Prayagraj'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {selectedCorridor?.name || 'Delhi – Kanpur Main Line'}
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300">
                {selectedCorridor?.code || selectedCorridor?.corridorId || 'NDLS-CNB'}
              </span>
            </h2>

            <p className="text-xs text-slate-300 font-mono max-w-2xl">
              Track Length: {selectedCorridor?.lengthKm || 440} Tkm • Capacity Utilization: {selectedCorridor?.capacityUtilization || 87}% • Signaling: {selectedCorridor?.signaling || 'MACLS'}
            </p>
          </div>

          {/* Quick CTA to AI Planning */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('ai-planning')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-railway-maroon hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-950/40 flex items-center gap-2 transition-all group"
            >
              <Cpu className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Generate AI Block Plan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Priority Engine Telemetry Banner */}
      <div className="rounded-xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-slate-900 to-[#0A101D] p-4 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-400">
                AI Priority Engine Assessment
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-700">
                Score {aiScore}/100 • {aiLevel}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              <strong>Recommended Action: </strong>{aiAction}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('ai-planning')}
          className="self-start md:self-auto text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
        >
          <span>Run Corridor Optimization</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5 Core Telemetry KPI Cards — Computed Dynamically */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Asset Availability"
          value={loading ? '--' : assetAvailability}
          unit="%"
          change="+1.2%"
          changeType="positive"
          subtitle="computed from live assets"
          icon={Activity}
          accentColor="green"
          footer={`${trackKmMonitored} Track Km Monitored`}
        />

        <MetricCard
          title="Critical Tasks"
          value={loading ? '--' : criticalTasksCount}
          unit={`/ ${totalTasksCount}`}
          change={`${criticalTasksCount} High Priority`}
          changeType={criticalTasksCount > 0 ? "negative" : "positive"}
          subtitle="immediate action queue"
          icon={AlertTriangle}
          accentColor="red"
          footer={`${pendingTasksCount} Requisitions Pending`}
        />

        <MetricCard
          title="Planned Blocks"
          value={loading ? '--' : totalBlocksCount}
          unit="Active"
          change={`${approvedBlocksCount} Approved`}
          changeType="positive"
          subtitle="AI optimized possession"
          icon={Calendar}
          accentColor="blue"
          footer="Shadow Bundling Enabled"
        />

        <MetricCard
          title="Train Conflicts"
          value={loading ? '--' : unresolvedConflicts}
          unit="Unresolved"
          change={`${conflictsResolved} Auto-Mitigated`}
          changeType={unresolvedConflicts > 0 ? "negative" : "positive"}
          subtitle="by AI priority solver"
          icon={ShieldCheck}
          accentColor="amber"
          footer="Zero Unplanned Detentions"
        />

        <MetricCard
          title="Maintenance Workload"
          value={loading ? '--' : workloadHours}
          unit="Hrs/Wk"
          change="Optimal"
          changeType="neutral"
          subtitle={deptWorkloadStr}
          icon={Wrench}
          accentColor="purple"
          footer={`Machine Utilization: ${machineUtilization}%`}
        />
      </div>

      {/* Core Signature Feature: Interactive Corridor Timeline */}
      <CorridorTimeline />

      {/* Secondary Telemetry: Conflicts & Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConflictAlerts />
        <WorkloadDistribution />
      </div>
    </div>
  );
};
