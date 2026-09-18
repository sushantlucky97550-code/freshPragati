import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { IstClock } from '../common/IstClock';
import {
  Activity,
  Radio,
  Cpu,
  ShieldCheck,
  User,
  Zap,
  Clock
} from 'lucide-react';

export const CommandTopBar = () => {
  const { user: authUser } = useAuth();

  return (
    <div className="w-full bg-[#050811] border-b border-[#141F36] text-[11px] font-mono px-4 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-3 select-none">
      {/* Left: Status Ticker Indicators */}
      <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-center md:justify-start">
        {/* RailOpt / CRIS indicator */}
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span>CRIS / COIS ONLINE</span>
        </div>

        <span className="text-slate-700 hidden sm:inline">•</span>

        {/* Live Telemetry */}
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>LIVE TELEMETRY: <strong className="text-slate-200">ACTIVE</strong></span>
        </div>

        <span className="text-slate-700 hidden sm:inline">•</span>

        {/* AI Engine Status */}
        <div className="flex items-center gap-1.5 text-amber-300">
          <Cpu className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>AI SOLVER: <strong className="text-slate-200">MILP-v4.2 OPTIMAL</strong></span>
        </div>

        <span className="text-slate-700 hidden md:inline">•</span>

        {/* Control Office Status */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>CONTROL OFFICE: <strong className="text-slate-200">CENTRAL DESK</strong></span>
        </div>
      </div>

      {/* Right: Operational Time & Officer Info */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <IstClock />
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-800 text-slate-300">
          <div className="w-5 h-5 rounded bg-blue-900/60 border border-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-[10px]">
            {authUser?.officerId ? authUser.officerId.slice(0, 2) : 'CC'}
          </div>
          <span className="text-slate-200 font-semibold hidden sm:inline">
            {authUser?.name || 'Officer Desk'}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
            {authUser?.role || 'OPERATIONS'}
          </span>
        </div>
      </div>
    </div>
  );
};
