import React from 'react';
import { useRailway } from '../../context/RailwayContext';

export const DigitalTwin = () => {
  const { selectedCorridor, telemetrySummary, liveTrains } = useRailway();

  // Primary Delhi - Kanpur Corridor stations
  const stations = [
    { code: 'NDLS', name: 'New Delhi', km: 0, status: 'NORMAL' },
    { code: 'PWL', name: 'Palwal', km: 60, status: 'NORMAL' },
    { code: 'AGC', name: 'Agra Cantt', km: 198, status: 'CAUTION' },
    { code: 'ETW', name: 'Etawah Jn', km: 308, status: 'NORMAL' },
    { code: 'CNB', name: 'Kanpur Central', km: 440, status: 'NORMAL' },
  ];

  const totalKm = 440;
  const trackHeight = 440;
  const topPad = 35;
  const bottomPad = 35;
  const usableHeight = trackHeight - topPad - bottomPad;

  const getY = (km) => topPad + (km / totalKm) * usableHeight;

  // Active trains moving along corridor
  const movingTrains = [
    { km: 35, trainNo: '12002', name: 'Shatabdi Exp', dir: 'DN', delayed: false, kavach: true },
    { km: 140, trainNo: '22436', name: 'Vande Bharat', dir: 'DN', delayed: false, kavach: true },
    { km: 240, trainNo: '12417', name: 'Prayagraj Exp', dir: 'UP', delayed: true, kavach: true },
    { km: 380, trainNo: 'FR-BCNHL', name: 'Grain Rake', dir: 'DN', delayed: false, kavach: false }
  ];

  // Active maintenance possessions
  const maintenanceBlocks = [
    {
      startKm: 160,
      endKm: 185,
      dept: 'P-WAY + TRD BUNDLE',
      track: 'UP MAIN',
      status: 'ACTIVE'
    }
  ];

  return (
    <div className="rounded-2xl border border-[#1A2744] bg-[#0C1422] p-5 sm:p-6 shadow-xl select-none relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22D3EE]" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base sm:text-lg font-mono">
                LIVE RAILWAY DIGITAL TWIN
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                HDN-1 CORRIDOR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time spatial visualization of moving trains, active track blocks, signals & conflict points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
          <span>SECTION: <strong className="text-slate-200">NDLS ↔ CNB</strong></span>
          <span>•</span>
          <span>440 TKm MONITORED</span>
        </div>
      </div>

      {/* SVG Corridor View */}
      <div className="my-6 flex justify-center overflow-x-auto">
        <svg
          width="520"
          height={trackHeight}
          viewBox={`0 0 520 ${trackHeight}`}
          className="max-w-full"
        >
          {/* Background corridor gradient */}
          <rect x="180" y={topPad - 10} width="160" height={usableHeight + 20} rx="12" fill="#080E1B" stroke="#141E34" strokeWidth="1" />

          {/* UP Main Rail Line */}
          <line x1="220" y1={topPad} x2="220" y2={trackHeight - bottomPad} stroke="#475569" strokeWidth="2.5" />
          <line x1="226" y1={topPad} x2="226" y2={trackHeight - bottomPad} stroke="#475569" strokeWidth="2.5" />

          {/* DOWN Main Rail Line */}
          <line x1="294" y1={topPad} x2="294" y2={trackHeight - bottomPad} stroke="#475569" strokeWidth="2.5" />
          <line x1="300" y1={topPad} x2="300" y2={trackHeight - bottomPad} stroke="#475569" strokeWidth="2.5" />

          {/* Track sleepers / cross ties */}
          {Array.from({ length: Math.floor(usableHeight / 14) }, (_, i) => {
            const yTie = topPad + i * 14;
            return (
              <g key={`tie-${i}`}>
                <line x1="214" y1={yTie} x2="232" y2={yTie} stroke="#1E293B" strokeWidth="2" />
                <line x1="288" y1={yTie} x2="306" y2={yTie} stroke="#1E293B" strokeWidth="2" />
              </g>
            );
          })}

          {/* Track Labels */}
          <text x="223" y={topPad - 14} fontSize="8" fontFamily="monospace" fill="#94A3B8" textAnchor="middle" fontWeight="bold">
            UP LINE ↑
          </text>
          <text x="297" y={topPad - 14} fontSize="8" fontFamily="monospace" fill="#94A3B8" textAnchor="middle" fontWeight="bold">
            DN LINE ↓
          </text>

          {/* Active Maintenance Zone Pulse */}
          {maintenanceBlocks.map((block, idx) => {
            const y1 = getY(block.startKm);
            const y2 = getY(block.endKm);
            const height = Math.max(y2 - y1, 28);

            return (
              <g key={`maint-${idx}`}>
                {/* Glowing area */}
                <rect
                  x="210"
                  y={y1}
                  width="36"
                  height={height}
                  rx="6"
                  fill="rgba(245, 158, 11, 0.18)"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
                {/* Label badge */}
                <rect x="80" y={y1 + height / 2 - 10} width="120" height="20" rx="4" fill="#1C1507" stroke="#F59E0B" strokeWidth="1" />
                <text x="140" y={y1 + height / 2 + 3} fontSize="8" fontFamily="monospace" fill="#FBBF24" textAnchor="middle" fontWeight="bold">
                  ⚠ {block.dept}
                </text>
              </g>
            );
          })}

          {/* Stations along the corridor */}
          {stations.map((stn, i) => {
            const y = getY(stn.km);
            const isTerminal = i === 0 || i === stations.length - 1;

            return (
              <g key={stn.code}>
                {/* Station crossbar */}
                <line x1="200" y1={y} x2="320" y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

                {/* Station dot indicator */}
                <circle
                  cx="260"
                  cy={y}
                  r={isTerminal ? 6 : 4}
                  fill={isTerminal ? '#10B981' : '#38BDF8'}
                  stroke="#080E1B"
                  strokeWidth="2"
                  className={isTerminal ? 'animate-pulse' : ''}
                />

                {/* Station Code & Name on Left */}
                <text x="175" y={y + 3} fontSize="10" fontFamily="monospace" fill="#FFFFFF" textAnchor="end" fontWeight="bold">
                  ● {stn.name}
                </text>
                <text x="175" y={y + 13} fontSize="8" fontFamily="monospace" fill="#64748B" textAnchor="end">
                  ({stn.code}) • Km {stn.km}
                </text>

                {/* Signaling light indicator on Right */}
                <g transform={`translate(330, ${y - 6})`}>
                  <rect x="0" y="0" width="8" height="14" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="0.5" />
                  <circle
                    cx="4"
                    cy="4"
                    r="2"
                    fill={stn.status === 'CAUTION' ? '#F59E0B' : '#10B981'}
                    className="animate-pulse"
                  />
                  <circle cx="4" cy="10" r="2" fill="#1E293B" />
                </g>
              </g>
            );
          })}

          {/* Live Moving Trains */}
          {movingTrains.map((train, i) => {
            const y = getY(train.km);
            const isUp = train.dir === 'UP';
            const xTrack = isUp ? 223 : 297;

            return (
              <g key={train.trainNo} className="transition-all duration-1000">
                {/* Train Vehicle */}
                <rect
                  x={xTrack - 12}
                  y={y - 8}
                  width="24"
                  height="16"
                  rx="3"
                  fill={train.delayed ? '#991B1B' : '#0369A1'}
                  stroke={train.delayed ? '#EF4444' : '#38BDF8'}
                  strokeWidth="1.5"
                  className={train.delayed ? 'animate-pulse' : ''}
                />
                {/* Train Emoji/Icon */}
                <text x={xTrack} y={y + 4} fontSize="8" fontFamily="sans-serif" fill="white" textAnchor="middle">
                  🚆
                </text>

                {/* Train Info Card */}
                {isUp ? (
                  <g>
                    <text x={xTrack - 18} y={y - 1} fontSize="8" fontFamily="monospace" fill={train.delayed ? '#FCA5A5' : '#7DD3FC'} textAnchor="end" fontWeight="bold">
                      {train.trainNo} ↑
                    </text>
                    <text x={xTrack - 18} y={y + 8} fontSize="7" fontFamily="monospace" fill="#94A3B8" textAnchor="end">
                      {train.delayed ? 'DELAYED (+14m)' : 'ON TIME'}
                    </text>
                  </g>
                ) : (
                  <g>
                    <text x={xTrack + 18} y={y - 1} fontSize="8" fontFamily="monospace" fill={train.delayed ? '#FCA5A5' : '#7DD3FC'} textAnchor="start" fontWeight="bold">
                      ↓ {train.trainNo}
                    </text>
                    <text x={xTrack + 18} y={y + 8} fontSize="7" fontFamily="monospace" fill="#94A3B8" textAnchor="start">
                      {train.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-center gap-5 flex-wrap text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Terminal Station</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-sky-600 border border-sky-400" /> On-Time Train</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-red-700 border border-red-500" /> Delayed Train</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-amber-500/30 border border-amber-500" /> Active Block Zone</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Caution Signal Aspect</span>
      </div>
    </div>
  );
};
