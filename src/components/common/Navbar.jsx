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
import { NotificationCenter } from './NotificationCenter';

export const Navbar = ({ onToggleSidebar, activePage, onNavigate }) => {
  const {
    currentZone,
    currentDivision,
    currentUser,
    switchRole,
    selectedCorridor,
    selectedCorridorId,
    setSelectedCorridorId,
    corridors,
    notifications,
    toasts
  } = useRailway();

  const { user: authUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [corridorDropdownOpen, setCorridorDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isAdminAuditOpen, setIsAdminAuditOpen] = useState(false);

  const unreadAlerts = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#D9DEE7] bg-white/98 dark:bg-[#0E1C35]/98 backdrop-blur-md shadow-sm">
      {/* Upper Technical Ticker Bar - Navy */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 text-[11px] bg-[#173B73] text-blue-100 border-b border-[#1F4380] font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-white font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            {currentZone === 'WCR' ? 'WEST CENTRAL RAILWAY' : `${currentZone} RAILWAY`} &bull; {currentDivision.toUpperCase()} DIVISION
          </span>
          <span className="text-blue-400">|</span>
          <span className="text-blue-200">
            DECISION SUPPORT SYSTEM: <strong className="text-white">PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration</strong>
          </span>
          <span className="text-blue-400">|</span>
          <span className="text-emerald-300 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            CRIS / COIS SECURE
          </span>
        </div>

        <IstClock />
      </div>

      {/* Main Navbar */}
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 bg-white dark:bg-[#0E1C35]">
        {/* Left: Mobile Toggle & Official IR + PRAGATI Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#173B73] dark:text-slate-200 hover:bg-[#F4F6F8] dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Authentic Official Indian Railways Logo */}
            <img
              src="/assets/indian_railways_logo.png"
              alt="Indian Railways Official Logo"
              className="w-10 h-10 object-contain shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-[#173B73] dark:text-white">
                  PRAGATI
                </span>
                <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-[#173B73] text-white tracking-wide">
                  RailOpt AI
                </span>
                <span className="hidden xl:inline text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#F4F6F8] text-[#5B6575] border border-[#D9DEE7] dark:bg-slate-800 dark:text-slate-300">
                  Decision Support System
                </span>
              </div>
              <p className="text-[10px] text-[#5B6575] dark:text-slate-400 hidden sm:block font-medium">
                AI-Powered Railway Maintenance & Block Planning
              </p>
            </div>
          </div>

          {/* If on a subpage, render a prominent BACK TO COMMAND CENTER button */}
          {activePage && activePage !== 'dashboard' && (
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="ml-2 px-3 py-1.5 rounded-lg bg-[#173B73] hover:bg-[#112D58] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all group"
            >
              <span>←</span>
              <span className="hidden sm:inline">BACK TO COMMAND CENTER</span>
              <span className="sm:hidden">DASHBOARD</span>
            </button>
          )}
        </div>

        {/* Center: Active Corridor Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setCorridorDropdownOpen(!corridorDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#D9DEE7] dark:border-slate-800 bg-[#F4F6F8] dark:bg-[#111A2E] hover:border-slate-400 dark:hover:border-slate-700 transition-all text-xs text-left"
          >
            <div className="w-2 h-2 rounded-full bg-[#168A55] animate-pulse" />
            <div>
              <div className="text-[10px] font-mono uppercase text-[#5B6575]">Active Corridor</div>
              <div className="font-bold text-[#172033] dark:text-slate-100 flex items-center gap-1">
                {selectedCorridor.name}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </button>

          {corridorDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-80 rounded-xl border border-[#D9DEE7] dark:border-slate-800 bg-white dark:bg-[#0E1C35] shadow-xl z-50 p-2 text-xs"
              onClick={() => setCorridorDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 font-bold text-[#5B6575] text-[10px] uppercase font-mono">
                Select Railway Corridor
              </div>
              {corridors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCorridorId(c.id)}
                  className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center justify-between ${
                    c.id === selectedCorridorId
                      ? 'bg-[#EBF2FA] dark:bg-[#173B73]/40 text-[#173B73] dark:text-blue-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-[#172033] dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {c.zone} • {c.lengthKm} km • {c.capacityUtilization}% Capacity
                    </div>
                  </div>
                  {c.id === selectedCorridorId && (
                    <CheckCircle2 className="w-4 h-4 text-[#173B73] dark:text-blue-400" />
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
            className="p-2 rounded-lg text-slate-600 hover:text-[#173B73] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? "Switch to High-Contrast Light Sheet" : "Switch to Control Room Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#173B73]" />}
          </button>

          {/* Notifications Center Toggle */}
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-[#173B73] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Real-Time Control Room Notifications"
          >
            <Bell className="w-4 h-4 text-[#173B73] dark:text-amber-400" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C62828] animate-ping" />
            )}
          </button>

          {/* Admin Audit Console Button (Only visible for ADMIN officers) */}
          {authUser?.role === 'ADMIN' && (
            <button
              onClick={() => setIsAdminAuditOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C62828]/40 bg-[#C62828]/10 hover:bg-[#C62828]/20 text-[#C62828] text-xs font-mono font-bold transition-all shadow-sm"
              title="Open Security & Authentication Audit Console"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#C62828]" />
              <span>Audit Logs</span>
            </button>
          )}

          {/* User Profile & Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D9DEE7] dark:border-slate-800 bg-[#F4F6F8] dark:bg-[#111A2E] hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-[#173B73]/15 text-[#173B73] dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                {authUser?.officerId ? authUser.officerId.slice(0, 3) : (currentUser.role === 'CHIEF_CONTROLLER' ? 'CC' : currentUser.role.slice(0, 3))}
              </div>
              <div className="hidden xl:block">
                <div className="text-[10px] font-mono uppercase text-[#5B6575] flex items-center gap-1">
                  <span>{authUser?.officerId || currentUser.division}</span>
                  {authUser?.department && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 text-[#173B73] font-mono font-semibold dark:bg-slate-800 dark:text-emerald-400">
                      {authUser.department}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-[#172033] dark:text-slate-100 flex items-center gap-1">
                  {authUser?.name || currentUser.name}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl border border-[#D9DEE7] dark:border-slate-800 bg-white dark:bg-[#0E1C35] shadow-2xl z-50 p-3 text-xs"
                onClick={() => setRoleDropdownOpen(false)}
              >
                {/* Officer Profile Header */}
                <div className="px-3 py-2.5 border-b border-[#D9DEE7] dark:border-slate-800 bg-[#F4F6F8] dark:bg-slate-900/50 rounded-lg mb-2">
                  <div className="text-[10px] font-bold text-[#173B73] dark:text-blue-400 uppercase font-mono tracking-wider">
                    Authenticated Officer
                  </div>
                  <div className="font-bold text-sm text-[#172033] dark:text-white mt-0.5">
                    {authUser?.name || currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#5B6575] dark:text-slate-400 font-mono mt-1 space-y-0.5">
                    <div>Officer ID: <span className="text-[#172033] dark:text-slate-200 font-bold">{authUser?.officerId || currentUser.badgeId}</span></div>
                    <div>Department: <span className="text-[#172033] dark:text-slate-200">{authUser?.department || 'Operations'}</span></div>
                    <div>Role: <span className="text-[#172033] dark:text-slate-200">{authUser?.role || currentUser.role}</span></div>
                    {authUser?.division && <div>Division: <span className="text-[#172033] dark:text-slate-200">{authUser.division}</span></div>}
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
                      className="w-full text-left px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#C62828] font-semibold flex items-center justify-between border border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#C62828]" />
                        <span>Security Audit Console</span>
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-red-100 text-[#C62828] px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    </button>
                  </div>
                )}

                {/* Quick Role Preset Switcher for Development / Demo */}
                <div className="p-1">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#5B6575]">
                    Switch Operational Role
                  </div>
                  {USER_ROLES.map(r => (
                    <button
                      key={r.id}
                      onClick={() => switchRole(r.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        currentUser.role === r.id
                          ? 'bg-[#EBF2FA] dark:bg-[#173B73]/50 text-[#173B73] dark:text-blue-300 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div>{r.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{r.dept} Dept</div>
                      </div>
                      {currentUser.role === r.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#173B73] dark:text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Logout Button */}
                <div className="mt-2 pt-2 border-t border-[#D9DEE7] dark:border-slate-800">
                  <button
                    onClick={() => logout()}
                    className="w-full py-2 px-3 rounded-lg bg-[#C62828]/10 hover:bg-[#C62828] hover:text-white text-[#C62828] text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9DEE7] dark:border-slate-800 bg-[#F4F6F8] dark:bg-[#111A2E] hover:border-[#C62828]/50 hover:bg-[#FFEBEE] text-slate-700 hover:text-[#C62828] transition-all text-xs font-mono font-bold"
            title="Terminate officer session and return to login"
          >
            <LogOut className="w-3.5 h-3.5 text-[#C62828]" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Audit Logs Modal */}
      <AdminAuditModal
        isOpen={isAdminAuditOpen}
        onClose={() => setIsAdminAuditOpen(false)}
      />

      {/* Real-time Notification Center Drawer */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Floating Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-xl border text-xs font-medium flex items-center gap-2.5 transition-all animate-bounce-short ${
              t.type === 'success'
                ? 'bg-emerald-50 text-[#168A55] border-emerald-200 shadow-emerald-100'
                : t.type === 'error'
                ? 'bg-red-50 text-[#C62828] border-[#C62828]/30 shadow-red-100'
                : 'bg-white text-[#172033] border-[#D9DEE7] shadow-slate-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full animate-ping ${t.type === 'success' ? 'bg-[#168A55]' : t.type === 'error' ? 'bg-[#C62828]' : 'bg-[#173B73]'}`} />
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </header>
  );
};
