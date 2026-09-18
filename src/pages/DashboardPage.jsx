import React, { useState, useEffect, useCallback } from 'react';
import { useRailway } from '../context/RailwayContext';
import { RailwayApiService } from '../services/api';
import { CommandTopBar } from '../components/command/CommandTopBar';
import { CommandHero } from '../components/command/CommandHero';
import { KpiStrip } from '../components/command/KpiStrip';
import { OperationsModulesGrid } from '../components/command/OperationsModulesGrid';
import { DigitalTwin } from '../components/command/DigitalTwin';
import { AiCommandPanel } from '../components/command/AiCommandPanel';
import { DepartmentCoordination } from '../components/command/DepartmentCoordination';
import { ActiveBlockTimeline } from '../components/command/ActiveBlockTimeline';
import { ConflictAlerts } from '../components/dashboard/ConflictAlerts';
import { CorridorTimeline } from '../components/dashboard/CorridorTimeline';
import { WorkloadDistribution } from '../components/dashboard/WorkloadDistribution';
import {
  Activity,
  Radio,
  WifiOff,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  Train,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const DashboardPage = ({ onNavigate }) => {
  const {
    selectedCorridor,
    tasks,
    blockPlans,
    liveTrains,
    telemetrySummary,
    refreshLiveTelemetry
  } = useRailway();

  const [summary, setSummary] = useState(null);
  const [backendOffline, setBackendOffline] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await RailwayApiService.getDashboardSummary();
      if (data) {
        setSummary(data);
        setBackendOffline(false);
      } else {
        setBackendOffline(true);
      }
    } catch (err) {
      console.warn('[DashboardPage] Backend offline fallback:', err.message);
      setBackendOffline(true);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 w-full max-w-7xl mx-auto selection:bg-red-700 selection:text-white font-sans">
      {/* 1. TOP SYSTEM STATUS TICKER */}
      <CommandTopBar />

      {/* Backend Offline / Fallback Notice */}
      {backendOffline && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-amber-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <span>
              <strong>Local Telemetry Simulation Active:</strong> Connected to in-memory Indian Railways HDN corridor engine.
            </span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 rounded-lg text-[11px] font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. CINEMATIC RAILWAY HERO SECTION */}
      <CommandHero onNavigate={onNavigate} />

      {/* 3. MAIN KPI COMMAND CENTER (7 TILES) */}
      <KpiStrip />

      {/* 4. AI OPERATIONS INTELLIGENCE & PRIORITY ENGINE */}
      <AiCommandPanel onNavigate={onNavigate} />

      {/* 5. OPERATIONS MODULES (PROMINENT CARDS REPLACING SIDEBAR DEPENDENCY) */}
      <OperationsModulesGrid onNavigate={onNavigate} />

      {/* 6. LIVE RAILWAY DIGITAL TWIN */}
      <DigitalTwin />

      {/* 7. MULTI-DEPARTMENT COORDINATION & SHADOW POSSESSION BUNDLING */}
      <DepartmentCoordination onNavigateToPlanning={() => onNavigate('ai-planning')} />

      {/* 8. ACTIVE & UPCOMING BLOCKS TIMELINE (GANTT CHART) */}
      <ActiveBlockTimeline />

      {/* 9. LIVE TRAIN & CONFLICT MONITOR (DUAL VIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConflictAlerts />
        <WorkloadDistribution />
      </div>

      {/* 10. SECTIONAL CORRIDOR TIMELINE */}
      <CorridorTimeline />

      {/* SYSTEM FOOTER */}
      <footer className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <Train className="w-4 h-4 text-slate-400" />
          <span>RAILOPT AI • INDIAN RAILWAYS COMMAND & CONTROL SYSTEM</span>
        </div>
        <div>
          CRIS / COIS INTEGRATED • G&SR APPENDIX-A VERIFIED
        </div>
      </footer>
    </div>
  );
};
