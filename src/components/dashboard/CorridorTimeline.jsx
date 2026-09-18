import React, { useState, useEffect } from 'react';
import { useRailway } from '../../context/RailwayContext';
import {
  Clock,
  Filter,
  AlertTriangle,
  Layers,
  Train as TrainIcon,
  Wrench,
  CheckCircle2,
  Info,
  Maximize2,
  Radio,
  Navigation,
  MapPin,
  Gauge
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const CorridorTimeline = () => {
  const { selectedCorridor, trains, blockPlans, liveTrains } = useRailway();
  const [selectedShift, setSelectedShift] = useState('NIGHT'); // NIGHT (00-08), DAY (08-16), EVENING (16-24)
  const [filterType, setFilterType] = useState('ALL'); // ALL, COACHING, FREIGHT, BLOCKS
  const [hoveredEntity, setHoveredEntity] = useState(null);

  const [currentIstTime, setCurrentIstTime] = useState(() => {
    return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIstTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Time window settings
  const shiftWindows = {
    NIGHT: { start: 0, end: 8, label: 'Shift III: 00:00 - 08:00 IST (Maintenance Valley)' },
    DAY: { start: 8, end: 16, label: 'Shift I: 08:00 - 16:00 IST (Day Passenger Peak)' },
    EVENING: { start: 16, end: 24, label: 'Shift II: 16:00 - 24:00 IST (Evening VIP Peak)' }
  };

  const currentWindow = shiftWindows[selectedShift];
  const totalHours = currentWindow.end - currentWindow.start;

  // Helper to convert "HH:MM" to percent along active window
  const timeToPercent = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return -10;
    const [h, m] = timeStr.split(':').map(Number);
    const hourVal = h + (m || 0) / 60;
    if (hourVal < currentWindow.start || hourVal > currentWindow.end) return -10;
    return ((hourVal - currentWindow.start) / totalHours) * 100;
  };

  // Convert current IST to timeline percent if in window
  const [curH, curM] = currentIstTime.split(':').map(Number);
  const currentIstHourVal = curH + (curM || 0) / 60;
  const currentIstPercent =
    currentIstHourVal >= currentWindow.start && currentIstHourVal <= currentWindow.end
      ? ((currentIstHourVal - currentWindow.start) / totalHours) * 100
      : null;

  // Timeline hours labels
  const hourTicks = Array.from({ length: totalHours + 1 }, (_, i) => currentWindow.start + i);

  // Filtered trains and blocks for corridor
  const corridorTracks = selectedCorridor.tracks || [
    { id: 'UP_MAIN', name: 'UP Main Line', direction: 'UP' },
    { id: 'DN_MAIN', name: 'DOWN Main Line', direction: 'DN' },
    { id: '3RD_LINE', name: '3rd Line / Freight', direction: 'BIDIRECTIONAL' }
  ];

  // Mock schedule occurrences for timeline display
  const timelineOccurrences = [
    // UP MAIN
    {
      id: 'train-12417',
      track: 'UP_MAIN',
      type: 'COACHING',
      trainNo: '12417',
      name: 'Prayagraj Express',
      category: 'Superfast VIP',
      startTime: '03:15',
      endTime: '04:45',
      status: 'ON_TIME',
      color: 'from-amber-600 to-amber-500',
      textColor: 'text-amber-100',
      borderColor: 'border-amber-400/60'
    },
    {
      id: 'train-12582',
      track: 'UP_MAIN',
      type: 'COACHING',
      trainNo: '12582',
      name: 'Banaras - NDLS SF',
      category: 'Mail/Express',
      startTime: '06:45',
      endTime: '08:00',
      status: 'REGULATED',
      delayMins: 14,
      color: 'from-rose-600 to-rose-500',
      textColor: 'text-rose-100',
      borderColor: 'border-rose-400/60'
    },
    {
      id: 'block-01',
      track: 'UP_MAIN',
      type: 'BLOCK',
      title: 'AI Scheduled Integrated Block (CSM Tamping + OHE)',
      planId: 'BLK-AI-2026-9041',
      startTime: '01:45',
      endTime: '05:15',
      departments: ['P-Way', 'TRD/OHE', 'S&T'],
      machine: 'CSM-932 + Tower Wagon',
      color: 'from-amber-500/30 to-amber-600/30',
      isBlock: true
    },
    // DOWN MAIN
    {
      id: 'train-22436',
      track: 'DN_MAIN',
      type: 'COACHING',
      trainNo: '22436',
      name: 'Vande Bharat Express',
      category: 'VIP Semi-High Speed',
      startTime: '06:00',
      endTime: '07:30',
      status: 'ON_TIME',
      color: 'from-cyan-600 to-blue-600',
      textColor: 'text-cyan-100',
      borderColor: 'border-cyan-400/80'
    },
    {
      id: 'train-12004',
      track: 'DN_MAIN',
      type: 'COACHING',
      trainNo: '12004',
      name: 'Lucknow Shatabdi',
      category: 'Premium Express',
      startTime: '06:10',
      endTime: '07:50',
      status: 'ON_TIME',
      color: 'from-indigo-600 to-indigo-500',
      textColor: 'text-indigo-100',
      borderColor: 'border-indigo-400/60'
    },
    {
      id: 'train-fr-8832',
      track: 'DN_MAIN',
      type: 'FREIGHT',
      trainNo: 'FR-BCNHL-8832',
      name: 'FCI Grain Special',
      category: 'Covered Goods',
      startTime: '02:00',
      endTime: '04:30',
      status: 'ON_TIME',
      color: 'from-emerald-700 to-teal-700',
      textColor: 'text-emerald-100',
      borderColor: 'border-emerald-500/60'
    },
    // 3RD LINE
    {
      id: 'train-fr-4012',
      track: '3RD_LINE',
      type: 'FREIGHT',
      trainNo: 'FR-BOXN-4012',
      name: 'Dadri Coal Freight',
      category: 'Heavy Haul 58-Wagons',
      startTime: '02:30',
      endTime: '05:45',
      status: 'REGULATED',
      delayMins: 38,
      color: 'from-slate-700 to-slate-800',
      textColor: 'text-slate-200',
      borderColor: 'border-slate-500'
    },
    {
      id: 'block-02',
      track: '3RD_LINE',
      type: 'BLOCK',
      title: 'Routine Point Testing Window (S&T)',
      startTime: '06:00',
      endTime: '07:30',
      departments: ['S&T'],
      machine: 'S&T Inspection Rig',
      color: 'from-purple-500/30 to-purple-600/30',
      isBlock: true
    }
  ];

  // Dynamic occurrences merging real-time RailRadar / Simulation telemetry
  const dynamicOccurrences = timelineOccurrences.map((occ) => {
    if (occ.isBlock) return occ;
    const live = liveTrains?.find((lt) => lt.trainNumber === occ.trainNo);
    if (!live) return occ;
    return {
      ...occ,
      name: live.trainName || occ.name,
      speedKmh: live.speedKmh,
      delayMins: live.delayMinutes != null ? live.delayMinutes : occ.delayMins,
      currentSection: live.currentSection,
      currentStation: live.currentStation,
      nextStation: live.nextStation,
      dataSource: live.dataSource,
      freshness: live.freshness,
      routeMatchStatus: live.routeMatchStatus,
      routeMatchConfidence: live.routeMatchConfidence,
      latitude: live.latitude,
      longitude: live.longitude,
      gpsAvailable: live.gpsAvailable,
      timestamp: live.timestamp,
      status: (live.delayMinutes && live.delayMinutes > 5) ? 'DELAYED' : (live.status || occ.status)
    };
  });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm overflow-hidden">
      {/* Timeline Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Corridor String Timeline: {selectedCorridor.name}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              ABS • 130 km/h
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time occupation diagram tracking train paths, loop regulations, and maintenance blocks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shift selector buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900 text-xs font-mono">
            {Object.keys(shiftWindows).map((shiftKey) => (
              <button
                key={shiftKey}
                onClick={() => setSelectedShift(shiftKey)}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  selectedShift === shiftKey
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {shiftKey === 'NIGHT' ? 'Night (00-08)' : shiftKey === 'DAY' ? 'Day (08-16)' : 'Evening (16-24)'}
              </button>
            ))}
          </div>

          {/* Filter dropdown */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none"
            >
              <option value="ALL">All Movements</option>
              <option value="COACHING">Coaching Only</option>
              <option value="FREIGHT">Freight Only</option>
              <option value="BLOCKS">Blocks Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current shift label */}
      <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Active Window: <strong>{currentWindow.label}</strong></span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-cyan-500"></span> Premium Coaching
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-emerald-600"></span> Freight Rake
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-amber-500/80 bg-maintenance-stripes"></span> Maintenance Block
          </span>
        </div>
      </div>

      {/* Main Timeline Graphic Canvas - Horizontally Scrollable without page overflow */}
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <div className="relative p-4 min-w-[760px]">
          {/* Hour Axis Grid */}
          <div className="relative h-6 border-b border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-400 mb-2">
            {hourTicks.map((hour, idx) => {
              const leftPercent = (idx / totalHours) * 100;
              return (
                <div
                  key={hour}
                  className="absolute -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${leftPercent}%` }}
                >
                  <span>{String(hour).padStart(2, '0')}:00</span>
                  <span className="h-1.5 w-px bg-slate-300 dark:bg-slate-700 mt-0.5"></span>
                </div>
              );
            })}
          </div>

          {/* Current IST Indicator Line */}
          {currentIstPercent !== null && (
            <div
              className="absolute top-4 bottom-4 w-0.5 bg-red-500 z-20 pointer-events-none"
              style={{ left: `calc(${currentIstPercent}% + 16px)` }}
            >
              <div className="absolute -top-3 -translate-x-1/2 bg-red-600 text-white font-mono text-[9px] px-1 rounded shadow-sm">
                NOW ({currentIstTime.slice(0, 5)})
              </div>
              <div className="w-full h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            </div>
          )}

        {/* Track Rows */}
        <div className="space-y-4 pt-2">
          {corridorTracks.map((track) => {
            const trackOccurrences = dynamicOccurrences.filter((item) => {
              if (item.track !== track.id) return false;
              if (filterType === 'COACHING' && item.type !== 'COACHING') return false;
              if (filterType === 'FREIGHT' && item.type !== 'FREIGHT') return false;
              if (filterType === 'BLOCKS' && item.type !== 'BLOCK') return false;
              return true;
            });

            return (
              <div key={track.id} className="relative">
                {/* Track Row Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {track.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      Dir: {track.direction}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Track Capacity: 98.4%
                  </span>
                </div>

                {/* Track Line Canvas Bar */}
                <div className="relative h-14 rounded-lg bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-inner">
                  {/* Background Track Rail Graphic */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-300 dark:bg-slate-700/60"></div>
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                    {hourTicks.map((_, i) => (
                      <div key={i} className="w-px h-2 bg-slate-200 dark:bg-slate-800" />
                    ))}
                  </div>

                  {/* Render Occurrences */}
                  {trackOccurrences.map((occ) => {
                    const startP = timeToPercent(occ.startTime);
                    const endP = timeToPercent(occ.endTime);
                    if (startP < 0 && endP < 0) return null;

                    const safeStart = Math.max(0, startP);
                    const safeEnd = Math.min(100, endP);
                    const widthP = Math.max(4, safeEnd - safeStart);

                    if (occ.isBlock) {
                      return (
                        <div
                          key={occ.id}
                          onMouseEnter={() => setHoveredEntity(occ)}
                          onMouseLeave={() => setHoveredEntity(null)}
                          className={`absolute top-1 bottom-1 rounded-md border-2 border-dashed border-amber-500 dark:border-amber-400 bg-amber-500/20 bg-maintenance-stripes flex items-center justify-center cursor-pointer transition-all hover:brightness-125 z-10`}
                          style={{
                            left: `${safeStart}%`,
                            width: `${widthP}%`
                          }}
                        >
                          <div className="flex items-center gap-1.5 px-2 text-[10px] font-mono font-bold text-amber-900 dark:text-amber-200 truncate">
                            <Wrench className="w-3 h-3 text-amber-500 animate-spin-slow flex-shrink-0" />
                            <span className="truncate">{occ.title}</span>
                            <span className="text-[9px] bg-amber-500/30 px-1 rounded">
                              {occ.startTime} - {occ.endTime}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={occ.id}
                        onMouseEnter={() => setHoveredEntity(occ)}
                        onMouseLeave={() => setHoveredEntity(null)}
                        className={`absolute top-2 bottom-2 rounded-md bg-gradient-to-r ${occ.color} ${occ.borderColor} border shadow-sm flex items-center px-2 text-[10px] font-mono font-bold ${occ.textColor} cursor-pointer transition-all hover:scale-102 hover:z-20 truncate gap-1`}
                        style={{
                          left: `${safeStart}%`,
                          width: `${widthP}%`
                        }}
                      >
                        <TrainIcon className="w-3 h-3 mr-0.5 flex-shrink-0 opacity-80" />
                        <span className="truncate">{occ.trainNo} {occ.name}</span>
                        {occ.speedKmh != null && (
                          <span className="px-1 rounded bg-black/40 text-cyan-200 text-[9px] flex-shrink-0">
                            {occ.speedKmh} km/h
                          </span>
                        )}
                        {occ.delayMins > 0 ? (
                          <span className="px-1 rounded bg-red-950/80 text-red-200 text-[9px] flex-shrink-0">
                            +{occ.delayMins}m
                          </span>
                        ) : (
                          <span className="px-1 rounded bg-emerald-950/80 text-emerald-300 text-[9px] flex-shrink-0">
                            RT
                          </span>
                        )}
                        {occ.dataSource && (
                          <span className="px-1 rounded bg-slate-900/60 text-slate-300 text-[8px] uppercase tracking-wider hidden sm:inline-block">
                            {occ.dataSource === 'RAILRADAR' ? 'RailRadar' : 'Sim'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Hover details card - Clean full width outside scroll canvas */}
    {hoveredEntity && (
      <div className="p-4 pt-0">
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-xs transition-all animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                {hoveredEntity.isBlock ? 'Block Detail' : `${hoveredEntity.trainNo} - ${hoveredEntity.name}`}
              </span>
              <StatusBadge status={hoveredEntity.status || 'SCHEDULED'} size="xs" />
              {hoveredEntity.freshness && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  hoveredEntity.freshness === 'LIVE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-blue-950 text-blue-300 border border-blue-700'
                }`}>
                  {hoveredEntity.freshness}
                </span>
              )}
            </div>
            <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
              Window: {hoveredEntity.startTime} - {hoveredEntity.endTime} IST
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            {hoveredEntity.isBlock ? (
              <>
                <div>
                  <span className="text-slate-400">Departments:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {hoveredEntity.departments?.join(', ')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Track Machine:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {hoveredEntity.machine}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Block Mode:</span>{' '}
                  <strong className="text-emerald-500">Integrated Shadow</strong>
                </div>
                <div>
                  <span className="text-slate-400">Plan Ref:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {hoveredEntity.planId}
                  </strong>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-slate-400">Live Speed:</span>{' '}
                  <strong className="text-cyan-400">
                    {hoveredEntity.speedKmh != null ? `${hoveredEntity.speedKmh} km/h` : '105 km/h'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Delay Status:</span>{' '}
                  <strong className={hoveredEntity.delayMins ? 'text-red-400' : 'text-emerald-400'}>
                    {hoveredEntity.delayMins ? `+${hoveredEntity.delayMins} mins` : 'Right Time (0m)'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Current Section:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {hoveredEntity.currentSection || 'NDLS-CNB-SEC-03'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Position Feed:</span>{' '}
                  <strong className={hoveredEntity.gpsAvailable ? 'text-emerald-400' : 'text-amber-400'}>
                    {hoveredEntity.gpsAvailable
                      ? `GPS AVAILABLE (${hoveredEntity.latitude?.toFixed(3)}, ${hoveredEntity.longitude?.toFixed(3)})`
                      : `STATION: ${hoveredEntity.currentStation || hoveredEntity.currentLocation || 'Section'}`}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Route Match:</span>{' '}
                  <strong className={hoveredEntity.routeMatchStatus === 'ROUTE_MATCH_UNCERTAIN' ? 'text-rose-400' : 'text-emerald-400'}>
                    {hoveredEntity.routeMatchStatus || 'MATCHED'} ({Math.round((hoveredEntity.routeMatchConfidence || 1.0) * 100)}%)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Data Source:</span>{' '}
                  <strong className="text-amber-400">
                    {hoveredEntity.dataSource || 'Simulation'} ({hoveredEntity.freshness || 'LIVE'})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Next Station:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {hoveredEntity.nextStation || 'Kanpur Central'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Telemetry Age:</span>{' '}
                  <strong className="text-slate-400">
                    {hoveredEntity.timestamp ? new Date(hoveredEntity.timestamp).toLocaleTimeString() : '10:31:12 IST'}
                  </strong>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
};
