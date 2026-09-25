import React, { useState, useEffect } from 'react';
import {
  Train, ShieldCheck, ArrowRight, Radio, ChevronRight,
  CheckCircle2, Layers, MapPin, Lock, Sparkles, Globe
} from 'lucide-react';
import { RailwayApiService } from '../services/api';

const ZONAL_RAILWAYS = [
  { code: 'WCR', name: 'West Central Railway', hq: 'Jabalpur', isPrimary: true,
    divisions: [{ name: 'Bhopal', active: true }, { name: 'Jabalpur', active: false }, { name: 'Kota', active: false }],
    electrified: '3000+ Route Km', kavach: '400+ Km' },
  { code: 'NR', name: 'Northern Railway', hq: 'New Delhi', isPrimary: false,
    divisions: [{ name: 'Delhi', active: true }, { name: 'Ambala', active: false }, { name: 'Firozpur', active: false }, { name: 'Lucknow', active: false }, { name: 'Moradabad', active: false }],
    electrified: '3800+ Route Km', kavach: '400+ Km' },
  { code: 'NCR', name: 'North Central Railway', hq: 'Prayagraj', isPrimary: false,
    divisions: [{ name: 'Prayagraj', active: true }, { name: 'Agra', active: false }, { name: 'Jhansi', active: false }],
    electrified: '3000+ Route Km', kavach: '400+ Km' },
  { code: 'WR', name: 'Western Railway', hq: 'Mumbai (Churchgate)', isPrimary: false,
    divisions: [{ name: 'Mumbai Central', active: true }, { name: 'Vadodara', active: false }, { name: 'Ratlam', active: false }, { name: 'Ahmedabad', active: false }],
    electrified: '3800+ Route Km', kavach: '400+ Km' },
  { code: 'CR', name: 'Central Railway', hq: 'Mumbai (CSMT)', isPrimary: false,
    divisions: [{ name: 'Mumbai CSMT', active: true }, { name: 'Bhusawal', active: false }, { name: 'Nagpur', active: false }, { name: 'Pune', active: false }],
    electrified: '3900+ Route Km', kavach: '350+ Km' },
  { code: 'ER', name: 'Eastern Railway', hq: 'Kolkata (Fairlie Place)', isPrimary: false,
    divisions: [{ name: 'Howrah', active: true }, { name: 'Sealdah', active: false }, { name: 'Asansol', active: false }, { name: 'Malda', active: false }],
    electrified: '2800+ Route Km', kavach: '320+ Km' },
  { code: 'SR', name: 'Southern Railway', hq: 'Chennai (Central)', isPrimary: false,
    divisions: [{ name: 'Chennai', active: true }, { name: 'Tiruchirappalli', active: false }, { name: 'Madurai', active: false }],
    electrified: '3400+ Route Km', kavach: '280+ Km' },
  { code: 'SCR', name: 'South Central Railway', hq: 'Secunderabad', isPrimary: false,
    divisions: [{ name: 'Secunderabad', active: true }, { name: 'Hyderabad', active: false }, { name: 'Vijayawada', active: false }],
    electrified: '3600+ Route Km', kavach: '1400+ Km' }
];

