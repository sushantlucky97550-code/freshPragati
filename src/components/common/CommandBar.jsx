import React from 'react';
import { Train, Radio, Cpu, ShieldCheck, Wifi, LogOut, User, ChevronDown } from 'lucide-react';
import { IstClock } from './IstClock';
import { useRailway } from '../../context/RailwayContext';
import { useAuth } from '../../context/AuthContext';

/**
 * CommandBar — Slim, dark top status bar for the Pragati Command Center.
 * Replaces the previous Navbar + scrolling marquee with a compact, information-dense header.
 */
export const CommandBar = () => {
  const { telemetrySummary, backendOnline } = useRailway();
  const { user: authUser, logout } = useAuth();

  const statusItems = [
    {
      label: 'CRIS',
      active: backendOnline,
      color: backendOnline ? 'bg-emerald-500' : 'bg-red-500',
    },
    {
      label: 'TELEMETRY',
      active: telemetrySummary?.overallFreshness === 'LIVE' || telemetrySummary?.overallFreshness === 'SIMULATION',
      color: telemetrySummary?.overallFreshness === 'LIVE' ? 'bg-emerald-500' : 'bg-cyan-500',
    },
    {
      label: 'AI ENGINE',
      active: true,
      color: 'bg-emerald-500',
    },
    {
      label: 'CONTROL',
      active: backendOnline,
      color: backendOnline ? 'bg-emerald-500' : 'bg-amber-500',
    },
  ];

  return (
    <header className="w-full bg-[#060A12] border-b border-command-border/60 relative z-50">
      {/* Top micro status strip */}
      <div className="h-7 bg-[#050811] border-b border-command-border/40 px-4 lg:px-6 flex items-center justify-between text-[10px] font-mono overflow-x-auto">
        <div className="flex items-center gap-4 text-slate-500 whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MINISTRY OF RAILWAYS • CRIS / COIS
          </span>
          <span className="text-command-border">│</span>
          {statusItems.map((item) => (
            <span key={item.label} className="flex items-center gap-1 text-slate-500">
              <span className={`w-1.5 h-1.5 rounded-full ${item.color} ${item.active ? 'animate-pulse' : ''}`} />
              {item.label}
            </span>
          ))}
        </div>
        <div className="hidden sm:block">
          <IstClock />
        </div>
      </div>

      {/* Main bar */}
      <div className="h-12 px-4 lg:px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-700 to-red-900 border border-red-500/30 flex items-center justify-center shadow-md">
            <Train className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white">
              Pragati
            </span>
            <span className="hidden md:inline text-[9px] uppercase font-bold font-mono px-1.5 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-900/60">
              COMMAND
            </span>
          </div>
          <span className="hidden lg:block text-[10px] text-slate-500 font-mono ml-2">
            Intelligent Railway Maintenance & Block Optimization
          </span>
        </div>

        {/* Right: Officer + Logout */}
        <div className="flex items-center gap-3">
          {/* System status compact */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-command-surface border border-command-border text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-semibold">ONLINE</span>
          </div>

          {/* Officer badge */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-command-surface border border-command-border">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30">
              <User className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold text-white leading-none">
                {authUser?.name || 'Officer'}
              </p>
              <p className="text-[9px] font-mono text-slate-500 leading-none mt-0.5">
                {authUser?.officerId || authUser?.role || 'CTRL'}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-all"
            title="Secure Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
