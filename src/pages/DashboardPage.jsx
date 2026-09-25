import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { IstClock } from '../components/common/IstClock';
import { DepartmentEntryBlocks } from '../components/dashboard/DepartmentEntryBlocks';
import { DepartmentMaintenanceModal } from '../components/dashboard/DepartmentMaintenanceModal';
import { AiCombinedPriorityQueue } from '../components/dashboard/AiCombinedPriorityQueue';
import { DomAuthorizationModal } from '../components/dashboard/DomAuthorizationModal';
import {
  Train, ShieldCheck, Cpu, Radio, Clock, Bell, ArrowRight
} from 'lucide-react';

export const DashboardPage = ({ onNavigate }) => {
  const {
    currentZone, currentDivision, tasks, todayWorkTasks,
    activeWorkTasks, notifications
  } = useRailway();
  const { user: authUser } = useAuth();

  const [activeDeptModal, setActiveDeptModal] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedTaskIdsForAuth, setSelectedTaskIdsForAuth] = useState([]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const handleOpenDeptEntry = (dept) => setActiveDeptModal(dept);
  const handleCloseDeptModal = () => setActiveDeptModal(null);
  const handleAddSelectedToToday = (taskIds) => {
    setSelectedTaskIdsForAuth(taskIds);
    setIsAuthModalOpen(true);
  };
  const handleAuthorizationSuccess = () => {
    if (onNavigate) setTimeout(() => onNavigate('todays-work'), 1200);
  };
  const zoneName = currentZone === 'WCR' ? 'WEST CENTRAL RAILWAY' : `${currentZone} RAILWAY`;

  return (
    <div className="space-y-6 pb-16 w-full max-w-7xl mx-auto selection:bg-[#173B73] selection:text-white font-sans">

      {/* COMMAND STATUS HEADER - White + Navy Railway Theme */}
      <div className="rounded-xl overflow-hidden border border-[#D9DEE7] shadow-md bg-white">
        <div className="bg-[#173B73] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-mono font-bold tracking-widest text-blue-200 uppercase">
                Government of India &bull; Ministry of Railways
              </p>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                {zoneName} &mdash; {currentDivision.toUpperCase()} DIVISION
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CENTRAL COMMAND ONLINE
            </span>
            <span className="hidden sm:inline text-[10px] font-mono text-blue-300 bg-[#10274C] px-2 py-0.5 rounded border border-blue-600/40">
              PRAGATI &mdash; Demonstration System
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div>
              <p className="text-xs text-[#5B6575] font-medium">
                Multi-Zone Integrated AI Maintenance &amp; Track Block Coordination Command Center
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EBF2FA] border border-[#D9DEE7]">
                  <div className="w-6 h-6 rounded-md bg-[#173B73] text-white font-bold flex items-center justify-center text-[10px]">
                    {authUser?.officerId ? authUser.officerId.slice(0, 2) : 'OF'}
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-[#5B6575]">Logged In</p>
                    <p className="text-xs font-bold text-[#172033] leading-none">{authUser?.name || 'DOM Officer'}</p>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#173B73] text-white font-bold">
                    {authUser?.role || 'DOM'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F6F8] border border-[#D9DEE7] text-xs font-mono text-[#5B6575]">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-[#173B73]" />
                  <span>SIMULATION TELEMETRY</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono text-[#168A55]">
                  <Cpu className="w-3.5 h-3.5 text-[#168A55]" />
                  <span>AI SOLVER ACTIVE</span>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate('notifications')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:border-amber-400 text-xs font-mono text-[#D98C00] transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{unreadNotificationsCount} ALERTS</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#173B73] text-white font-mono text-sm flex-shrink-0 self-start">
              <Clock className="w-4 h-4 text-amber-300" />
              <IstClock />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#D9DEE7] font-mono text-xs">
            <div className="bg-[#F4F6F8] p-3 rounded-xl border border-[#D9DEE7]">
              <span className="text-[#5B6575] text-[10px] font-bold uppercase block">Total Requisitions</span>
              <span className="text-xl font-black text-[#172033]">{tasks.length}</span>
              <span className="text-[10px] text-[#5B6575]"> Requests</span>
            </div>
            <div
              onClick={() => onNavigate && onNavigate('todays-work')}
              className="bg-[#F4F6F8] p-3 rounded-xl border border-[#D9DEE7] hover:border-[#173B73] hover:bg-[#EBF2FA] transition-all cursor-pointer group"
            >
              <span className="text-[#173B73] text-[10px] font-bold uppercase block">Today's Work</span>
              <span className="text-xl font-black text-[#173B73] flex items-center justify-between">
                <span>{todayWorkTasks.length} Scheduled</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div
              onClick={() => onNavigate && onNavigate('active-work')}
              className="bg-[#F4F6F8] p-3 rounded-xl border border-[#D9DEE7] hover:border-[#168A55] hover:bg-emerald-50 transition-all cursor-pointer group"
            >
              <span className="text-[#168A55] text-[10px] font-bold uppercase block">Active Work</span>
              <span className="text-xl font-black text-[#168A55] flex items-center justify-between">
                <span>{activeWorkTasks.length} In Progress</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div
              onClick={() => onNavigate && onNavigate('emergency-work')}
              className="bg-[#F4F6F8] p-3 rounded-xl border border-[#D9DEE7] hover:border-[#C62828] hover:bg-red-50 transition-all cursor-pointer group"
            >
              <span className="text-[#C62828] text-[10px] font-bold uppercase block">Emergency</span>
              <span className="text-xl font-black text-[#C62828] flex items-center justify-between">
                <span>Rapid Workflow</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <DepartmentEntryBlocks onOpenEntry={handleOpenDeptEntry} />
      <AiCombinedPriorityQueue onAddSelectedToToday={handleAddSelectedToToday} />

      {activeDeptModal && (
        <DepartmentMaintenanceModal
          department={activeDeptModal}
          isOpen={Boolean(activeDeptModal)}
          onClose={handleCloseDeptModal}
        />
      )}

      <DomAuthorizationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        selectedTaskIds={selectedTaskIdsForAuth}
        onAuthorizedSuccess={handleAuthorizationSuccess}
      />

      <footer className="pt-6 border-t border-[#D9DEE7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#5B6575]">
        <div className="flex items-center gap-2">
          <Train className="w-4 h-4 text-[#173B73]" />
          <span>PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration &mdash; Railway Maintenance &amp; Block Planning Prototype</span>
        </div>
        <div>ZONE ISOLATION ENFORCED &bull; CRIS / COIS CERTIFIED &bull; G&amp;SR APPENDIX-A</div>
      </footer>
    </div>
  );
};
