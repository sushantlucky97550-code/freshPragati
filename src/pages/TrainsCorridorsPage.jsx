import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import {
  Train,
  Route,
  Search,
  Filter,
  Clock,
  Zap,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const TrainsCorridorsPage = () => {
  const { corridors, selectedCorridor, setSelectedCorridorId, trains, liveTrains } = useRailway();
  const [trainFilter, setTrainFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrains = trains.filter((t) => {
    const matchesSearch =
      t.trainNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      trainFilter === 'ALL' ||
      (trainFilter === 'PREMIUM' && t.type === 'PREMIUM') ||
      (trainFilter === 'SUPERFAST' && t.type === 'SUPERFAST') ||
      (trainFilter === 'FREIGHT' && t.type === 'FREIGHT');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Train className="w-5 h-5 text-red-600 dark:text-red-400" />
                Corridor Capacity & Train Directory
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                HDN Network
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sectional capacity utilization, timetable slot allocations, and active speed restrictions
            </p>
          </div>
        </div>
      </div>

      {/* Corridors Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {corridors.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCorridorId(c.id)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              c.id === selectedCorridor.id
                ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 shadow-md ring-1 ring-red-600'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                {c.code}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                {c.zone}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {c.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {c.division} • {c.lengthKm} Tkm
            </p>

            {/* Capacity Meter */}
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Capacity Utilization</span>
                <span
                  className={`font-bold ${
                    c.capacityUtilization > 120 ? 'text-red-500' : 'text-emerald-500'
                  }`}
                >
                  {c.capacityUtilization}% (Over-saturated)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-600"
                  style={{ width: `${Math.min(100, c.capacityUtilization / 1.5)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <div>Daily Trains: <strong>{c.dailyTrains}</strong></div>
              <div>Max Speed: <strong>{c.speedLimit} km/h</strong></div>
              <div>Coaching: <strong>{c.coachingRatio}%</strong></div>
              <div>Freight: <strong>{c.freightRatio}%</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Train Schedule Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Scheduled Trains on Corridor ({filteredTrains.length})
            </h3>
            <p className="text-xs text-slate-500">
              Timetable paths prioritized during block allocation
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search train no or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900 text-xs font-mono">
              {['ALL', 'PREMIUM', 'SUPERFAST', 'FREIGHT'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTrainFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    trainFilter === f
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Train No. & Name</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Origin & Dest</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Speed</th>
                <th className="px-3 py-3">Real-time Location</th>
                <th className="px-3 py-3">Live Delay</th>
                <th className="px-3 py-3">Data Source</th>
                <th className="px-3 py-3">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredTrains.map((train) => {
                const live = liveTrains?.find((lt) => lt.trainNumber === train.trainNo);
                const delayMins = live?.delayMinutes != null ? live.delayMinutes : 0;
                const speed = live?.speedKmh != null ? live.speedKmh : train.maxSpeed;
                const currentSec = live?.currentSection || train.trackLine || 'MAIN';
                const source = live?.dataSource || 'SIMULATION';
                const freshness = live?.freshness || 'LIVE';

                return (
                  <tr
                    key={train.trainNo}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{train.trainNo}</span>
                        {freshness === 'LIVE' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Feed" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans">
                        {train.name}
                      </div>
                    </td>

                    <td className="px-3 py-3.5 font-sans">
                      {train.category}
                    </td>

                    <td className="px-3 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {train.source} → {train.destination}
                    </td>

                    <td className="px-3 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          train.priority === 1
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                            : train.priority === 2
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        Priority {train.priority}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 text-cyan-500 dark:text-cyan-400 font-bold">
                      {speed} km/h
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {currentSec}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {live?.gpsAvailable ? (
                          <span className="text-emerald-500">GPS ({live.latitude?.toFixed(2)}, {live.longitude?.toFixed(2)})</span>
                        ) : (
                          <span>Station: {live?.currentStation || 'NDLS'}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      {delayMins > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800 font-bold text-[10px]">
                          +{delayMins} min
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                          Right Time
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        source === 'RAILRADAR'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-blue-950 text-blue-300 border border-blue-700'
                      }`}>
                        {source === 'RAILRADAR' ? 'RailRadar' : 'Simulation'}
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      <StatusBadge status={delayMins > 5 ? 'DELAYED' : (train.status || 'RUNNING')} size="xs" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
