import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  Flame,
  GitBranch,
  Bell,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Train,
  Clock,
  Layers
} from 'lucide-react';
import { useRailway } from '../../context/RailwayContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({
  activePage,
  setActivePage,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  onCloseMobile
}) => {
  const {
    currentZone,
    currentDivision,
    todayWorkTasks,
    activeWorkTasks,
    notifications
  } = useRailway();
  const { user: authUser, logout } = useAuth();

  const unreadAlerts = notifications.filter(n => !n.read).length;

  const rawNavItems = [
    {
      id: 'dashboard',
      label: 'Main Command Center',
      icon: LayoutDashboard,
      badge: null,
      roles: ['ALL']
    },
    {
      id: 'todays-work',
      label: "Today's Maintenance Work",
      icon: Calendar,
      badge: todayWorkTasks.length > 0 ? `${todayWorkTasks.length}` : null,
      badgeColor: 'sky',
      roles: ['ALL']
    },
    {
      id: 'active-work',
      label: 'Currently Active Maintenance Work',
      icon: Activity,
      badge: activeWorkTasks.length > 0 ? `${activeWorkTasks.length} Active` : 'LIVE',
      badgeColor: 'emerald',
      roles: ['ALL']
    },
    {
      id: 'emergency-work',
      label: 'Emergency Maintenance Works',
      icon: Flame,
      badge: 'RAPID',
      badgeColor: 'red',
      roles: ['ALL']
    },
    {
      id: 'block-changes',
      label: 'Changes in Block Plans',
      icon: GitBranch,
      badge: 'v3',
      badgeColor: 'amber',
      roles: ['ALL']
    },
    {
      id: 'notifications',
      label: 'Notifications & Alerts',
      icon: Bell,
      badge: unreadAlerts > 0 ? `${unreadAlerts}` : null,
      badgeColor: 'red',
      roles: ['ALL']
    },
    {
      id: 'reports',
      label: 'Reports & Audit Dossier',
      icon: BarChart3,
      badge: null,
      roles: ['ALL']
    }
  ];

  const currentRole = authUser?.role || 'OPERATIONS_CONTROL';
  const navItems = rawNavItems.filter(item =>
    item.roles.includes('ALL') ||
    currentRole === 'ADMIN' ||
    item.roles.includes(currentRole)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 ${
          isOpenMobile ? 'z-50' : 'z-20'
        } flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0A101D] transition-[width,transform] duration-200 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } pt-16 lg:pt-24`}
      >
        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto overscroll-contain">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase font-mono tracking-wider text-slate-400">
            {!isCollapsed ? 'Operations Management' : 'OPS'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? item.isAi
                      ? 'bg-gradient-to-r from-red-700 to-railway-maroon text-white shadow-md shadow-red-950/30'
                      : 'bg-slate-900 text-white dark:bg-slate-800/90 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                      isActive
                        ? item.isAi
                          ? 'text-amber-300'
                          : 'text-white dark:text-emerald-400'
                        : item.isAi
                        ? 'text-red-500'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  {item.isAi && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between truncate text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-tight ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400'
                            : item.badgeColor === 'sky'
                            ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Left Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-amber-400" />
                )}
              </button>
            );
          })}

          {/* ─────────────────────────────────────────────────────────────
              TODAY'S MAINTENANCE WORK SECTION (Selected by DOM Officer)
              ───────────────────────────────────────────────────────────── */}
          {!isCollapsed ? (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Today's Maintenance
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-900">
                  {todayWorkTasks?.length || 0} Queued
                </span>
              </div>

              {todayWorkTasks && todayWorkTasks.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {todayWorkTasks.map((twTask) => {
                    const taskId = twTask.taskId || twTask.id;
                    const dept = twTask.departmentCode || twTask.department || 'PWAY';
                    return (
                      <div
                        key={taskId}
                        className="group relative p-2 rounded-lg bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 hover:border-red-500/40 transition-all text-left"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-100 truncate max-w-[130px]">
                            {taskId}
                          </span>
                          <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {twTask.requiredWindowHours || (twTask.durationMinutes ? (twTask.durationMinutes / 60).toFixed(1) : 2.5)}h
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-300 font-sans truncate mt-0.5">
                          {twTask.title || twTask.taskType}
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 font-mono">
                          <span className="truncate max-w-[120px] text-amber-600 dark:text-amber-400 font-semibold">
                            {twTask.section || twTask.location}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromTodayWork(taskId);
                            }}
                            title="Remove from Today's Work"
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">
                    No tasks selected for today.
                  </p>
                  <button
                    onClick={() => setActivePage('maintenance-tasks')}
                    className="text-[10px] text-red-600 dark:text-red-400 font-semibold hover:underline mt-1 block w-full"
                  >
                    + DOM: Select Requisitions
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Collapsed Icon View for Today's Work */
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col items-center">
              <button
                onClick={() => setActivePage('maintenance-tasks')}
                title={`Today's Maintenance Work (${todayWorkTasks?.length || 0} queued)`}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-red-500 transition-colors"
              >
                <Wrench className="w-4 h-4 text-amber-500" />
                {todayWorkTasks?.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {todayWorkTasks.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </nav>

        {/* Bottom Telemetry & Collapse Button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          {!isCollapsed && (
            <div className="mb-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1525] text-[11px]">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-mono uppercase font-bold text-[10px]">CRIS FOIS Link</span>
                <span className="inline-flex items-center gap-1 text-emerald-500 font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  99.9%
                </span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 font-medium truncate">
                Northern Central Railway
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Block Auto-Approval: ACTIVE
              </div>
            </div>
          )}

          {/* Quick Logout Button */}
          <button
            onClick={() => logout()}
            className={`w-full mb-2 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all text-xs font-mono font-bold`}
            title="Terminate officer session and return to login"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-red-500 flex-shrink-0" />
              {!isCollapsed && <span>Logout Session</span>}
            </div>
            {!isCollapsed && authUser?.officerId && (
              <span className="text-[9px] text-slate-400 font-normal">{authUser.officerId}</span>
            )}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors text-xs font-medium"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
