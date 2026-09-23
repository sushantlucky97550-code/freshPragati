import React, { useState, useEffect } from 'react';
import {
  Train,
  ShieldCheck,
  ArrowRight,
  Radio,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Zap,
  Globe,
  Layers,
  Sparkles,
  MapPin,
  Lock
} from 'lucide-react';
import { RailwayApiService } from '../services/api';

const ZONAL_RAILWAYS = [
  {
    code: 'WCR',
    name: 'West Central Railway',
    hq: 'Jabalpur',
    isPrimary: true,
    divisions: [
      { name: 'Bhopal', active: true },
      { name: 'Jabalpur', active: false },
      { name: 'Kota', active: false }
    ],
    electrified: '3000+ Route Km',
    kavach: '400+ Km',
    zoneColor: 'from-blue-600 to-indigo-900',
    borderGlow: 'border-blue-500/60 shadow-blue-900/30'
  },
  {
    code: 'NR',
    name: 'Northern Railway',
    hq: 'New Delhi',
    isPrimary: false,
    divisions: [
      { name: 'Delhi', active: true },
      { name: 'Ambala', active: false },
      { name: 'Firozpur', active: false },
      { name: 'Lucknow', active: false },
      { name: 'Moradabad', active: false }
    ],
    electrified: '3800+ Route Km',
    kavach: '400+ Km',
    zoneColor: 'from-slate-700 to-slate-900',
    borderGlow: 'border-slate-700/60'
  },
  {
    code: 'NCR',
    name: 'North Central Railway',
    hq: 'Prayagraj',
    isPrimary: false,
    divisions: [
      { name: 'Prayagraj', active: true },
      { name: 'Agra', active: false },
      { name: 'Jhansi', active: false }
    ],
    electrified: '3000+ Route Km',
    kavach: '400+ Km',
    zoneColor: 'from-slate-700 to-slate-900',
    borderGlow: 'border-slate-700/60'
  },
  {
    code: 'WR',
    name: 'Western Railway',
    hq: 'Mumbai (Churchgate)',
    isPrimary: false,
    divisions: [
      { name: 'Mumbai Central', active: true },
      { name: 'Vadodara', active: false },
      { name: 'Ratlam', active: false },
      { name: 'Ahmedabad', active: false },
      { name: 'Rajkot', active: false },
      { name: 'Bhavnagar', active: false }
    ],
    electrified: '3800+ Route Km',
    kavach: '400+ Km',
    zoneColor: 'from-slate-700 to-slate-900',
    borderGlow: 'border-slate-700/60'
  },
  {
    code: 'CR',
    name: 'Central Railway',
    hq: 'Mumbai (CSMT)',
    isPrimary: false,
    divisions: [
      { name: 'Mumbai CSMT', active: true },
      { name: 'Bhusawal', active: false },
      { name: 'Nagpur', active: false },
      { name: 'Pune', active: false },
      { name: 'Solapur', active: false }
    ],
    electrified: '3900+ Route Km',
    kavach: '350+ Km',
    zoneColor: 'from-slate-700 to-slate-900',
    borderGlow: 'border-slate-700/60'
  },
  {
    code: 'ER',
    name: 'Eastern Railway',
    hq: 'Kolkata (Fairlie Place)',
    isPrimary: false,
    divisions: [
      { name: 'Howrah', active: true },
      { name: 'Sealdah', active: false },
      { name: 'Asansol', active: false },
      { name: 'Malda', active: false }
    ],
    electrified: '2800+ Route Km',
    kavach: '320+ Km',
    zoneColor: 'from-slate-700 to-slate-900',
    borderGlow: 'border-slate-700/60'
  },
  {
    code: 'SR',
    name: 'Southern Railway',
    hq: 'Chennai (Central)',
    isPrimary: false,
    divisions: [
      { name: 'Chennai', active: true },
      { name: 'Tiruchirappalli', active: false },
      { name: 'Madurai', active: false },
      { name: 'Palakkad', active: false },
      { name: 'Salem', active: false },
      { name: 'Thiruvananthapuram', active: false }
    ],
    electrified: '3400+ Route Km',
    kavach: '280+ Km',
    zoneColor: 'from-slate-700 to-slate-900',
    borderGlow: 'border-slate-700/60'
  },
  {
    code: 'SCR',
    name: 'South Central Railway',
    hq: 'Secunderabad',
    isPrimary: false,
    divisions: [
      { name: 'Secunderabad', active: true },
      { name: 'Hyderabad', active: false },
      { name: 'Vijayawada', active: false },
      { name: 'Guntakal', active: false },
      { name: 'Guntur', active: false },
      { name: 'Nanded', active: false }
    ],
    electrified: '3600+ Route Km',
    kavach: '1400+ Km',
    zoneColor: 'from-slate-700 to-slate-900',
    borderGlow: 'border-slate-700/60'
  }
];

