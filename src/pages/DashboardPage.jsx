import React, { useState, useEffect, useCallback } from 'react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { RailwayApiService } from '../services/api';
import { IstClock } from '../components/common/IstClock';
import { DepartmentEntryBlocks } from '../components/dashboard/DepartmentEntryBlocks';
import { DepartmentMaintenanceModal } from '../components/dashboard/DepartmentMaintenanceModal';
import { AiCombinedPriorityQueue } from '../components/dashboard/AiCombinedPriorityQueue';
import { DomAuthorizationModal } from '../components/dashboard/DomAuthorizationModal';
import {
  Train,
  ShieldCheck,
  Cpu,
  Radio,
  Clock,
  Bell,
  Wifi,
  Layers,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const DashboardPage = ({ onNavigate }) => {
  const {
    currentZone,
    currentDivision,
    tasks,
    todayWorkTasks,
    activeWorkTasks,
    telemetrySummary,
    notifications
  } = useRailway();

  const { user: authUser } = useAuth();

  // State for modals
  const [activeDeptModal, setActiveDeptModal] = useState(null); // department object or null
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedTaskIdsForAuth, setSelectedTaskIdsForAuth] = useState([]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleOpenDeptEntry = (dept) => {
    setActiveDeptModal(dept);
  };

  const handleCloseDeptModal = () => {
    setActiveDeptModal(null);
  };

  const handleAddSelectedToToday = (taskIds) => {
    setSelectedTaskIdsForAuth(taskIds);
    setIsAuthModalOpen(true);
  };

  const handleAuthorizationSuccess = () => {
    if (onNavigate) {
      setTimeout(() => {
        onNavigate('todays-work');
      }, 1200);
    }
  };

  return (
    <div className="space-y-6 pb-16 w-full max-w-7xl mx-auto selection:bg-red-700 selection:text-white font-sans">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 8. HEADER / COMMAND STATUS                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#070D18] via-[#0B1528] to-[#070D18] border border-blue-900/40 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* Left: Zone & Division Official Command Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CENTRAL COMMAND ONLINE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono flex items-center gap-2.5">
              <span>{currentZone === 'WCR' ? 'WEST CENTRAL RAILWAY' : `${currentZone} RAILWAY`}</span>
              <span className="text-cyan-400">•</span>
              <span className="text-slate-200">{currentDivision.toUpperCase()} DIVISION</span>
            </h1>

            <p className="text-xs text-slate-400 font-mono mt-1">
              Multi-Zone Integrated AI Maintenance & Track Block Coordination Command Center
            </p>
          </div>

          {/* Right: Operational Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Clock */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 font-mono text-xs text-amber-300 flex items-center gap-2 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <IstClock />
            </div>

            {/* Officer Profile Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-600/50 font-mono text-xs text-blue-200 flex items-center gap-2 shadow-sm">
              <div className="w-5 h-5 rounded-md bg-blue-600/60 text-white font-bold flex items-center justify-center text-[10px]">
                {authUser?.officerId ? authUser.officerId.slice(0, 2) : 'OF'}
              </div>
              <span className="font-bold">{authUser?.name || 'DOM Officer'}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900 text-cyan-300 border border-blue-500/40">
                {authUser?.role || 'DOM'}
              </span>
            </div>

            {/* Telemetry Status */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-cyan-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>SIMULATION TELEMETRY</span>
            </div>

            {/* AI Engine Status */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-emerald-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>AI SOLVER ACTIVE</span>
            </div>

            {/* Notifications Alert */}
            <button
              onClick={() => onNavigate && onNavigate('notifications')}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 font-mono text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>{unreadNotificationsCount} ALERTS</span>
            </button>
          </div>
        </div>

        {/* Quick Operational Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-[#060C16] p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">TOTAL REQUISITIONS</span>
            <span className="text-base font-bold text-white">{tasks.length} Requests</span>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('todays-work')}
            className="bg-[#060C16] p-2.5 rounded-xl border border-blue-800/40 hover:border-blue-500/60 transition-colors cursor-pointer"
          >
            <span className="text-cyan-400 text-[10px] block font-bold">TODAY'S WORK (DOM AUTHORIZED)</span>
            <span className="text-base font-bold text-cyan-300 flex items-center justify-between">
              <span>{todayWorkTasks.length} Scheduled</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('active-work')}
            className="bg-[#060C16] p-2.5 rounded-xl border border-emerald-800/40 hover:border-emerald-500/60 transition-colors cursor-pointer"
          >
            <span className="text-emerald-400 text-[10px] block font-bold">CURRENTLY ACTIVE WORK</span>
            <span className="text-base font-bold text-emerald-300 flex items-center justify-between">
              <span>{activeWorkTasks.length} In Progress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('emergency-work')}
            className="bg-[#060C16] p-2.5 rounded-xl border border-red-800/40 hover:border-red-500/60 transition-colors cursor-pointer"
          >
            <span className="text-red-400 text-[10px] block font-bold">EMERGENCY MAINTENANCE</span>
            <span className="text-base font-bold text-red-300 flex items-center justify-between">
              <span>Rapid Workflow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 9. THREE DEPARTMENT ENTRY BLOCKS                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <DepartmentEntryBlocks onOpenEntry={handleOpenDeptEntry} />

      {/* ────────────────────────────────────────────────────────── */}
      {/* 11-14. AI COMBINED MAINTENANCE PRIORITY QUEUE             */}
      {/* ────────────────────────────────────────────────────────── */}
      <AiCombinedPriorityQueue onAddSelectedToToday={handleAddSelectedToToday} />

      {/* ────────────────────────────────────────────────────────── */}
      {/* 10. DEPARTMENT MAINTENANCE MODAL (DATA ENTRY / CSV)       */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeDeptModal && (
        <DepartmentMaintenanceModal
          department={activeDeptModal}
          isOpen={Boolean(activeDeptModal)}
          onClose={handleCloseDeptModal}
        />
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 15. DOM / SR. DOM AUTHORIZATION MODAL                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <DomAuthorizationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        selectedTaskIds={selectedTaskIdsForAuth}
        onAuthorizedSuccess={handleAuthorizationSuccess}
      />

      {/* ────────────────────────────────────────────────────────── */}
      {/* FOOTER                                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <footer className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <Train className="w-4 h-4 text-slate-400" />
          <span>RAILOPT AI • INDIAN RAILWAYS COMMAND & CONTROL SYSTEM</span>
        </div>
        <div>
          ZONE ISOLATION ENFORCED • CRIS / COIS CERTIFIED • G&SR APPENDIX-A
        </div>
      </footer>
    </div>
  );
};
