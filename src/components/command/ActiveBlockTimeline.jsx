import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Layers,
  Train,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter
} from 'lucide-react';

export const ActiveBlockTimeline = () => {
  const [selectedTrack, setSelectedTrack] = useState('UP_MAIN');

  // Realistic railway timeline blocks for Delhi-Kanpur corridor (00:00 to 06:00 window)
  const timelineHours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];

  const blockRows = [
    {
      department: 'Engineering (P-Way)',
      task: 'CSM Track Tamping (Km 162-178)',
      startHour: 1.0,
      durationHours: 3.5,
      color: 'bg-blue-600 border-blue-400 text-blue-100',
      status: 'ACTIVE'
    },
    {
      department: 'Electrical (TRD / OHE)',
      task: 'OHE Power Block (Km 165-175)',
      startHour: 1.5,
      durationHours: 2.5,
      color: 'bg-purple-600 border-purple-400 text-purple-100',
      status: 'SCHEDULED'
    },
    {
      department: 'Signalling & Telecom (S&T)',
      task: 'Point 102B Detection Tuning',
      startHour: 2.0,
      durationHours: 1.8,
      color: 'bg-amber-600 border-amber-400 text-amber-100',
      status: 'SHADOW_BUNDLED'
    }
  ];

  const trainPaths = [
    {
      trainNo: '12417 Prayagraj Exp',
      timeSlot: 0.5,
      direction: 'UP',
      isConflict: false
    },
    {
      trainNo: '22436 Vande Bharat',
      timeSlot: 5.2,
      direction: 'DN',
      isConflict: false
    },
    {
      trainNo: 'FR-BCNHL Grain Special',
      timeSlot: 2.5,
      direction: 'DN',
      isConflict: true // Regulated to Loop
    }
  ];

  const totalWindowHours = 6.0;

  return (
    <div className="rounded-2xl border border-[#1A2744] bg-[#0C1422] p-5 sm:p-6 shadow-xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base sm:text-lg font-mono">
                ACTIVE & UPCOMING BLOCKS TIMELINE (GANTT)
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                00:00 - 06:00 IST VALLEY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Corridor possession timeline showing department occupancy and train paths
            </p>
          </div>
        </div>

        {/* Track selector */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">TRACK:</span>
          <button
            onClick={() => setSelectedTrack('UP_MAIN')}
            className={`px-3 py-1 rounded-lg border transition-all ${
              selectedTrack === 'UP_MAIN'
                ? 'bg-blue-950 text-cyan-300 border-blue-500 font-bold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            UP MAIN
          </button>
          <button
            onClick={() => setSelectedTrack('DN_MAIN')}
            className={`px-3 py-1 rounded-lg border transition-all ${
              selectedTrack === 'DN_MAIN'
                ? 'bg-blue-950 text-cyan-300 border-blue-500 font-bold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            DOWN MAIN
          </button>
        </div>
      </div>

      {/* Gantt Timeline View */}
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[650px]">
          {/* Time axis header */}
          <div className="grid grid-cols-6 border-b border-slate-800 pb-2 text-xs font-mono text-slate-400">
            {timelineHours.slice(0, 6).map((h, i) => (
              <div key={h} className="relative pl-1">
                <span className="font-bold text-slate-300">{h}</span>
                <div className="absolute left-0 top-6 bottom-0 w-px bg-slate-800 h-64 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Department Possession Bars */}
          <div className="space-y-4 py-4 relative">
            {blockRows.map((row) => {
              const leftPercent = (row.startHour / totalWindowHours) * 100;
              const widthPercent = (row.durationHours / totalWindowHours) * 100;

              return (
                <div key={row.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">{row.department}</span>
                    <span className="text-[10px] text-slate-500">{row.task}</span>
                  </div>
                  <div className="h-8 bg-slate-900/60 rounded-lg relative overflow-hidden border border-slate-800/80">
                    <div
                      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                      className={`absolute top-0.5 bottom-0.5 rounded-md border flex items-center px-2.5 text-[10px] font-mono font-bold shadow-md transition-all hover:brightness-110 ${row.color}`}
                    >
                      <span className="truncate">{row.status}: {row.durationHours}h Block</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Train Path Overlay Strip */}
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Train className="w-3.5 h-3.5" />
                  <span>TRAIN PATHS & SIDING REGULATIONS</span>
                </span>
                <span className="text-[10px] text-slate-500">Deconfliction Window</span>
              </div>
              <div className="h-7 bg-slate-950/80 rounded-lg relative border border-slate-800/80">
                {trainPaths.map((train) => {
                  const leftPercent = (train.timeSlot / totalWindowHours) * 100;
                  return (
                    <div
                      key={train.trainNo}
                      style={{ left: `${leftPercent}%` }}
                      className="absolute top-1 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[9px] whitespace-nowrap"
                    >
                      {train.isConflict ? (
                        <span className="text-red-400 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                          {train.trainNo} (REGULATED)
                        </span>
                      ) : (
                        <span className="text-emerald-300">
                          {train.trainNo}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-slate-800 flex items-center gap-5 flex-wrap text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600" /> Active Possession</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-600" /> Scheduled Possession</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-600" /> Shadow Bundled Possession</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Normal Train Transit</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Regulated to Loop</span>
          </div>
        </div>
      </div>
    </div>
  );
};
