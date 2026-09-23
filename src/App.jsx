import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { RailwayProvider, useRailway } from './context/RailwayContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TodaysMaintenancePage } from './pages/TodaysMaintenancePage';
import { ActiveMaintenancePage } from './pages/ActiveMaintenancePage';
import { EmergencyMaintenancePage } from './pages/EmergencyMaintenancePage';
import { BlockPlanChangesPage } from './pages/BlockPlanChangesPage';
import { BlockPlanningPage } from './pages/BlockPlanningPage';
import { MaintenanceTasksPage } from './pages/MaintenanceTasksPage';
import { RailwayAssetsPage } from './pages/RailwayAssetsPage';
import { TrainsCorridorsPage } from './pages/TrainsCorridorsPage';
import { WeeklyPlannerPage } from './pages/WeeklyPlannerPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LoginPage } from './pages/LoginPage';
import { GatewayPage } from './pages/GatewayPage';
import { DivisionSelectionPage } from './pages/DivisionSelectionPage';
import { PersistentAiAssistant } from './components/common/PersistentAiAssistant';

import { Train, ShieldCheck } from 'lucide-react';

// Route path mapping helper
const PATH_TO_PAGE_MAP = {
  '/': 'gateway',
  '/gateway': 'gateway',
  '/division': 'division',
  '/divisions': 'division',
  '/login': 'login',
  '/dashboard': 'dashboard',
  '/todays-work': 'todays-work',
  '/active-work': 'active-work',
  '/emergency-work': 'emergency-work',
  '/block-changes': 'block-changes',
  '/notifications': 'notifications',
  '/ai-planning': 'ai-planning',
  '/block-planner': 'ai-planning',
  '/maintenance': 'maintenance-tasks',
  '/maintenance-tasks': 'maintenance-tasks',
  '/railway-assets': 'railway-assets',
  '/assets': 'railway-assets',
  '/trains-corridors': 'trains-corridors',
  '/corridors': 'trains-corridors',
  '/planner': 'planner',
  '/recommendations': 'recommendations',
  '/reports': 'reports'
};

const PAGE_TO_PATH_MAP = {
  'gateway': '/gateway',
  'division': '/division',
  'login': '/login',
  'dashboard': '/dashboard',
  'todays-work': '/todays-work',
  'active-work': '/active-work',
  'emergency-work': '/emergency-work',
  'block-changes': '/block-changes',
  'notifications': '/notifications',
  'ai-planning': '/block-planner',
  'maintenance-tasks': '/maintenance',
  'railway-assets': '/assets',
  'trains-corridors': '/corridors',
  'planner': '/planner',
  'recommendations': '/recommendations',
  'reports': '/reports'
};

// Error Boundary Component to prevent white/blank screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Pragati Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#0E1626] border border-red-500/40 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-900/40 border border-red-500 text-red-400 flex items-center justify-center mx-auto mb-4 font-bold text-xl font-mono">
              !
            </div>
            <h2 className="text-base font-bold text-white mb-1">
              RailOpt Control Console Recovered
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              An unexpected render exception was trapped to maintain control room stability.
            </p>
            <div className="p-3 bg-black/40 rounded-lg text-left font-mono text-[11px] text-red-300 mb-4 overflow-x-auto">
              {this.state.error?.message || 'Interface Render Error'}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-700 to-red-800 text-white text-xs font-bold rounded-xl shadow-lg hover:from-red-600 transition-all"
            >
              Reload Operational Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Splash Screen shown while validating secure officer session.
 * Prevents any flash of dashboard before authentication status is known.
 */
