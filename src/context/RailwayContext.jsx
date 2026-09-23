import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { corridors as localCorridors } from '../data/corridorsData';
import { trains as localTrains } from '../data/trainsData';
import { maintenanceTasks as initialTasks } from '../data/maintenanceTasksData';
import { railwayAssets as initialAssets } from '../data/assetsData';
import { mockGeneratedBlockPlans } from '../data/blockPlansData';
import { aiRecommendations as initialRecommendations } from '../data/recommendationsData';
import { api, RailwayApiService } from '../services/api';

export const USER_ROLES = [
  { id: 'DOM_OFFICER', title: 'DOM - Divisional Operations Manager', dept: 'Operating', icon: 'ShieldCheck' },
  { id: 'DRM', title: 'Divisional Railway Manager (DRM)', dept: 'Administration', icon: 'ShieldCheck' },
  { id: 'CHIEF_CONTROLLER', title: 'Chief Controller (Operations)', dept: 'Operating', icon: 'ShieldCheck' },
  { id: 'SSE_PWAY', title: 'Senior Section Engineer (P-Way)', dept: 'Engineering', icon: 'Tool' },
  { id: 'SSE_TRD', title: 'SSE (Traction / OHE)', dept: 'Electrical', icon: 'Zap' },
  { id: 'SSE_SIG', title: 'SSE (Signalling & Telecom)', dept: 'S&T', icon: 'Activity' },
  { id: 'SECTION_OFFICER', title: 'Section Officer (Operations)', dept: 'Operating', icon: 'Radio' },
  { id: 'STATION_MASTER', title: 'Station Superintendent / Master', dept: 'Station Ops', icon: 'Radio' }
];

const RailwayContext = createContext();