export const GatewayPage = ({ onSelectZone }) => {
  const [zonesList, setZonesList] = useState(ZONAL_RAILWAYS);
  const [selectedZone, setSelectedZone] = useState('WCR');

  useEffect(() => {
    let cancelled = false;
    RailwayApiService.getZones()
      .then(data => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          const merged = data.map(dz => {
            const staticMatch = ZONAL_RAILWAYS.find(z => z.code === dz.code);
            return {
              code: dz.code, name: dz.name,
              hq: dz.headquarters || staticMatch?.hq || 'Zonal HQ',
              isPrimary: dz.code === 'WCR',
              divisions: (dz.divisions || []).map(divName => ({ name: divName, active: divName === 'Bhopal' || divName === 'Delhi' || divName === 'Prayagraj' })),
              electrified: staticMatch?.electrified || '3000+ Route Km',
              kavach: staticMatch?.kavach || '400+ Km'
            };
          });
          setZonesList(merged);
        }
      })
      .catch(err => console.warn('[GatewayPage] Zones API fallback:', err.message));
    return () => { cancelled = true; };
  }, []);

  const handleZoneClick = (zone) => {
    setSelectedZone(zone.code);
    if (onSelectZone) onSelectZone(zone);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F8] text-[#172033] flex flex-col relative overflow-x-hidden font-sans">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid-pattern-light pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full border-b border-[#D9DEE7] bg-white shadow-sm">
        {/* Top navy banner */}
        <div className="bg-[#173B73] px-6 py-2 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-blue-200 uppercase tracking-widest">
            Government of India &bull; Ministry of Railways &bull; PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            COIS / FOIS LIVE LINK ACTIVE
          </span>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <img src="/assets/indian_railways_logo.png" alt="Indian Railways" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-black tracking-tight text-[#173B73]">
                PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration
              </h1>
              <p className="text-[11px] text-[#5B6575] font-medium">
                Railway Maintenance &amp; Block Planning Prototype &mdash; Zone Gateway
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EBF2FA] border border-[#D9DEE7] text-[10px] font-mono text-[#173B73]">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>MULTI-ZONE OPERATIONS CENTER</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">

        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2FA] border border-[#D9DEE7] text-[#173B73] text-xs font-mono font-bold tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            INDIAN RAILWAYS MULTI-ZONE HIERARCHICAL ENTRY
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#172033]">
            Select Your Zonal Railway Command Center
          </h2>
          <p className="text-sm text-[#5B6575] mt-2 max-w-2xl">
            Select an authorized Zonal Railway command center to enter the zone-specific secure authentication context.
            Access is strictly partitioned by zone and division authority.
          </p>
        </div>

        {/* Live ticker */}
        <div className="mb-6 px-4 py-2.5 rounded-xl bg-[#173B73] border border-[#1F4380] flex items-center justify-between gap-4 font-mono text-[11px] overflow-hidden">
          <div className="flex items-center gap-3 text-blue-200 font-semibold truncate">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
            <span className="truncate">
              &mdash; UP LINE / ON-LINE ACTIVE MONITORING &mdash; BHOPAL &mdash; ITARSI &mdash; JABALPUR &mdash; BINA QUADRANT &mdash;
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-300 font-bold flex-shrink-0">
            <Train className="w-3.5 h-3.5" />
            <span>TRAIN 12002 (SHATABDI EXP) - IN TRANSIT</span>
          </div>
        </div>

        {/* Zone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-2">
          {zonesList.map((zone) => {
            const isSelected = selectedZone === zone.code;
            return (
              <div
                key={zone.code}
                onClick={() => handleZoneClick(zone)}
                className={`group relative rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between p-4 bg-white hover:shadow-md ${
                  zone.isPrimary
                    ? 'border-[#173B73] shadow-md ring-1 ring-[#173B73]/20'
                    : isSelected
                    ? 'border-[#1F4380] shadow-sm ring-1 ring-[#1F4380]/20'
                    : 'border-[#D9DEE7] hover:border-[#173B73]'
                }`}
              >
                {zone.isPrimary && (
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-[#173B73] text-white text-[9px] font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    PRIMARY DEMO ZONE
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`text-2xl font-black font-mono tracking-tight transition-colors ${
                        zone.isPrimary ? 'text-[#173B73]' : 'text-[#172033] group-hover:text-[#173B73]'
                      }`}>
                        {zone.code}
                      </h3>
                      <p className="text-xs font-semibold text-[#5B6575] mt-0.5">{zone.name}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#168A55] border border-emerald-200 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#168A55] animate-pulse" />
                      OPERATIONAL
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#5B6575] font-mono mb-3">
                    <MapPin className="w-3 h-3 text-[#173B73] flex-shrink-0" />
                    <span>HQ: {zone.hq}</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#5B6575] uppercase mb-1.5">
                      <span>Divisions ({zone.divisions.length}):</span>
                      <span className="text-[#173B73] font-bold">
                        {zone.divisions.find(d => d.active)?.name || zone.divisions[0].name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.divisions.map((div) => (
                        <span
                          key={div.name}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            div.active
                              ? 'bg-[#EBF2FA] text-[#173B73] border-[#173B73]/30 font-semibold'
                              : 'bg-[#F4F6F8] text-[#5B6575] border-[#D9DEE7]'
                          }`}
                        >
                          {div.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#D9DEE7] font-mono text-[10px]">
                    <div>
                      <span className="text-[#5B6575] block text-[9px] uppercase font-bold">Electrified:</span>
                      <span className="text-[#172033] font-bold">{zone.electrified}</span>
                    </div>
                    <div>
                      <span className="text-[#5B6575] block text-[9px] uppercase font-bold">Kavach TCAS:</span>
                      <span className="text-[#168A55] font-bold">{zone.kavach}</span>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t border-[#D9DEE7] flex items-center justify-between text-xs font-mono font-bold transition-colors ${
                  zone.isPrimary ? 'text-[#173B73]' : 'text-[#5B6575] group-hover:text-[#173B73]'
                }`}>
                  <span>ENTER {zone.code} GATEWAY</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-6 pb-4 border-t border-[#D9DEE7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#5B6575]">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#173B73]" />
            <span>CENTRAL CRIS IDENTITY BROKER &bull; GOVT. OF INDIA CERTIFIED</span>
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