function VerifyingSessionSplash() {
  return (
    <div className="min-h-screen w-full bg-[#050811] text-white flex flex-col items-center justify-center p-6 relative select-none">
      {/* Background track grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141e33_1px,transparent_1px),linear-gradient(to_bottom,#141e33_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-700 via-red-900 to-slate-900 border border-red-500/50 flex items-center justify-center shadow-2xl shadow-red-950/70 mb-5 animate-pulse">
          <Train className="w-8 h-8 text-amber-300" />
        </div>

        <h1 className="text-lg font-black tracking-tight mb-1 text-white">
          PRAGATI
        </h1>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-6 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          VERIFYING SECURE SESSION...
        </div>

        {/* Progress track animation */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div className="w-full h-full bg-gradient-to-r from-red-600 via-amber-400 to-emerald-400 -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>

        <p className="text-[11px] text-slate-500 font-mono">
          Indian Railways • CRIS Control Handshake In Progress
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, user: authUser } = useAuth();
  const { setCurrentUser, setCurrentDivision } = useRailway();

  const [selectedZone, setSelectedZone] = useState(() => {
    try {
      const saved = sessionStorage.getItem('railopt_selected_zone');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedDivision, setSelectedDivision] = useState(() => {
    try {
      const saved = sessionStorage.getItem('railopt_selected_division');
      return saved ? JSON.parse(saved) : { name: 'Bhopal', code: 'BPL', isPrimary: true };
    } catch {
      return { name: 'Bhopal', code: 'BPL', isPrimary: true };
    }
  });

  const [activePage, setActivePage] = useState(() => {
    const currentPath = window.location.pathname;
    return PATH_TO_PAGE_MAP[currentPath] || (window.location.hash.includes('gateway') ? 'gateway' : 'gateway');
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Synchronize authenticated user profile with RailwayContext
  useEffect(() => {
    if (authUser) {
      setCurrentUser(prev => ({
        ...prev,
        name: authUser.name || prev.name,
        role: authUser.role || prev.role,
        title: authUser.title || prev.title,
        division: authUser.division || prev.division,
        badgeId: authUser.officerId || prev.badgeId
      }));
    }
  }, [authUser, setCurrentUser]);

  // Handle URL route synchronization and browser history popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (!isAuthenticated) {
        if (path === '/login') {
          setActivePage('login');
        } else if (path === '/division' || path === '/divisions') {
          setActivePage('division');
        } else {
          window.history.replaceState(null, '', '/gateway');
          setActivePage('gateway');
        }
      } else {
        const page = PATH_TO_PAGE_MAP[path] || 'dashboard';
        setActivePage(page === 'login' || page === 'gateway' || page === 'division' ? 'dashboard' : page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Route protection enforcement
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/gateway' && path !== '/division' && path !== '/divisions') {
          window.history.replaceState(null, '', '/gateway');
          setActivePage('gateway');
        }
      } else {
        // Authenticated: if currently on /login, /gateway, /division or /, move to dashboard
        if (window.location.pathname === '/login' || window.location.pathname === '/gateway' || window.location.pathname === '/division' || window.location.pathname === '/') {
          window.history.replaceState(null, '', '/dashboard');
          setActivePage('dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading]);

  // Navigation handler that keeps URL in sync
  const navigateTo = useCallback((pageId) => {
    setActivePage(pageId);
    const targetPath = PAGE_TO_PATH_MAP[pageId] || '/dashboard';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, []);

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    try {
      sessionStorage.setItem('railopt_selected_zone', JSON.stringify(zone));
    } catch (e) {}
    // Navigate to Divisional selection page right after zone selection
    navigateTo('division');
  };

  const handleSelectDivision = (division) => {
    setSelectedDivision(division);
    try {
      sessionStorage.setItem('railopt_selected_division', JSON.stringify(division));
    } catch (e) {}
    if (division?.name && setCurrentDivision) {
      setCurrentDivision(division.name);
    }
    navigateTo('login');
  };

  const navigateToPlanningWithTask = (task) => {
    navigateTo('ai-planning');
  };

  // ─── 1. SESSION VERIFICATION SPLASH (PREVENTS FLASH OF DASHBOARD) ───────────
  if (isLoading) {
    return <VerifyingSessionSplash />;
  }

  // ─── 2. UNAUTHENTICATED: RENDER GATEWAY, DIVISION SELECTION, OR OFFICER LOGIN ───────
  // No Navbar, no Sidebar, no application data rendered in DOM!
  if (!isAuthenticated) {
    if (activePage === 'login') {
      return (
        <LoginPage
          selectedZone={selectedZone}
          selectedDivision={selectedDivision}
          onBackToDivision={() => navigateTo('division')}
          onBackToGateway={() => navigateTo('gateway')}
          onLoginSuccess={() => {
            window.history.pushState(null, '', '/dashboard');
            setActivePage('dashboard');
          }}
        />
      );
    }
    if (activePage === 'division') {
      return (
        <DivisionSelectionPage
          selectedZone={selectedZone}
          onSelectDivision={handleSelectDivision}
          onBackToGateway={() => navigateTo('gateway')}
        />
      );
    }
    return (
      <GatewayPage
        onSelectZone={handleSelectZone}
      />
    );
  }

  // ─── 3. AUTHENTICATED: RENDER FULL PRAGATI DASHBOARD & MODULES ─────────────
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={navigateTo} />;
      case 'todays-work':
        return <TodaysMaintenancePage onNavigate={navigateTo} />;
      case 'active-work':
        return <ActiveMaintenancePage onNavigate={navigateTo} />;
      case 'emergency-work':
        return <EmergencyMaintenancePage onNavigate={navigateTo} />;
      case 'block-changes':
        return <BlockPlanChangesPage />;
      case 'notifications':
        return <NotificationsPage onNavigate={navigateTo} />;
      case 'ai-planning':
        return <BlockPlanningPage />;
      case 'maintenance-tasks':
        return <MaintenanceTasksPage onNavigateToPlanning={navigateToPlanningWithTask} />;
      case 'railway-assets':
        return <RailwayAssetsPage />;
      case 'trains-corridors':
        return <TrainsCorridorsPage />;
      case 'planner':
        return <WeeklyPlannerPage />;
      case 'recommendations':
        return <RecommendationsPage onNavigateToPlanning={() => navigateTo('ai-planning')} />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070B12] text-slate-900 dark:text-slate-100 flex flex-col w-full overflow-x-hidden selection:bg-red-700 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activePage={activePage}
        onNavigate={navigateTo}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex w-full relative">
        {/* Responsive Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={navigateTo}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Page Content */}
        <main
          className={`flex-1 min-w-0 transition-[padding] duration-200 ease-in-out ${
            isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          } w-full`}
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* 34. Persistent Floating RailOpt AI Assistant */}
      <PersistentAiAssistant />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RailwayProvider>
            <AppContent />
          </RailwayProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
