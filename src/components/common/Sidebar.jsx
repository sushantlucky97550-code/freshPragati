import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Wrench,
  Layers,
  Train,
  Calendar,
  Lightbulb,
  BarChart3,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
  ExternalLink,
  Activity
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
  const { tasks, recommendations, blockPlans } = useRailway();
  const { user: authUser, logout } = useAuth();

  const pendingTasksCount = tasks.filter(t => t.status === 'PENDING_BLOCK').length;
  const recommendationsCount = recommendations.length;

  const rawNavItems = [
    {
      id: 'dashboard',
      label: 'Control Dashboard',
      icon: LayoutDashboard,
      badge: null,
      roles: ['ALL']
    },
    {
      id: 'ai-planning',
      label: 'Automatic Block Planning',
      icon: Cpu,
      badge: 'AI SOLVER',
      isAi: true,
      roles: ['ALL']
    },
    {
      id: 'maintenance-tasks',
      label: 'Maintenance Tasks',
      icon: Wrench,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount} Pending` : null,
      badgeColor: 'amber',
      roles: ['ADMIN', 'ENGINEERING_OFFICER', 'ST_OFFICER', 'TRD_OFFICER', 'SSE_PWAY', 'SSE_TRD', 'SSE_SIG']
    },
    {
      id: 'railway-assets',
      label: 'Railway Assets & Telemetry',
      icon: Layers,
      badge: null,
      roles: ['ADMIN', 'ENGINEERING_OFFICER', 'ST_OFFICER', 'TRD_OFFICER', 'OPERATIONS_CONTROL', 'CHIEF_CONTROLLER']
    },
    {
      id: 'trains-corridors',
      label: 'Trains & Corridors',
      icon: Train,
      badge: 'LIVE',
      roles: ['ADMIN', 'OPERATIONS_CONTROL', 'CHIEF_CONTROLLER', 'ENGINEERING_OFFICER']
    },
    {
      id: 'planner',
      label: 'Weekly / Monthly Planner',
      icon: Calendar,
      badge: null,
      roles: ['ADMIN', 'OPERATIONS_CONTROL', 'CHIEF_CONTROLLER', 'ENGINEERING_OFFICER']
    },
    {
      id: 'recommendations',
      label: 'AI Recommendations',
      icon: Lightbulb,
      badge: recommendationsCount > 0 ? `${recommendationsCount} New` : null,
      badgeColor: 'sky',
      roles: ['ALL']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
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
