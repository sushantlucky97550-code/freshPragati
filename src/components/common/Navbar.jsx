import React, { useState } from 'react';
import { useRailway, USER_ROLES } from '../../context/RailwayContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AdminAuditModal } from '../admin/AdminAuditModal';
import {
  Train,
  Clock,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  Bell,
  Menu,
  Zap,
  Activity,
  AlertTriangle,
  Radio,
  CheckCircle2,
  ExternalLink,
  LogOut,
  User,
  ShieldAlert,
  FileText
} from 'lucide-react';

import { IstClock } from './IstClock';

export const Navbar = ({ onToggleSidebar }) => {
  const {
    currentUser,
    switchRole,
    selectedCorridor,
    selectedCorridorId,
    setSelectedCorridorId,
    corridors,
    toasts
  } = useRailway();

  const { user: authUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [corridorDropdownOpen, setCorridorDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isAdminAuditOpen, setIsAdminAuditOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#090E1A]/95 backdrop-blur-md">
      {/* Upper Technical Ticker Bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1 text-[11px] bg-slate-900 text-slate-300 dark:bg-black/60 dark:text-slate-400 border-b border-slate-800 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            MINISTRY OF RAILWAYS (INDIAN RAILWAYS) • CRIS / COIS FEED CONNECTED
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            SYSTEM ENGINE: <strong className="text-white">Pragati MILP-v4.2</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            2 ACTIVE CAUTION ORDERS (TSR) IN NCR DIVISION
          </span>
        </div>

        <IstClock />
      </div>

      {/* Main Navbar */}
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-railway-maroon to-red-800 flex items-center justify-center shadow-md shadow-red-950/30 text-white font-black text-lg tracking-tighter border border-red-500/40">
              <Train className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  Pragati
                </span>
                <span className="text-[10px] uppercase font-bold font-mono px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-900">
                  IR-CTRL
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Automatic Block Planning & Optimization System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Active Corridor Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setCorridorDropdownOpen(!corridorDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs text-left"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Active Corridor</div>
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                {selectedCorridor.name}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </button>

          {corridorDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xl z-50 p-2 text-xs"
              onClick={() => setCorridorDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 font-bold text-slate-400 text-[10px] uppercase font-mono">
                Select Railway Corridor
              </div>
              {corridors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCorridorId(c.id)}
                  className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center justify-between ${
                    c.id === selectedCorridorId
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {c.zone} • {c.lengthKm} km • {c.capacityUtilization}% Capacity
                    </div>
                  </div>
                  {c.id === selectedCorridorId && (
                    <CheckCircle2 className="w-4 h-4 text-red-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls: Role, Clock, Theme, Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Clock */}
          <IstClock variant="mobile" className="lg:hidden" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? "Switch to High-Contrast Light Sheet" : "Switch to Control Room Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Admin Audit Console Button (Only visible for ADMIN officers) */}
          {authUser?.role === 'ADMIN' && (
            <button
              onClick={() => setIsAdminAuditOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-mono font-bold transition-all shadow-sm"
              title="Open Security & Authentication Audit Console"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Audit Logs</span>
            </button>
          )}

          {/* User Profile & Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-red-800/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                {authUser?.officerId ? authUser.officerId.slice(0, 3) : (currentUser.role === 'CHIEF_CONTROLLER' ? 'CC' : currentUser.role.slice(0, 3))}
              </div>
              <div className="hidden xl:block">
                <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <span>{authUser?.officerId || currentUser.division}</span>
                  {authUser?.department && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono">
                      {authUser.department}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  {authUser?.name || currentUser.name}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xl z-50 p-3 text-xs"
                onClick={() => setRoleDropdownOpen(false)}
              >
                {/* Officer Profile Header */}
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg mb-2">
                  <div className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase font-mono tracking-wider">
                    Authenticated Officer
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {authUser?.name || currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 space-y-0.5">
                    <div>Officer ID: <span className="text-slate-700 dark:text-slate-200 font-bold">{authUser?.officerId || currentUser.badgeId}</span></div>
                    <div>Department: <span className="text-slate-700 dark:text-slate-200">{authUser?.department || 'Operations'}</span></div>
                    <div>Role: <span className="text-slate-700 dark:text-slate-200">{authUser?.role || currentUser.role}</span></div>
                    {authUser?.division && <div>Division: <span className="text-slate-700 dark:text-slate-200">{authUser.division}</span></div>}
                  </div>
                </div>

                {/* Admin Quick Action */}
                {authUser?.role === 'ADMIN' && (
                  <div className="p-1 mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoleDropdownOpen(false);
                        setIsAdminAuditOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold flex items-center justify-between border border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span>Security Audit Console</span>
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-red-200 dark:bg-red-900 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    </button>
                  </div>
                )}

                {/* Quick Role Preset Switcher for Development / Demo */}
                <div className="p-1">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400">
                    Switch Operational Role
                  </div>
                  {USER_ROLES.map(r => (
                    <button
                      key={r.id}
                      onClick={() => switchRole(r.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        currentUser.role === r.id
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div>{r.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.dept} Dept</div>
                      </div>
                      {currentUser.role === r.id && (
                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Logout Button */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => logout()}
                    className="w-full py-2 px-3 rounded-lg bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>LOGOUT & TERMINATE SESSION</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Header Logout Button */}
          <button
            onClick={() => logout()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] hover:border-red-500/50 hover:bg-red-950/30 text-slate-600 dark:text-slate-400 hover:text-red-400 transition-all text-xs font-mono font-bold"
            title="Terminate officer session and return to login"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Audit Logs Modal */}
      <AdminAuditModal
        isOpen={isAdminAuditOpen}
        onClose={() => setIsAdminAuditOpen(false)}
      />

      {/* Floating Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-xl border text-xs font-medium flex items-center gap-2.5 transition-all animate-bounce-short ${
              t.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/40 backdrop-blur'
                : t.type === 'error'
                ? 'bg-red-900/90 text-red-100 border-red-500/40 backdrop-blur'
                : 'bg-slate-900/90 text-slate-100 border-slate-700 backdrop-blur'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </header>
  );
};
