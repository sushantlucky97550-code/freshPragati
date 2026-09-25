import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Clock,
  Wrench,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const WeeklyPlannerPage = () => {
  const { selectedCorridor, blockPlans } = useRailway();
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [activePlanModal, setActivePlanModal] = useState(null);

  const daysOfWeek = [
    { day: 'Mon', date: '09 Sep', full: '2026-09-09' },
    { day: 'Tue', date: '10 Sep', full: '2026-09-10' },
    { day: 'Wed', date: '11 Sep', full: '2026-09-11' },
    { day: 'Thu', date: '12 Sep', full: '2026-09-12' },
    { day: 'Fri', date: '13 Sep', full: '2026-09-13' },
    { day: 'Sat', date: '14 Sep', full: '2026-09-14' },
    { day: 'Sun', date: '15 Sep', full: '2026-09-15' }
  ];

  // Schedule mock items
  const calendarBlocks = [
    {
      id: 'BLK-01',
      date: '2026-09-10',
      time: '01:30 - 03:00',
      title: 'Emergency USFD Rail Cut & Weld',
      dept: 'P_WAY',
      track: 'UP Main (Km 138)',
      machine: 'Flash Butt Welder',
      status: 'APPROVED',
      isEmergency: true
    },
    {
      id: 'BLK-02',
      date: '2026-09-11',
      time: '01:45 - 05:15',
      title: 'Integrated Traffic & Power Block (CSM + OHE)',
      dept: 'INTEGRATED',
      track: 'UP Main (Aligarh - Tundla)',
      machine: 'CSM-932 + Tower Wagon',
      status: 'APPROVED_BY_CONTROLLER',
      isShadow: true
    },
    {
      id: 'BLK-03',
      date: '2026-09-12',
      time: '11:00 - 13:00',
      title: 'Point Machine Calibration 102B',
      dept: 'S_AND_T',
      track: 'DN Main (Ghaziabad)',
      machine: 'S&T Tool Van',
      status: 'PENDING_BLOCK'
    },
    {
      id: 'BLK-04',
      date: '2026-09-13',
      time: '01:00 - 05:00',
      title: 'Deep Screening Ballast (BCM-420)',
      dept: 'P_WAY',
      track: 'DN Main (Etawah - Kanpur)',
      machine: 'BCM Machine Rake',
      status: 'PENDING_BLOCK'
    },
    {
      id: 'BLK-05',
      date: '2026-09-14',
      time: '02:00 - 04:30',
      title: 'OHE Isolator & Bracket Overhaul',
      dept: 'TRD_OHE',
      track: '3rd Line (Tundla)',
      machine: 'Tower Wagon',
      status: 'APPROVED'
    }
  ];

  const filteredCalendarBlocks = calendarBlocks.filter(b => {
    if (selectedDept === 'ALL') return true;
    if (selectedDept === 'P_WAY') return b.dept === 'P_WAY' || b.dept === 'INTEGRATED';
    if (selectedDept === 'TRD_OHE') return b.dept === 'TRD_OHE' || b.dept === 'INTEGRATED';
    if (selectedDept === 'S_AND_T') return b.dept === 'S_AND_T' || b.dept === 'INTEGRATED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner - White + Navy */}
      <div className="rounded-xl overflow-hidden border border-[#D9DEE7] shadow-sm bg-white">
        <div className="bg-[#173B73] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-blue-200 font-bold uppercase tracking-widest mb-0.5">
                Week 37 • 2026
              </div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Weekly Corridor Block Planner
              </h1>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-b border-[#D9DEE7]">
          <p className="text-xs text-[#5B6575] font-medium">
            Sectional master possession timetable for {selectedCorridor.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="P_WAY">Engineering (P-Way)</option>
            <option value="TRD_OHE">Electrical (TRD / OHE)</option>
            <option value="S_AND_T">Signalling & Telecom</option>
          </select>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 min-w-0">
        {daysOfWeek.map((day) => {
          const dayBlocks = filteredCalendarBlocks.filter(b => b.date === day.full);
          const isToday = day.day === 'Wed';

          return (
            <div
              key={day.date}
              className={`rounded-xl border flex flex-col min-h-[450px] p-3 transition-all ${
                isToday
                  ? 'border-red-600/60 bg-red-50/20 dark:bg-red-950/10'
                  : 'border-[#D9DEE7] bg-white'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {day.day}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isToday
                      ? 'bg-red-600 text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {day.date}
                </span>
              </div>

              {/* Day Blocks */}
              <div className="space-y-2.5 flex-1">
                {dayBlocks.length > 0 ? (
                  dayBlocks.map((blk) => (
                    <div
                      key={blk.id}
                      onClick={() => setActivePlanModal(blk)}
                      className={`p-2.5 rounded-xl border cursor-pointer hover:scale-102 transition-all space-y-1.5 text-xs ${
                        blk.isEmergency
                          ? 'border-red-500/50 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200'
                          : bl.isShadow
                          ? 'border-sky-500/50 bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {blk.time}
                        </span>
                        <StatusBadge status={blk.status} size="xs" />
                      </div>

                      <div className="font-bold text-[11px] line-clamp-2">
                        {blk.title}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono">
                        {blk.track}
                      </div>

                      <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[9px] font-mono text-slate-400 flex items-center justify-between">
                        <span>{blk.machine}</span>
                        {blk.isShadow && (
                          <span className="text-sky-500 font-bold">SHADOW</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-4 text-[11px] font-mono text-slate-400">
                    No block scheduled
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Block Inspector Modal */}
      <Modal
        isOpen={!!activePlanModal}
        onClose={() => setActivePlanModal(null)}
        title={activePlanModal?.title || 'Block Details'}
        subtitle={`Scheduled for ${activePlanModal?.date} (${activePlanModal?.time} IST)`}
      >
        {activePlanModal && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Track Section</span>
                <strong>{activePlanModal.track}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Machine</span>
                <strong>{activePlanModal.machine}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Department</span>
                <strong>{activePlanModal.dept}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">COIS Status</span>
                <StatusBadge status={activePlanModal.status} size="xs" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