export const GatewayPage = ({ onSelectZone }) => {
  const [zonesList, setZonesList] = useState(ZONAL_RAILWAYS);
  const [selectedZone, setSelectedZone] = useState('WCR');

  useEffect(() => {
    let cancelled = false;
    RailwayApiService.getZones()
      .then(data => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          // Merge dynamic zones with rich frontend visuals
          const merged = data.map(dz => {
            const staticMatch = ZONAL_RAILWAYS.find(z => z.code === dz.code);
            return {
              code: dz.code,
              name: dz.name,
              hq: dz.headquarters || staticMatch?.hq || 'Zonal HQ',
              isPrimary: dz.code === 'WCR',
              divisions: (dz.divisions || []).map(divName => ({
                name: divName,
                active: divName === 'Bhopal' || divName === 'Delhi' || divName === 'Prayagraj'
              })),
              electrified: staticMatch?.electrified || '3000+ Route Km',
              kavach: staticMatch?.kavach || '400+ Km',
              zoneColor: staticMatch?.zoneColor || 'from-slate-700 to-slate-900',
              borderGlow: staticMatch?.borderGlow || 'border-slate-700/60'
            };
          });
          setZonesList(merged);
        }
      })
      .catch(err => {
        console.warn('[GatewayPage] Zones API fallback:', err.message);
      });
    return () => { cancelled = true; };
  }, []);

  const handleZoneClick = (zone) => {
    setSelectedZone(zone.code);
    if (onSelectZone) {
      onSelectZone(zone);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050B14] text-white flex flex-col relative overflow-x-hidden selection:bg-red-700 selection:text-white font-sans">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0E182A_1px,transparent_1px),linear-gradient(to_bottom,#0E182A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35 pointer-events-none" />
      
      {/* Subtle railway track line in background */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-950/20 to-transparent pointer-events-none" />

      {/* Top Ministry & System Banner */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-[#070D18]/90 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-950/50">
              <Train className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  NETWORK SECURE
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                RailOpt AI — Indian Railways Command Gateway
                <span className="text-slate-400 font-normal text-xs sm:text-sm hidden sm:inline">
                  | Multi-Zone Operations Center
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/80 border border-blue-800 text-[10px] font-mono text-cyan-400">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>CENTRAL COIS / FOIS LIVE LINK ACTIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto my-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-700/50 text-blue-300 text-xs font-mono font-bold tracking-wider">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            INDIAN RAILWAYS MULTI-ZONE HIERARCHICAL ENTRY
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            RailOpt AI — Indian Railways Command Gateway
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Select an authorized Zonal Railway command center to enter the zone-specific secure authentication context. Access to block planning, maintenance coordination, and corridor digital twins is strictly partitioned by zone and division authority.
          </p>
        </div>

        {/* Live Active Corridor Status Ticker */}
        <div className="my-5 px-4 py-2.5 rounded-xl bg-[#091122]/90 border border-slate-800/80 shadow-md flex items-center justify-between gap-4 font-mono text-[11px] overflow-hidden">
          <div className="flex items-center gap-3 text-cyan-400 font-semibold truncate">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
            <span className="truncate">
              -- UP LINE / ON-LINE ACTIVE MONITORING -- BHOPAL -- ITARSI -- JABALPUR -- BINA QUADRANT --
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-300 font-bold flex-shrink-0">
            <Train className="w-3.5 h-3.5" />
            <span>TRAIN 12002 (SHATABDI EXP) - IN TRANSIT</span>
          </div>
        </div>

        {/* Zonal Railway Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 my-6">
          {zonesList.map((zone) => {
            const isSelected = selectedZone === zone.code;
            return (
              <div
                key={zone.code}
                onClick={() => handleZoneClick(zone)}
                className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between p-5 bg-[#0A1324]/80 backdrop-blur-sm hover:bg-[#0E1A32] ${
                  zone.isPrimary
                    ? 'border-blue-500/70 shadow-xl shadow-blue-950/50 hover:border-blue-400'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Primary Demo Zone Badge */}
                {zone.isPrimary && (
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-mono font-bold tracking-wider uppercase shadow-md border border-blue-300/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    PRIMARY DEMO ZONE
                  </div>
                )}

                <div>
                  {/* Card Header: Code, Status */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-black font-mono tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                        {zone.code}
                      </h3>
                      <p className="text-xs font-semibold text-slate-300 mt-0.5">
                        {zone.name}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      OPERATIONAL
                    </span>
                  </div>

                  {/* HQ */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mb-4">
                    <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span>HQ: {zone.hq}</span>
                  </div>

                  {/* Divisions */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase mb-2">
                      <span>Divisions ({zone.divisions.length}):</span>
                      <span className="text-cyan-400 font-bold">
                        {zone.divisions.find(d => d.active)?.name || zone.divisions[0].name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.divisions.map((div) => (
                        <span
                          key={div.name}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                            div.active
                              ? 'bg-blue-950/80 text-blue-200 border-blue-600/60 font-semibold'
                              : 'bg-slate-900/60 text-slate-400 border-slate-800'
                          }`}
                        >
                          {div.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Operational stats */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-500 block text-[9px]">ELECTRIFIED:</span>
                      <span className="text-slate-200 font-bold">{zone.electrified}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">KAVACH TCAS:</span>
                      <span className="text-emerald-400 font-bold">{zone.kavach}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Button */}
                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">
                  <span>ENTER {zone.code} GATEWAY</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Security Compliance Bar */}
        <footer className="mt-auto pt-6 pb-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>CENTRAL CRIS IDENTITY BROKER • GOVT. OF INDIA CERTIFIED</span>
          </div>
          <div className="flex items-center gap-4">
            <span>VERSION: RailOpt-AI v4.2-STABLE</span>
            <span>ENCRYPTION: AES-256 GCM</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
