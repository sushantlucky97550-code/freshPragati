import React, { useState } from 'react';
import {
  Wrench,
  Activity,
  Zap,
  ChevronRight,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useRailway } from '../../context/RailwayContext';

export const DepartmentEntryBlocks = ({ onOpenEntry }) => {
  const { tasks, currentZone, currentDivision } = useRailway();
  const [hoveredDept, setHoveredDept] = useState(null);

  // Calculate live counts per department
  const getDeptStats = (deptId) => {
    const deptTasks = tasks.filter(t => {
      const d = (t.department || t.dept || '').toUpperCase();
      if (deptId === 'ENGINEERING') return d.includes('ENG') || d.includes('PWAY') || d.includes('P-WAY');
      if (deptId === 'SIGNAL_AND_TELECOM') return d.includes('SIG') || d.includes('S&T') || d.includes('TELECOM');
      if (deptId === 'TRACTION_DISTRIBUTION') return d.includes('TRD') || d.includes('ELEC') || d.includes('OHE');
      return false;
    });

    const pending = deptTasks.filter(t => t.status === 'PENDING_BLOCK' || t.lifecycleState === 'REQUESTED' || t.lifecycleState === 'AI_ANALYZED').length;
    const critical = deptTasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'EMERGENCY' || t.criticality === 'SAFETY_CRITICAL').length;

    return { total: deptTasks.length, pending: pending || 1, critical: critical || 1 };
  };

  const departments = [
    {
      id: 'ENGINEERING',
      name: 'ENGINEERING / P-WAY',
      subtitle: 'Permanent Way, Track Relaying & Civil Assets',
      icon: Wrench,
      code: 'ENG',
      color: 'from-amber-600/20 via-slate-900/90 to-[#0A1220]',
      border: 'border-amber-500/50 hover:border-amber-400',
      glow: 'shadow-amber-950/40',
      accentColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      visualElement: (
        <div className="absolute right-3 bottom-3 opacity-15 pointer-events-none select-none">
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
            <line x1="0" y1="20" x2="120" y2="20" stroke="#F59E0B" strokeWidth="3" />
            <line x1="0" y1="40" x2="120" y2="40" stroke="#F59E0B" strokeWidth="3" />
            {[10, 30, 50, 70, 90, 110].map(x => (
              <line key={x} x1={x} y1="10" x2={x} y2="50" stroke="#F59E0B" strokeWidth="4" />
            ))}
          </svg>
        </div>
      ),
      hoverDetails: 'Tracks, Turnouts, Deep Screening, Rail Welding, Track Geometry'
    },
    {
      id: 'SIGNAL_AND_TELECOM',
      name: 'S&T (SIGNAL & TELECOM)',
      subtitle: 'Electronic Interlocking, Points & Kavach TCAS',
      icon: Activity,
      code: 'SIG',
      color: 'from-sky-600/20 via-slate-900/90 to-[#0A1220]',
      border: 'border-sky-500/50 hover:border-sky-400',
      glow: 'shadow-sky-950/40',
      accentColor: 'text-sky-400',
      badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
      visualElement: (
        <div className="absolute right-3 bottom-3 opacity-15 pointer-events-none select-none">
          <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
            <circle cx="30" cy="30" r="18" stroke="#0284C7" strokeWidth="3" />
            <circle cx="30" cy="30" r="8" fill="#0284C7" />
            <line x1="50" y1="30" x2="90" y2="30" stroke="#0284C7" strokeWidth="3" strokeDasharray="4 4" />
          </svg>
        </div>
      ),
      hoverDetails: 'Point Machines, Track Circuits, Axle Counters, Signal Relays, Kavach'
    },
    {
      id: 'TRACTION_DISTRIBUTION',
      name: 'TRD (TRACTION / OHE)',
      subtitle: '25kV Overhead Equipment, Switching & Sub-stations',
      icon: Zap,
      code: 'TRD',
      color: 'from-purple-600/20 via-slate-900/90 to-[#0A1220]',
      border: 'border-purple-500/50 hover:border-purple-400',
      glow: 'shadow-purple-950/40',
      accentColor: 'text-purple-400',
      badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
      visualElement: (
        <div className="absolute right-3 bottom-3 opacity-15 pointer-events-none select-none">
          <svg width="110" height="60" viewBox="0 0 110 60" fill="none">
            <path d="M 10 10 L 40 50 L 70 20 L 100 50" stroke="#A855F7" strokeWidth="3" />
            <line x1="10" y1="50" x2="100" y2="50" stroke="#A855F7" strokeWidth="2" strokeDasharray="2 2" />
          </svg>
        </div>
      ),
      hoverDetails: 'Catenary Wire, Contact Wire, Neutral Sections, Insulator Washing, Power Isolators'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono tracking-wider text-slate-300 uppercase">
            Departmental Maintenance Portals ({currentZone} • {currentDivision})
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          SELECT DEPARTMENT TO SUBMIT NEW REQUISITION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const stats = getDeptStats(dept.id);
          const Icon = dept.icon;
          const isHovered = hoveredDept === dept.id;

          return (
            <div
              key={dept.id}
              onMouseEnter={() => setHoveredDept(dept.id)}
              onMouseLeave={() => setHoveredDept(null)}
              className={`relative rounded-2xl border ${dept.border} bg-gradient-to-b ${dept.color} p-5 shadow-xl ${dept.glow} transition-all duration-200 overflow-hidden flex flex-col justify-between group`}
            >
              {dept.visualElement}

              <div>
                {/* Header: Icon, Code, Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Icon className={`w-6 h-6 ${dept.accentColor}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-black tracking-tight text-white font-mono">
                        {dept.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {dept.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Counts */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 font-mono text-xs">
                  <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block mb-0.5">PENDING REQUISITIONS</span>
                    <span className="text-base font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {stats.pending} Tasks
                    </span>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block mb-0.5">SAFETY CRITICAL</span>
                    <span className="text-base font-bold text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                      {stats.critical} Critical
                    </span>
                  </div>
                </div>

                {/* Hover Details Panel */}
                <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{dept.hoverDetails}</span>
                </div>
              </div>

              {/* Action Button: OPEN MAINTENANCE ENTRY */}
              <button
                onClick={() => onOpenEntry && onOpenEntry(dept)}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-mono font-bold text-xs flex items-center justify-between border border-slate-700 shadow-md group-hover:border-cyan-400/60 transition-all"
              >
                <span>OPEN MAINTENANCE ENTRY</span>
                <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