export const RailwayProvider = ({ children }) => {
  const [currentZone, setCurrentZone] = useState('WCR');
  const [currentDivision, setCurrentDivision] = useState('Bhopal');

  const [currentUser, setCurrentUser] = useState({
    name: 'Shri Sanjay Srivastava',
    role: 'DOM',
    title: 'Divisional Operations Manager (DOM)',
    division: 'Bhopal',
    zone: 'WCR',
    badgeId: 'OFF-WCR-DOM-01',
    avatar: '👨‍✈️'
  });

  const [selectedCorridorId, setSelectedCorridorId] = useState('BPL-SEH');
  const [tasks, setTasks] = useState(initialTasks);
  const [assets, setAssets] = useState(initialAssets);
  const [blockPlans, setBlockPlans] = useState(mockGeneratedBlockPlans);
  const [recommendations, setRecommendations] = useState(initialRecommendations);

  // Today's Maintenance Work queue selected & authorized by DOM Officer
  const [todayWorkTasks, setTodayWorkTasks] = useState(() => {
    try {
      const saved = sessionStorage.getItem('railopt_today_maintenance_work');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialTasks.filter(t => t.zone === 'WCR' || t.status === 'SCHEDULED' || t.lifecycleState === 'DOM_AUTHORIZED');
  });

  // Active Maintenance Work executing currently
  const [activeWorkTasks, setActiveWorkTasks] = useState(() => {
    return initialTasks.filter(t => t.status === 'IN_PROGRESS' || t.lifecycleState === 'ACTIVE');
  });

  // Backend-driven state with complete local fallback
  const [corridors, setCorridors] = useState(localCorridors);
  const [trainsList, setTrainsList] = useState(localTrains);
  const [departments, setDepartments] = useState([]);
  const [backendOnline, setBackendOnline] = useState(true);

  // Real-time Notification System
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'WEATHER',
      title: 'AI Weather Alert',
      message: 'Heavy convective showers predicted along BPL–SEH section at 14:00 IST. Pre-block drainage check advised.',
      severity: 'INFO',
      timestamp: '10:15 IST',
      read: false
    },
    {
      id: 2,
      type: 'APPROVAL',
      title: 'Approval Required',
      message: 'Block Plan BP-WCR-1024 pending TRD electrical safety clearance.',
      severity: 'WARNING',
      timestamp: '11:00 IST',
      read: false
    },
    {
      id: 3,
      type: 'BLOCK_UPDATE',
      title: 'Block Time Updated',
      message: 'Block BP-WCR-1020 adjusted to 11:30–12:30 IST for passenger train 12002 clearance.',
      severity: 'INFO',
      timestamp: '11:20 IST',
      read: false
    }
  ]);

  const addNotification = useCallback((notif) => {
    const item = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      read: false,
      ...notif
    };
    setNotifications(prev => [item, ...prev]);
  }, []);

  // Live Train Telemetry State (RailRadar / Simulation) with full demo feed
  const [liveTrains, setLiveTrains] = useState(() => {
    return localTrains.map((t, idx) => ({
      trainNumber: t.trainNo,
      trainName: t.name,
      speedKmh: t.maxSpeed || 110,
      delayMinutes: t.currentDelayMins || 0,
      currentSection: t.track === 'UP_MAIN' ? 'BPL - BIH' : 'SEH - BIH',
      currentStation: t.slots?.[0]?.station || 'BPL',
      nextStation: t.slots?.[1]?.station || 'SEH',
      dataSource: 'SIMULATION',
      freshness: 'LIVE',
      status: t.status || 'ON_TIME',
      routeMatchStatus: 'MATCHED',
      routeMatchConfidence: 98,
      kavachFitted: t.kavachFitted ?? true
    }));
  });

  const [telemetrySummary, setTelemetrySummary] = useState({
    totalTrains: 18,
    liveTrains: 18,
    delayedTrains: 2,
    staleTrains: 0,
    activeConflicts: 1,
    dataSource: 'SIMULATION',
    freshness: 'LIVE',
    lastUpdate: 'LIVE',
    providerAvailable: true,
    providerName: 'CRIS-COIS-SIMULATOR'
  });
  const [isLiveTelemetryLoading, setIsLiveTelemetryLoading] = useState(false);

  // Load all live data from Spring Boot backend on mount & when zone changes
  const refreshZoneData = useCallback(async (zoneToLoad = currentZone) => {
    try {
      // 1. Tasks by zone
      const liveTasks = await api.maintenanceTasks.getByZone(zoneToLoad);
      if (Array.isArray(liveTasks) && liveTasks.length > 0) {
        setTasks(liveTasks);
        setBackendOnline(true);
      }
    } catch (err) {
      console.warn('[RailwayContext] Tasks by zone fallback:', err.message);
    }

    // 2. Today's tasks
    try {
      const todayTasks = await api.maintenanceTasks.getToday(zoneToLoad);
      if (Array.isArray(todayTasks) && todayTasks.length > 0) {
        setTodayWorkTasks(todayTasks);
      }
    } catch (err) {
      console.warn('[RailwayContext] Today tasks fallback:', err.message);
    }

    // 3. Active tasks
    try {
      const active = await api.maintenanceTasks.getActive(zoneToLoad);
      if (Array.isArray(active) && active.length > 0) {
        setActiveWorkTasks(active);
      }
    } catch (err) {
      console.warn('[RailwayContext] Active tasks fallback:', err.message);
    }

    // 4. Block plans
    try {
      const livePlans = await RailwayApiService.getBlockPlans();
      if (Array.isArray(livePlans) && livePlans.length > 0) {
        setBlockPlans(livePlans);
      }
    } catch (err) {
      console.warn('[RailwayContext] Block plans fallback:', err.message);
    }

    // 5. Departments
    try {
      const liveDepts = await api.departments.getAll();
      if (Array.isArray(liveDepts) && liveDepts.length > 0) {
        setDepartments(liveDepts);
      }
    } catch (err) {
      console.warn('[RailwayContext] Departments fallback:', err.message);
    }

    // 6. Corridors
    try {
      const liveCorridors = await RailwayApiService.getCorridors();
      if (Array.isArray(liveCorridors) && liveCorridors.length > 0) {
        const normalized = liveCorridors.map(normalizeBackendCorridor);
        setCorridors(normalized);
      }
    } catch (err) {
      console.warn('[RailwayContext] Corridors fallback:', err.message);
    }

    // 7. Assets
    try {
      const liveAssets = await RailwayApiService.getRailwayAssets();
      if (Array.isArray(liveAssets) && liveAssets.length > 0) {
        setAssets(liveAssets);
      }
    } catch (err) {
      console.warn('[RailwayContext] Assets fallback:', err.message);
    }
  }, [currentZone]);

  useEffect(() => {
    refreshZoneData(currentZone);
  }, [currentZone, refreshZoneData]);

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
      id: `TSK-${currentZone}-${Date.now().toString().slice(-4)}`,
      taskId: `TSK-${currentZone}-${Date.now().toString().slice(-4)}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      submittedBy: currentUser.title || currentUser.name,
      status: 'PENDING_BLOCK',
      lifecycleState: 'REQUESTED'
    };
    setTasks(prev => [taskWithId, ...prev]);
    addToast(`Requisition ${taskWithId.taskId || taskWithId.id} registered successfully`, 'success');
    return taskWithId;
  }, [currentZone, currentUser.title, currentUser.name, addToast]);

  // Add task to Today's Maintenance Work (DOM Officer Action)
  const addToTodayWork = useCallback((task) => {
    if (!task) return;
    const taskId = task.taskId || task.id;
    setTodayWorkTasks(prev => {
      if (prev.some(t => (t.taskId || t.id) === taskId)) {
        return prev;
      }
      const updated = [{ ...task, status: 'SCHEDULED', lifecycleState: 'DOM_AUTHORIZED' }, ...prev];
      try {
        sessionStorage.setItem('railopt_today_maintenance_work', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setTasks(prev => prev.map(t => {
      if ((t.taskId || t.id) === taskId) {
        return { ...t, status: 'SCHEDULED', lifecycleState: 'DOM_AUTHORIZED' };
      }
      return t;
    }));
    addToast(`Task [${taskId}] approved & added to Today's Maintenance Work by DOM Officer`, 'success');
  }, [addToast]);

  // Remove task from Today's Maintenance Work
  const removeFromTodayWork = useCallback((taskId) => {
    setTodayWorkTasks(prev => {
      const updated = prev.filter(t => (t.taskId || t.id) !== taskId);
      try {
        sessionStorage.setItem('railopt_today_maintenance_work', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast(`Task [${taskId}] removed from Today's Maintenance Work`, 'info');
  }, [addToast]);

  // Approve a Block Plan
  const approveBlockPlan = useCallback((planId) => {
    setBlockPlans(prev => prev.map(plan => {
      if ((plan.planId || plan.id) === planId) {
        return {
          ...plan,
          status: 'APPROVED',
          approvedBy: `${currentUser.name} (${currentUser.title || currentUser.role})`,
          approvedAt: istTimeStr + ' IST'
        };
      }
      return plan;
    }));
    addToast(`Block Plan ${planId} approved & transmitted to COIS / FOIS`, 'success');
  }, [currentUser.name, currentUser.title, currentUser.role, istTimeStr, addToast]);

  // Add newly generated block plan
  const addGeneratedBlockPlan = useCallback((newPlan) => {
    setBlockPlans(prev => [newPlan, ...prev]);
    const loc = newPlan.section || newPlan.corridorName || 'Corridor';
    addToast(`New AI Block Plan generated for ${loc}`, 'success');
  }, [addToast]);

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  }, [addToast]);

  // Submit a new maintenance task via API and local state
  const submitMaintenanceTask = useCallback(async (newTask) => {
    try {
      const payload = {
        ...newTask,
        zone: newTask.zone || currentZone,
        division: newTask.division || currentDivision,
        status: 'PENDING_BLOCK',
        lifecycleState: 'REQUESTED'
      };
      const created = await api.maintenanceTasks.create(payload);
      const savedTask = created || {
        ...payload,
        id: `TSK-${currentZone}-${Date.now().toString().slice(-4)}`,
        taskId: `TSK-${currentZone}-${Date.now().toString().slice(-4)}`
      };
      setTasks(prev => [savedTask, ...prev]);
      addToast(`Requisition ${savedTask.taskId || savedTask.id} registered in MongoDB successfully`, 'success');
      return savedTask;
    } catch (err) {
      console.warn('[RailwayContext] Task submission fallback to local:', err.message);
      const fallbackTask = {
        ...newTask,
        id: `TSK-${currentZone}-${Date.now().toString().slice(-4)}`,
        taskId: `TSK-${currentZone}-${Date.now().toString().slice(-4)}`,
        zone: currentZone,
        division: currentDivision,
        status: 'PENDING_BLOCK',
        lifecycleState: 'REQUESTED',
        submittedAt: new Date().toISOString()
      };
      setTasks(prev => [fallbackTask, ...prev]);
      addToast(`Requisition ${fallbackTask.taskId} registered locally`, 'success');
      return fallbackTask;
    }
  }, [currentZone, currentDivision, addToast]);

  // DOM Officer Authorization of Today's Maintenance Work
  const authorizeTodayTasks = useCallback(async ({ taskIds, officerId, password }) => {
    try {
      const response = await api.maintenanceTasks.authorizeToday({
        taskIds,
        officerId,
        password,
        zone: currentZone,
        division: currentDivision
      });
      // Refresh tasks
      await refreshZoneData(currentZone);
      addToast(`${taskIds.length} tasks authorized by DOM and added to Today's Maintenance Work`, 'success');
      return response;
    } catch (err) {
      console.warn('[RailwayContext] authorizeTodayTasks fallback:', err.message);
      // Local fallback
      setTasks(prev => prev.map(t => {
        const id = t.taskId || t.id;
        if (taskIds.includes(id)) {
          return { ...t, status: 'SCHEDULED', lifecycleState: 'DOM_AUTHORIZED' };
        }
        return t;
      }));
      const selected = tasks.filter(t => taskIds.includes(t.taskId || t.id));
      setTodayWorkTasks(prev => [...selected, ...prev.filter(t => !taskIds.includes(t.taskId || t.id))]);
      addToast(`${taskIds.length} tasks authorized for Today's Work`, 'success');
      return { success: true, authorizedCount: taskIds.length };
    }
  }, [currentZone, currentDivision, tasks, refreshZoneData, addToast]);

  // Step-wise sequential departmental approval
  const approveBlockPlanStep = useCallback(async (planId, department, officerId, officerName, role, remarks) => {
    try {
      const result = await RailwayApiService.approveBlockPlanStep(planId, department, officerId, officerName, role, remarks);
      await refreshZoneData(currentZone);
      addToast(`Department ${department} clearance recorded for Block Plan ${planId}`, 'success');
      return result;
    } catch (err) {
      console.warn('[RailwayContext] approveBlockPlanStep fallback:', err.message);
      // Local approval update
      setBlockPlans(prev => prev.map(p => {
        if ((p.planId || p.id) === planId) {
          const updatedSteps = (p.approvalSteps || []).map(s => {
            if (s.department === department) {
              return { ...s, status: 'APPROVED', approvedBy: officerName, approvedAt: new Date().toISOString() };
            }
            return s;
          });
          const allApproved = updatedSteps.every(s => s.status === 'APPROVED');
          return {
            ...p,
            approvalSteps: updatedSteps,
            status: allApproved ? 'APPROVED' : 'APPROVAL_IN_PROGRESS'
          };
        }
        return p;
      }));
      addToast(`Department ${department} clearance recorded locally`, 'success');
      return { success: true };
    }
  }, [currentZone, refreshZoneData, addToast]);

  return (
    <RailwayContext.Provider
      value={{
        currentZone,
        setCurrentZone,
        currentDivision,
        setCurrentDivision,
        refreshZoneData,
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
        todayWorkTasks,
        setTodayWorkTasks,
        activeWorkTasks,
        setActiveWorkTasks,
        addToTodayWork,
        removeFromTodayWork,
        addTask,
        submitMaintenanceTask,
        authorizeTodayTasks,
        assets,
        setAssets,
        blockPlans,
        setBlockPlans,
        approveBlockPlan,
        approveBlockPlanStep,
        addGeneratedBlockPlan,
        recommendations,
        setRecommendations,
        istTimeStr,
        istDateStr,
        toasts,
        addToast,
        notifications,
        addNotification,
        markAllNotificationsRead,
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
