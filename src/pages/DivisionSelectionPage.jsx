import React, { useState } from 'react';
import {
  Train,
  ShieldCheck,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Activity,
  Zap,
  Radio,
  Layers,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Gauge
} from 'lucide-react';

// Comprehensive Divisional Data for Indian Railways Zones
const DIVISION_REGISTRY = {
  WCR: [
    {
      code: 'BPL',
      name: 'Bhopal Division',
      hq: 'Bhopal Junction (BPL)',
      tag: 'PRIMARY ACTIVE COMMAND CENTER',
      isPrimary: true,
      routeKm: '1,024 Route Km',
      electrified: '100% High-Rise OHE',
      kavach: 'Active (BPL–SEH Section)',
      sectionSpeed: '130 km/h',
      corridors: ['Bhopal – Sehore (BPL-SEH)', 'Bhopal – Itarsi (BPL-ET)', 'Bina – Bhopal'],
      activeBlocksToday: 6,
      readyStatus: 'OPERATIONAL'
    },
    {
      code: 'JBP',
      name: 'Jabalpur Division',
      hq: 'Jabalpur Junction (JBP)',
      tag: 'ZONAL HEADQUARTERS DIVISION',
      isPrimary: false,
      routeKm: '1,148 Route Km',
      electrified: '100% Electrified',
      kavach: 'Phase-2 In Progress',
      sectionSpeed: '120 km/h',
      corridors: ['Jabalpur – Itarsi', 'Katni – Jabalpur', 'Satna – Rewa'],
      activeBlocksToday: 4,
      readyStatus: 'READY'
    },
    {
      code: 'KTT',
      name: 'Kota Division',
      hq: 'Kota Junction (KTT)',
      tag: 'HIGH SPEED WESTERN TRUNK ARTERY',
      isPrimary: false,
      routeKm: '1,003 Route Km',
      electrified: '100% Electrified',
      kavach: 'Active (280 Km)',
      sectionSpeed: '130 km/h',
      corridors: ['Nagda – Kota – Sawai Madhopur', 'Kota – Chanderiya'],
      activeBlocksToday: 3,
      readyStatus: 'READY'
    },
    {
      code: 'INDB',
      name: 'Indore / Malwa Hub',
      hq: 'Indore Junction (INDB)',
      tag: 'INTER-ZONAL FREIGHT & PASSENGER LINK',
      isPrimary: false,
      routeKm: '890 Route Km',
      electrified: '100% Electrified',
      kavach: 'Active Section',
      sectionSpeed: '110 km/h',
      corridors: ['Ujjain – Indore – Dewas', 'Maksi – Bhopal Link'],
      activeBlocksToday: 2,
      readyStatus: 'READY'
    }
  ],
  NR: [
    {
      code: 'DLI',
      name: 'Delhi Division',
      hq: 'New Delhi (NDLS)',
      tag: 'PRIMARY NORTHERN COMMAND CENTER',
      isPrimary: true,
      routeKm: '1,420 Route Km',
      electrified: '100% Electrified',
      kavach: 'Active (400+ Km)',
      sectionSpeed: '130 km/h',
      corridors: ['Delhi – Ghaziabad – Aligarh', 'Delhi – Ambala Trunk'],
      activeBlocksToday: 8,
      readyStatus: 'OPERATIONAL'
    },
    {
      code: 'UMB',
      name: 'Ambala Division',
      hq: 'Ambala Cantt (UMB)',
      tag: 'NORTHERN TRUNK INTERCHANGE',
      isPrimary: false,
      routeKm: '1,120 Route Km',
      electrified: '100% Electrified',
      kavach: 'Phase-2',
      sectionSpeed: '120 km/h',
      corridors: ['Ambala – Saharanpur', 'Ambala – Kalka'],
      activeBlocksToday: 3,
      readyStatus: 'READY'
    },
    {
      code: 'LKO',
      name: 'Lucknow Division',
      hq: 'Lucknow Charbagh (LKO)',
      tag: 'CENTRAL NORTHERN DIVISION',
      isPrimary: false,
      routeKm: '1,280 Route Km',
      electrified: '100% Electrified',
      kavach: 'Under Deployment',
      sectionSpeed: '120 km/h',
      corridors: ['Lucknow – Kanpur', 'Lucknow – Varanasi'],
      activeBlocksToday: 5,
      readyStatus: 'READY'
    },
    {
      code: 'MB',
      name: 'Moradabad Division',
      hq: 'Moradabad (MB)',
      tag: 'NORTHERN FREIGHT & PASSENGER',
      isPrimary: false,
      routeKm: '980 Route Km',
      electrified: '100% Electrified',
      kavach: 'Phase-2',
      sectionSpeed: '110 km/h',
      corridors: ['Moradabad – Bareilly', 'Moradabad – Ghaziabad'],
      activeBlocksToday: 2,
      readyStatus: 'READY'
    }
  ],
  NCR: [
    {
      code: 'PRYJ',
      name: 'Prayagraj Division',
      hq: 'Prayagraj Junction (PRYJ)',
      tag: 'PRIMARY HIGH-DENSITY CORRIDOR',
      isPrimary: true,
      routeKm: '1,180 Route Km',
      electrified: '100% Electrified',
      kavach: 'Active (350 Km)',
      sectionSpeed: '130 km/h',
      corridors: ['Ghaziabad – Kanpur – Prayagraj', 'Prayagraj – Pt. Deen Dayal Upadhyay'],
      activeBlocksToday: 7,
      readyStatus: 'OPERATIONAL'
    },
    {
      code: 'AGC',
      name: 'Agra Division',
      hq: 'Agra Cantt (AGC)',
      tag: 'TAJ EXPRESSWAY TRUNK',
      isPrimary: false,
      routeKm: '850 Route Km',
      electrified: '100% Electrified',
      kavach: 'Active (180 Km)',
      sectionSpeed: '160 km/h (Gatimaan Section)',
      corridors: ['Palwal – Agra – Dholpur'],
      activeBlocksToday: 4,
      readyStatus: 'READY'
    },
    {
      code: 'JHS',
      name: 'Jhansi Division',
      hq: 'Virangana Lakshmibai Jhansi (VGLJ)',
      tag: 'CENTRAL NORTH ARTERY',
      isPrimary: false,
      routeKm: '1,200 Route Km',
      electrified: '100% Electrified',
      kavach: 'Phase-2',
      sectionSpeed: '130 km/h',
      corridors: ['Agra – Jhansi – Bina', 'Jhansi – Kanpur'],
      activeBlocksToday: 3,
      readyStatus: 'READY'
    }
  ],
  WR: [
    {
      code: 'MMCT',
      name: 'Mumbai Central Division',
      hq: 'Mumbai Central (MMCT)',
      tag: 'PRIMARY SUBURBAN & HIGH-SPEED HUB',
      isPrimary: true,
      routeKm: '950 Route Km',
      electrified: '100% Electrified',
      kavach: 'Active Suburban & Trunk',
      sectionSpeed: '130 km/h',
      corridors: ['Churchgate – Virar – Dahanu', 'Mumbai – Surat Trunk'],
      activeBlocksToday: 9,
      readyStatus: 'OPERATIONAL'
    },
    {
      code: 'RTM',
      name: 'Ratlam Division',
      hq: 'Ratlam Junction (RTM)',
      tag: 'MALWA & WESTERN INTERCHANGE',
      isPrimary: false,
      routeKm: '1,190 Route Km',
      electrified: '100% Electrified',
      kavach: 'Active Deployment',
      sectionSpeed: '130 km/h',
      corridors: ['Godhra – Ratlam – Nagda', 'Ratlam – Indore – Ujjain'],
      activeBlocksToday: 5,
      readyStatus: 'READY'
    },
    {
      code: 'ADI',
      name: 'Ahmedabad Division',
      hq: 'Ahmedabad Junction (ADI)',
      tag: 'GUJARAT INDUSTRIAL CORRIDOR',
      isPrimary: false,
      routeKm: '1,080 Route Km',
      electrified: '100% Electrified',
      kavach: 'Phase-2',
      sectionSpeed: '130 km/h',
      corridors: ['Ahmedabad – Vadodara', 'Ahmedabad – Palanpur'],
      activeBlocksToday: 4,
      readyStatus: 'READY'
    }
  ],
  CR: [
    {
      code: 'CSMT',
      name: 'Mumbai CSMT Division',
      hq: 'Chhatrapati Shivaji Maharaj Terminus',
      tag: 'PRIMARY SUBURBAN & GHAT CORRIDOR',
      isPrimary: true,
      routeKm: '920 Route Km',
      electrified: '100% Electrified',
      kavach: 'Active (300 Km)',
      sectionSpeed: '120 km/h',
      corridors: ['CSMT – Kalyan – Kasara (Thull Ghat)', 'CSMT – Kalyan – Karjat (Bhor Ghat)'],
      activeBlocksToday: 8,
      readyStatus: 'OPERATIONAL'
    },
    {
      code: 'BSL',
      name: 'Bhusawal Division',
      hq: 'Bhusawal Junction (BSL)',
      tag: 'CENTRAL FREIGHT & PASSENGER JUNCTION',
      isPrimary: false,
      routeKm: '1,240 Route Km',
      electrified: '100% Electrified',
      kavach: 'Phase-2',
      sectionSpeed: '130 km/h',
      corridors: ['Igatpuri – Bhusawal – Khandwa', 'Bhusawal – Badnera'],
      activeBlocksToday: 5,
      readyStatus: 'READY'
    },
    {
      code: 'PUNE',
      name: 'Pune Division',
      hq: 'Pune Junction (PUNE)',
      tag: 'WESTERN DECCAN ARTERY',
      isPrimary: false,
      routeKm: '880 Route Km',
      electrified: '100% Electrified',
      kavach: 'Active Deployment',
      sectionSpeed: '120 km/h',
      corridors: ['Lonavala – Pune – Daund', 'Pune – Miraj'],
      activeBlocksToday: 4,
      readyStatus: 'READY'
    }
  ]
};

