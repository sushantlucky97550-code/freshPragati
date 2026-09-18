import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { corridors as localCorridors } from '../data/corridorsData';
import { trains as localTrains } from '../data/trainsData';
import { maintenanceTasks as initialTasks } from '../data/maintenanceTasksData';
import { railwayAssets as initialAssets } from '../data/assetsData';
import { mockGeneratedBlockPlans } from '../data/blockPlansData';
import { aiRecommendations as initialRecommendations } from '../data/recommendationsData';
import { api, RailwayApiService } from '../services/api';

export const USER_ROLES = [
  { id: 'CHIEF_CONTROLLER', title: 'Chief Controller (Operations)', dept: 'Operating', icon: 'ShieldCheck' },
  { id: 'SSE_PWAY', title: 'Senior Section Engineer (P-Way)', dept: 'Engineering', icon: 'Tool' },
  { id: 'SSE_TRD', title: 'SSE (Traction / OHE)', dept: 'Electrical', icon: 'Zap' },
  { id: 'SSE_SIG', title: 'SSE (Signalling & Telecom)', dept: 'S&T', icon: 'Activity' },
  { id: 'STATION_MASTER', title: 'Station Superintendent', dept: 'Station Ops', icon: 'Radio' }
];

const RailwayContext = createContext();

