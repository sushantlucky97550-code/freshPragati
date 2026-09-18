import React, { useState, useEffect, useCallback } from 'react';
import { useRailway } from '../context/RailwayContext';
import { api } from '../services/api';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  FileText,
  RefreshCw,
  Trash2,
  Loader2,
  AlertCircle,
  Inbox
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const MaintenanceTasksPage = ({ onNavigateToPlanning }) => {
  const { tasks, setTasks, selectedCorridor, addToast } = useRailway();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' or 'KANBAN'

  // New Requisition Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState('');
  const [newSection, setNewSection] = useState('ALJN - TDL (Km 165/10)');
  const [newTrack, setNewTrack] = useState('UP_MAIN');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newWindowHours, setNewWindowHours] = useState(3.0);
  const [newMachine, setNewMachine] = useState('CSM (09-32 Tamping Machine)');
  const [newReason, setNewReason] = useState('');
  const [newPowerBlock, setNewPowerBlock] = useState(false);

  // Load live departments and tasks from Spring Boot
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Parallel fetch: departments and tasks
      const [deptList, taskList] = await Promise.all([
        api.departments.getAll().catch((err) => {
          console.warn('Failed to load live departments:', err.message);
          return [];
        }),
        api.maintenanceTasks.getAll()
      ]);

      if (Array.isArray(deptList) && deptList.length > 0) {
        setDepartments(deptList);
        setNewDepartmentId(prev => prev || (deptList[0]?.id ? deptList[0].id.toString() : ''));
      }

      setTasks(taskList);
      if (isRefresh) {
        addToast(`Refreshed ${taskList.length} tasks from backend`, 'success');
      }
    } catch (err) {
      console.error('[MaintenanceTasksPage] Error fetching data:', err);
      setError(err.message || 'Unable to connect to Spring Boot backend at /api');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setTasks, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const titleMatch = (t.title || t.taskType || '').toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = (t.id || t.taskId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const sectionMatch = (t.section || t.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || idMatch || sectionMatch;

    const matchesDept =
      departmentFilter === 'ALL' ||
      t.department === departmentFilter ||
      t.departmentCode === departmentFilter;

    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesDept && matchesPriority;
  });

  // Create Task (POST /api/maintenance-tasks)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const selectedDept = departments.find((d) => d.id.toString() === newDepartmentId.toString()) || departments[0];
      const deptId = selectedDept ? selectedDept.id : 1;
      const deptCode = selectedDept ? selectedDept.code : 'PWAY';

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const defaultDueDate = futureDate.toISOString().split('T')[0];

      const payload = {
        taskId: `TASK-${deptCode}-${Math.floor(100 + Math.random() * 900)}`,
        departmentId: deptId,
        assetName: newSection || 'Track TDL-165',
        location: newSection || 'ALJN - TDL (Km 165/10)',
        taskType: newTitle,
        description: newReason || 'Routine track geometry maintenance and ultrasonic inspection.',
        severity: newPriority === 'EMERGENCY' || newPriority === 'CRITICAL' ? 'CRITICAL' : newPriority === 'HIGH' ? 'HIGH' : 'MEDIUM',
        priority: newPriority === 'EMERGENCY' || newPriority === 'CRITICAL' ? 'URGENT' : (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(newPriority) ? newPriority : 'MEDIUM'),
        durationMinutes: Math.round(parseFloat(newWindowHours || 3) * 60),
        dueDate: defaultDueDate,
        status: 'PENDING'
      };

      const created = await api.maintenanceTasks.create(payload);
      addToast(`Requisition ${created.taskId || created.id} registered successfully in Spring Boot`, 'success');

      setIsModalOpen(false);
      setNewTitle('');
      setNewReason('');

      // Refresh data
      await fetchData(true);
    } catch (err) {
      console.error('[Create Task Error]:', err);
      addToast(`Failed to create task: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Task (DELETE /api/maintenance-tasks/{id})
  const handleDeleteTask = async (task, e) => {
    e.stopPropagation();
    const taskDisplayId = task.taskId || task.id;
    const dbId = task.backendId || task.id;

    if (!window.confirm(`Are you sure you want to delete maintenance task ${taskDisplayId}?`)) {
      return;
    }

    try {
      await api.maintenanceTasks.delete(dbId);
      addToast(`Task ${taskDisplayId} deleted successfully from backend`, 'success');
      // Update local state and reload
      setTasks((prev) => prev.filter((t) => (t.backendId || t.id) !== dbId));
    } catch (err) {
      console.error('[Delete Task Error]:', err);
      addToast(`Failed to delete task: ${err.message}`, 'error');
    }
  };

  // Update Task Status (PUT /api/maintenance-tasks/{id})
  const handleStatusChange = async (task, newStatus, e) => {
    e.stopPropagation();
    const dbId = task.backendId || task.id;

    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const defaultDueDate = futureDate.toISOString().split('T')[0];

      const updatePayload = {
        taskId: task.taskId || task.id,
        departmentId: task.departmentId || 1,
        assetName: task.assetName || task.title,
        location: task.location || task.section,
        taskType: task.taskType || task.title,
        description: task.description || task.reason,
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(task.severity) ? task.severity : 'MEDIUM',
        priority: task.priority === 'CRITICAL' || task.priority === 'EMERGENCY' ? 'URGENT' : (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(task.priority) ? task.priority : 'MEDIUM'),
        durationMinutes: task.durationMinutes || 120,
        dueDate: task.dueDate || task.scheduledDate || defaultDueDate,
        status: newStatus
      };

      await api.maintenanceTasks.update(dbId, updatePayload);
      addToast(`Task ${task.taskId || task.id} status updated to ${newStatus}`, 'success');

      // Refresh data
      await fetchData(true);
    } catch (err) {
      console.error('[Update Task Error]:', err);
      addToast(`Failed to update task: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-red-600 dark:text-red-400" />
              Railway Maintenance Requisitions
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {tasks.length} Requisitions (Spring Boot)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Backend
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Permanent Way (P-Way), Traction Distribution (TRD), and S&T maintenance tasks synchronized with Spring Boot REST API
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            title="Refresh from Spring Boot API"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'TABLE' ? 'KANBAN' : 'TABLE')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            {viewMode === 'TABLE' ? 'Kanban View' : 'Table View'}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-railway-maroon hover:from-red-600 hover:to-red-700 text-white text-xs font-bold shadow-md shadow-red-950/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* Error Alert State */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>
              <strong>Backend Connection Error:</strong> {error}
            </span>
          </div>
          <button
            onClick={() => fetchData()}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by task ID, title, or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter (Populated from GET /api/departments) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <option key={dept.id} value={dept.code}>
                    {dept.name} ({dept.code})
                  </option>
                ))
              ) : (
                <>
                  <option value="PWAY">Permanent Way (PWAY)</option>
                  <option value="TRD">Traction & OHE (TRD)</option>
                  <option value="ST">Signal & Telecom (ST)</option>
                  <option value="MECH">Mechanical (MECH)</option>
                </>
              )}
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent / Emergency</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-12 text-center shadow-sm">
          <Loader2 className="w-8 h-8 text-red-600 dark:text-red-400 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Connecting to Spring Boot Backend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fetching maintenance tasks and departments from http://localhost:8080/api...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#0E1626] p-12 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Failed to Connect to Backend</h3>
          <p className="text-xs text-red-600 dark:text-red-400 max-w-md mx-auto mt-1 mb-4 font-mono">
            {error}
          </p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-12 text-center shadow-sm">
          <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Maintenance Tasks Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            {tasks.length === 0
              ? 'No tasks are currently registered in the database. Use "New Requisition" to create one.'
              : 'No tasks matched your current search and department/priority filter criteria.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {tasks.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('ALL');
                  setPriorityFilter('ALL');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
            >
              Add Requisition
            </button>
          </div>
        </div>
      ) : viewMode === 'TABLE' ? (
        /* Table View */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Task ID & Department</th>
                  <th className="px-4 py-3">Maintenance Description</th>
                  <th className="px-3 py-3">Section & Track</th>
                  <th className="px-3 py-3">Window Needed</th>
                  <th className="px-3 py-3">Track Machine</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredTasks.map((t) => (
                  <tr key={t.backendId || t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{t.taskId || t.id}</span>
                        {t.backendId && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-normal">
                            #{t.backendId}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">{t.departmentName}</div>
                    </td>

                    <td className="px-4 py-3.5 font-sans">
                      <div className="font-bold text-slate-800 dark:text-slate-200 max-w-xs">{t.title}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">{t.reason}</div>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="font-bold text-slate-700 dark:text-slate-300">{t.section}</div>
                      <span className="text-[10px] text-slate-500">{t.track}</span>
                    </td>

                    <td className="px-3 py-3.5">
                      <span className="font-bold text-slate-900 dark:text-white">{t.requiredWindowHours} hrs</span>
                      {t.powerBlockRequired && (
                        <span className="block text-[9px] text-amber-500 font-bold">⚡ 25kV OHE Cut</span>
                      )}
                    </td>

                    <td className="px-3 py-3.5 font-sans text-slate-600 dark:text-slate-300">
                      {t.machineRequired || 'Track Crew'}
                    </td>

                    <td className="px-3 py-3.5">
                      <StatusBadge status={t.priority} size="xs" />
                    </td>

                    <td className="px-3 py-3.5">
                      {/* Status Dropdown to trigger PUT /api/maintenance-tasks/{id} */}
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t, e.target.value, e)}
                        className="bg-transparent border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="DEFERRED">DEFERRED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5 text-right font-sans">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onNavigateToPlanning && onNavigateToPlanning(t)}
                          className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span>Plan Block</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        {/* Delete Action (DELETE /api/maintenance-tasks/{id}) */}
                        <button
                          onClick={(e) => handleDeleteTask(t, e)}
                          title="Delete Requisition from Backend"
                          className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'PENDING_BLOCK', label: 'Pending Block Window', color: 'amber' },
            { id: 'SHADOW_ELIGIBLE', label: 'In Progress / Ready', color: 'sky' },
            { id: 'APPROVED', label: 'Scheduled / Completed', color: 'emerald' }
          ].map((column) => {
            const columnTasks = filteredTasks.filter((t) =>
              column.id === 'PENDING_BLOCK'
                ? t.status === 'PENDING' || t.status === 'PENDING_BLOCK'
                : column.id === 'SHADOW_ELIGIBLE'
                ? t.status === 'IN_PROGRESS' || t.status === 'SHADOW_ELIGIBLE'
                : t.status === 'SCHEDULED' || t.status === 'COMPLETED' || t.status === 'APPROVED'
            );

            return (
              <div
                key={column.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1220] p-4 flex flex-col"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {column.label}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="mt-3 space-y-3 flex-1">
                  {columnTasks.map((t) => (
                    <div
                      key={t.backendId || t.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm hover:border-slate-300 transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                          {t.taskId || t.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={t.priority} size="xs" />
                          <button
                            onClick={(e) => handleDeleteTask(t, e)}
                            title="Delete task"
                            className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-slate-800 dark:text-slate-100">{t.title}</div>

                      <div className="text-[11px] text-slate-500 font-mono">
                        {t.section} • {t.track}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{t.requiredWindowHours}h window</span>
                        <button
                          onClick={() => onNavigateToPlanning && onNavigateToPlanning(t)}
                          className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1"
                        >
                          Plan Block <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Requisition Modal Dialog (Connected to POST /api/maintenance-tasks) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title="Submit Maintenance Block Requisition"
        subtitle="Registers maintenance task in Spring Boot backend & requests possession window"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-700 to-railway-maroon text-white text-xs font-bold hover:from-red-600 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to DB...</span>
                </>
              ) : (
                <span>Submit to Backend</span>
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="font-mono font-bold uppercase text-[11px] text-slate-500 block mb-1">
              Maintenance Work Type / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Continuous Track Tamping or OHE Dropper Replacement"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono font-bold uppercase text-[11px] text-slate-500 block mb-1">
                Department (from DB) *
              </label>
              <select
                value={newDepartmentId}
                onChange={(e) => setNewDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white"
              >
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Permanent Way (PWAY)</option>
                    <option value="2">Traction & OHE (TRD)</option>
                    <option value="3">Signal & Telecom (ST)</option>
                    <option value="4">Mechanical (MECH)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="font-mono font-bold uppercase text-[11px] text-slate-500 block mb-1">
                Priority *
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white"
              >
                <option value="URGENT">Urgent (USFD / Rail Fracture)</option>
                <option value="CRITICAL">Critical (TGI Degradation)</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Routine Maintenance</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono font-bold uppercase text-[11px] text-slate-500 block mb-1">
                Corridor Section & Km *
              </label>
              <input
                type="text"
                required
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-mono font-bold uppercase text-[11px] text-slate-500 block mb-1">
                Track Line
              </label>
              <select
                value={newTrack}
                onChange={(e) => setNewTrack(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white"
              >
                <option value="UP_MAIN">UP Main Line</option>
                <option value="DN_MAIN">DOWN Main Line</option>
                <option value="3RD_LINE">3rd Line / Freight Loop</option>
                <option value="BOTH">Both Lines (Full Isolation)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono font-bold uppercase text-[11px] text-slate-500 block mb-1">
                Required Window (Hours) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24.0"
                value={newWindowHours}
                onChange={(e) => setNewWindowHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-mono font-bold uppercase text-[11px] text-slate-500 block mb-1">
                Track Machine Deployment
              </label>
              <select
                value={newMachine}
                onChange={(e) => setNewMachine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white"
              >
                <option value="CSM (09-32 Tamping Machine)">CSM Tamping Machine</option>
                <option value="BCM (Ballast Cleaning Machine)">BCM Ballast Cleaner</option>
                <option value="UNIMAT 08-4S (Point Tamping)">UNIMAT Point Tamping</option>
                <option value="4-Wheeler OHE Tower Wagon">OHE Tower Wagon</option>
                <option value="None / Manual Hand Work">Manual Hand Tools Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono font-bold uppercase text-[11px] text-slate-500 block mb-1">
              Engineering Justification / Defect Details
            </label>
            <textarea
              rows="3"
              placeholder="Describe track geometry defects, ultrasonic findings, or contact wire wear..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="powerBlockCheck"
              checked={newPowerBlock}
              onChange={(e) => setNewPowerBlock(e.target.checked)}
              className="rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="powerBlockCheck" className="text-slate-700 dark:text-slate-300 text-xs">
              Requires 25 kV AC Traction Power Block (OHE De-energization)
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