// Fallback generic division generator if zone not explicitly mapped
function getDivisionsForZone(zone) {
  const code = (typeof zone === 'object' ? zone?.code : zone) || 'WCR';
  if (DIVISION_REGISTRY[code]) {
    return DIVISION_REGISTRY[code];
  }
  // If zone has divisions array from static or backend
  if (zone?.divisions && Array.isArray(zone.divisions)) {
    return zone.divisions.map((d, i) => {
      const dName = typeof d === 'object' ? d.name : d;
      return {
        code: dName.substring(0, 3).toUpperCase(),
        name: `${dName} Division`,
        hq: `${dName} Junction`,
        tag: i === 0 ? 'PRIMARY DIVISION' : 'OPERATIONAL DIVISION',
        isPrimary: i === 0,
        routeKm: `${800 + i * 150} Route Km`,
        electrified: '100% Electrified',
        kavach: 'Active Deployment',
        sectionSpeed: '120 km/h',
        corridors: [`${dName} Main Line`, `${dName} Yard & Outer`],
        activeBlocksToday: 3,
        readyStatus: 'READY'
      };
    });
  }
  return DIVISION_REGISTRY.WCR;
}

export const DivisionSelectionPage = ({ selectedZone, onSelectDivision, onBackToGateway }) => {
  const zoneCode = (typeof selectedZone === 'object' ? selectedZone?.code : selectedZone) || 'WCR';
  const zoneName = (typeof selectedZone === 'object' ? selectedZone?.name : null) ||
    (zoneCode === 'WCR' ? 'West Central Railway' : `${zoneCode} Railway`);
  const zonalHq = (typeof selectedZone === 'object' ? selectedZone?.hq : null) ||
    (zoneCode === 'WCR' ? 'Jabalpur' : 'Zonal HQ');

  const divisions = getDivisionsForZone(selectedZone);
  const [selectedDivCode, setSelectedDivCode] = useState(() => {
    return divisions.find(d => d.isPrimary)?.code || divisions[0]?.code;
  });

  const handleCardClick = (div) => {
    setSelectedDivCode(div.code);
    if (onSelectDivision) {
      onSelectDivision(div);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F8] text-[#172033] flex flex-col relative overflow-x-hidden font-sans">
      <div className="absolute inset-0 bg-grid-pattern-light opacity-50 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full border-b border-[#D9DEE7] bg-white shadow-sm">
        {/* Top navy stripe */}
        <div className="bg-[#173B73] px-6 py-2 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-blue-200 uppercase tracking-widest">
            Government of India &bull; Ministry of Railways &bull; PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DIVISIONAL ENTRY GATEWAY
          </span>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <img src="/assets/indian_railways_logo.png" alt="Indian Railways" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-sm md:text-base font-black tracking-tight text-[#173B73] flex items-center gap-2">
                <span>PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration</span>
                <span className="text-[#5B6575] font-normal">|</span>
                <span className="text-[#1F4380] font-semibold text-xs md:text-sm">
                  {zoneName} ({zoneCode})
                </span>
              </h1>
              <p className="text-[11px] font-mono text-[#5B6575]">Railway Maintenance &amp; Block Planning Prototype</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onBackToGateway && (
              <button
                onClick={onBackToGateway}
                className="px-3.5 py-1.5 rounded-lg bg-[#F4F6F8] border border-[#D9DEE7] text-xs font-mono font-medium text-[#172033] hover:text-[#173B73] hover:border-[#173B73] transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#173B73]" />
                <span>CHANGE RAILWAY ZONE</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EBF2FA] border border-[#D9DEE7] text-[11px] font-mono text-[#173B73]">
              <MapPin className="w-3.5 h-3.5 text-[#173B73]" />
              <span>Zonal HQ: {zonalHq}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col justify-start">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#5B6575] mb-6">
          <button onClick={onBackToGateway} className="hover:text-[#173B73] transition-colors">
            <span>Indian Railways Zones</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#D9DEE7]" />
          <span className="text-[#173B73] font-bold bg-[#EBF2FA] px-2 py-0.5 rounded border border-[#D9DEE7]">
            {zoneCode} — {zoneName}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#D9DEE7]" />
          <span className="text-[#D98C00] font-semibold">Select Operational Division</span>
        </div>

        {/* Section Headline */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#173B73] uppercase mb-2">
                <Layers className="w-4 h-4 text-[#173B73]" />
                OPERATIONAL DIVISION ENTRY SELECTION
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
                Select Your Divisional Command Center
              </h2>
              <p className="text-xs sm:text-sm text-[#5B6575] mt-1 max-w-2xl font-sans">
                Each division operates dedicated Corridor Control, Section Officers, Maintenance Depots,
                and real-time telemetry. Select a division below to proceed to officer authentication.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white border border-[#D9DEE7] text-right">
                <span className="block text-[10px] font-mono text-[#5B6575] uppercase tracking-wider">
                  Divisions Available
                </span>
                <span className="text-lg font-mono font-black text-[#168A55]">
                  {divisions.length} Units
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divisions Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {divisions.map((div) => {
            const isSelected = selectedDivCode === div.code;
            return (
              <div
                key={div.code}
                onClick={() => handleCardClick(div)}
                className={`relative rounded-xl p-5 transition-all duration-200 cursor-pointer border flex flex-col justify-between group bg-white hover:shadow-md ${
                  isSelected
                    ? 'border-[#173B73] shadow-md ring-1 ring-[#173B73]/20'
                    : div.isPrimary
                    ? 'border-[#173B73]/50 shadow-sm'
                    : 'border-[#D9DEE7] hover:border-[#173B73]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-base border transition-all ${
                          div.isPrimary
                            ? 'bg-[#173B73] text-white border-[#1F4380]'
                            : 'bg-[#EBF2FA] text-[#173B73] border-[#D9DEE7] group-hover:border-[#173B73]/40'
                        }`}
                      >
                        {div.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#172033] tracking-tight group-hover:text-[#173B73] transition-colors">
                            {div.name}
                          </h3>
                          {div.isPrimary && (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EBF2FA] text-[#173B73] border border-[#173B73]/30">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-[#5B6575] flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#5B6575]" />
                          <span>HQ: {div.hq}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2.5 py-1 rounded-md border font-semibold ${
                        div.readyStatus === 'OPERATIONAL'
                          ? 'bg-emerald-50 text-[#168A55] border-emerald-200'
                          : 'bg-[#EBF2FA] text-[#173B73] border-[#D9DEE7]'
                      }`}
                    >
                      {div.readyStatus}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] font-mono tracking-wider text-[#D98C00] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {div.tag}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-[#F4F6F8] border border-[#D9DEE7] mb-4 text-xs font-mono">
                    <div>
                      <span className="block text-[9px] text-[#5B6575] uppercase tracking-wider">Route Length</span>
                      <span className="font-bold text-[#172033]">{div.routeKm}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#5B6575] uppercase tracking-wider">Traction</span>
                      <span className="font-bold text-[#168A55] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#D98C00]" />100% OHE
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#5B6575] uppercase tracking-wider">Kavach TCAS</span>
                      <span className="font-bold text-[#173B73] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#173B73]" />
                        {div.kavach.includes('Active') ? 'Active' : 'Deploying'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-[#5B6575] uppercase tracking-wider block mb-1.5">Key Corridors:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {div.corridors.map((c, i) => (
                        <span key={i} className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#F4F6F8] text-[#5B6575] border border-[#D9DEE7]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D9DEE7] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5B6575]">
                    <Radio className="w-3.5 h-3.5 text-[#168A55] animate-pulse" />
                    <span>Live Telemetry Feeds Connected</span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleCardClick(div); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all ${
                      div.isPrimary
                        ? 'bg-[#173B73] hover:bg-[#1F4380] text-white shadow-md'
                        : 'bg-[#EBF2FA] hover:bg-[#173B73] hover:text-white text-[#173B73] border border-[#D9DEE7] hover:border-[#173B73]'
                    }`}
                  >
                    <span>ENTER {div.code}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Access Notice */}
        <div className="mt-auto py-4 px-6 rounded-xl bg-white border border-[#D9DEE7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#5B6575]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#168A55]" />
            <span>
              Indian Railways Zonal Multi-Tenant Security Boundary Enforced. Officers must authenticate with division-authorized credentials.
            </span>
          </div>
          <div className="text-[10px] text-[#5B6575]">
            CRIS &bull; G&amp;SR Section 4.12
          </div>
        </div>
      </main>
    </div>
  );
};