export const RailwayProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    name: 'Rajesh K. Sharma',
    role: 'CHIEF_CONTROLLER',
    title: 'Chief Controller (Operations)',
    division: 'NCR - Prayagraj Division',
    badgeId: 'IRTS-9842',
    avatar: '👨‍✈️'
  });

  const [selectedCorridorId, setSelectedCorridorId] = useState('NDLS-CNB');
  const [tasks, setTasks] = useState([]);
  const [assets, setAssets] = useState([]);
  const [blockPlans, setBlockPlans] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Backend-driven state
  const [corridors, setCorridors] = useState([]);
  const [trainsList, setTrainsList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [backendOnline, setBackendOnline] = useState(true);

  // Live Train Telemetry State (RailRadar / Simulation)
  const [liveTrains, setLiveTrains] = useState([]);
  const [telemetrySummary, setTelemetrySummary] = useState({
    totalTrains: 18,
    liveTrains: 18,
    delayedTrains: 2,
    staleTrains: 0,
    activeConflicts: 1,
    dataSource: 'SIMULATION',
    freshness: 'SIMULATION',
    lastUpdate: '--:--:--',
    providerAvailable: false,
    providerName: 'SIMULATION'
  });
  const [isLiveTelemetryLoading, setIsLiveTelemetryLoading] = useState(false);

  // Load all live data from Spring Boot backend on mount
  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      // 1. Tasks
      try {
        const liveTasks = await api.maintenanceTasks.getAll();
        if (!cancelled) {
          setTasks(Array.isArray(liveTasks) && liveTasks.length > 0 ? liveTasks : initialTasks);
        }
      } catch (err) {
        console.warn('[RailwayContext] Tasks fallback to local:', err.message);
        if (!cancelled) {
          setTasks(initialTasks);
          setBackendOnline(false);
        }
      }

      // 2. Departments
      try {
        const liveDepts = await api.departments.getAll();
        if (!cancelled && Array.isArray(liveDepts) && liveDepts.length > 0) {
          setDepartments(liveDepts);
          setBackendOnline(true);
        }
      } catch (err) {
        console.warn('[RailwayContext] Departments fallback:', err.message);
      }

      // 3. Corridors
      try {
        const liveCorridors = await RailwayApiService.getCorridors();
        if (!cancelled && Array.isArray(liveCorridors) && liveCorridors.length > 0) {
          // Normalize backend corridors to match frontend's expected shape
          const normalized = liveCorridors.map(normalizeBackendCorridor);
          setCorridors(normalized);
        }
      } catch (err) {
        console.warn('[RailwayContext] Corridors fallback to local:', err.message);
      }

      // 4. Block Plans
      try {
        const livePlans = await RailwayApiService.getBlockPlans();
        if (!cancelled && Array.isArray(livePlans) && livePlans.length > 0) {
          setBlockPlans(livePlans);
        }
      } catch (err) {
        console.warn('[RailwayContext] Block plans fallback to local:', err.message);
      }

      // 5. Assets
      try {
        const liveAssets = await RailwayApiService.getRailwayAssets();
        if (!cancelled && Array.isArray(liveAssets) && liveAssets.length > 0) {
          setAssets(liveAssets);
        }
      } catch (err) {
        console.warn('[RailwayContext] Assets fallback to local:', err.message);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, []);

  // Load trains when corridor changes
  useEffect(() => {
    let cancelled = false;
    const selectedCorridor = corridors.find(c => c.id === selectedCorridorId || c.corridorId === selectedCorridorId);
    const backendCorridorId = selectedCorridor?.backendId;

    RailwayApiService.getTrains(backendCorridorId)
      .then(liveTrains => {
        if (!cancelled && Array.isArray(liveTrains) && liveTrains.length > 0) {
          setTrainsList(liveTrains);
        }
      })
      .catch(err => {
        console.warn('[RailwayContext] Trains fallback to local:', err.message);
        if (!cancelled) {
          setTrainsList(localTrains.filter(t => !selectedCorridorId || t.corridorId === selectedCorridorId));
        }
      });
    return () => { cancelled = true; };
  }, [selectedCorridorId, corridors]);

  // In-flight guard to prevent overlapping polling requests
  const isFetchingRef = useRef(false);

  // Fetch live train telemetry and poll every 30 seconds
  const fetchLiveTelemetry = useCallback(async (force = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLiveTelemetryLoading(true);
    try {
      const [trainsData, summaryData] = await Promise.all([
        RailwayApiService.getLiveTrains(force),
        RailwayApiService.getLiveTelemetrySummary()
      ]);
      if (Array.isArray(trainsData) && trainsData.length > 0) {
        setLiveTrains(trainsData);
      }
      if (summaryData) {
        setTelemetrySummary(summaryData);
      }
    } catch (err) {
      console.warn('[RailwayContext] fetchLiveTelemetry error:', err.message);
    } finally {
      setIsLiveTelemetryLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const refreshLiveTelemetry = useCallback(async () => {
    return fetchLiveTelemetry(true);
  }, [fetchLiveTelemetry]);

  useEffect(() => {
    fetchLiveTelemetry(false);
    const interval = setInterval(() => {
      fetchLiveTelemetry(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveTelemetry]);

  // Stable IST Time helper
  const getIstTimeStr = () => {
    return new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getIstDateStr = () => {
    return new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const istTimeStr = getIstTimeStr();
  const istDateStr = getIstDateStr();

  const selectedCorridor = corridors.find(c =>
    c.id === selectedCorridorId || c.corridorId === selectedCorridorId
  ) || corridors[0] || localCorridors[0];

  // Toast Notification System
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  // Switch Role
  const switchRole = useCallback((roleId) => {
    const roleConfig = USER_ROLES.find(r => r.id === roleId) || USER_ROLES[0];
    setCurrentUser(prev => ({
      ...prev,
      role: roleConfig.id,
      title: roleConfig.title
    }));
    addToast(`Switched active profile to ${roleConfig.title}`, 'info');
  }, [addToast]);

  // Add a new maintenance task
  const addTask = useCallback((newTask) => {
    const taskWithId = {
      ...newTask,
      id: `TSK-NCR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      submittedBy: currentUser.title,
      status: 'PENDING_BLOCK'
    };
    setTasks(prev => [taskWithId, ...prev]);
    addToast(`Requisition ${taskWithId.id} registered successfully`, 'success');
    return taskWithId;
  }, [currentUser.title, addToast]);

  // Approve a Block Plan
  const approveBlockPlan = useCallback((planId) => {
    setBlockPlans(prev => prev.map(plan => {
      if (plan.planId === planId) {
        return {
          ...plan,
          status: 'APPROVED_BY_CONTROLLER',
          approvedBy: `${currentUser.name} (${currentUser.title})`,
          approvedAt: istTimeStr + ' IST'
        };
      }
      return plan;
    }));
    addToast(`Block Plan ${planId} approved & transmitted to COIS / FOIS`, 'success');
  }, [currentUser.name, currentUser.title, istTimeStr, addToast]);

  // Add newly generated block plan
  const addGeneratedBlockPlan = useCallback((newPlan) => {
    setBlockPlans(prev => [newPlan, ...prev]);
    const loc = newPlan.section || newPlan.corridorName || 'Corridor';
    addToast(`New AI Block Plan generated for ${loc}`, 'success');
  }, [addToast]);

  return (
    <RailwayContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        roles: USER_ROLES,
        selectedCorridorId,
        setSelectedCorridorId,
        selectedCorridor,
        corridors,
        trains: trainsList,
        tasks,
        setTasks,
        departments,
        setDepartments,
        addTask,
        assets,
        setAssets,
        blockPlans,
        approveBlockPlan,
        addGeneratedBlockPlan,
        recommendations,
        setRecommendations,
        istTimeStr,
        istDateStr,
        toasts,
        addToast,
        backendOnline,
        liveTrains,
        telemetrySummary,
        isLiveTelemetryLoading,
        refreshLiveTelemetry
      }}
    >
      {children}
    </RailwayContext.Provider>
  );
};

/**
 * Normalizes a backend Corridor DTO to match the frontend's local corridor shape.
 * This allows the rest of the frontend to work unchanged.
 */
function normalizeBackendCorridor(c) {
  return {
    // keep both id formats so lookups work
    id: c.corridorId || c.id,
    corridorId: c.corridorId,
    backendId: c.id,
    name: c.name,
    code: c.corridorId,
    zone: c.zone,
    division: c.division,
    lengthKm: c.lengthKm,
    tracks: (c.tracks || []).map(t => ({
      id: t.trackCode,
      name: t.trackName,
      direction: t.direction,
      status: t.status
    })),
    stations: (c.stations || []).map(s => ({
      code: s.stationCode,
      name: s.stationName,
      km: s.km,
      hasLoops: s.hasLoops,
      maxSpeed: s.maxSpeed
    })),
    capacityUtilization: c.capacityUtilization,
    dailyTrains: c.dailyTrains,
    signaling: c.signaling,
    traction: c.traction,
    speedLimit: c.speedLimit
  };
}

export const useRailway = () => {
  const context = useContext(RailwayContext);
  if (!context) throw new Error('useRailway must be used within RailwayProvider');
  return context;
};
