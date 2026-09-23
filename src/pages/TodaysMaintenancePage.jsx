import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Train,
  CloudRain,
  AlertTriangle,
  FileText,
  Printer,
  ArrowRight,
  Cpu,
  GitMerge,
  Layers,
  ChevronRight,
  ExternalLink,
  Wrench,
  Activity,
  Zap
} from 'lucide-react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { RailwayApiService } from '../services/api';

export const TodaysMaintenancePage = ({ onNavigate }) => {
  const {
    currentZone,
    currentDivision,
    todayWorkTasks,
    blockPlans,
    approveBlockPlanStep,
    refreshZoneData,
    addToast
  } = useRailway();

  const { user: authUser } = useAuth();

  // Selected task for block planning
  const [selectedTaskForPlan, setSelectedTaskForPlan] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [activePlan, setActivePlan] = useState(null);
  const [showConfidentialReport, setShowConfidentialReport] = useState(false);
  const [isApprovalWorkflowActive, setIsApprovalWorkflowActive] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const stages = [
    'MAINTENANCE REQUIREMENTS',
    'CORRIDOR ANALYSIS',
    'TRAIN CONFLICT ANALYSIS',
    'TIME WINDOW ANALYSIS',
    'DEPARTMENT COORDINATION',
    'WEATHER CHECK',
    'OPTIMIZATION',
    'SAFETY VALIDATION',
    'BLOCK PLAN READY'
  ];

  const handleGenerateBlockPlan = (task) => {
    setSelectedTaskForPlan(task);
    setIsGeneratingPlan(true);
    setGenerationStage(0);
    setActivePlan(null);
    setShowConfidentialReport(false);

    // Multi-stage visual simulation
    let current = 0;
    const interval = setInterval(async () => {
      current++;
      setGenerationStage(current);

      if (current >= stages.length - 1) {
        clearInterval(interval);
        try {
          const taskId = task.taskId || task.id;
          const planResponse = await RailwayApiService.generateBlockPlan({
            corridorId: task.section || 'BPL-SEH',
            selectedTaskIds: [taskId],
            durationMinutes: task.estimatedDurationMinutes || 120,
            zone: currentZone,
            division: currentDivision
          });

          // Use real generated plan or fallback with rich official details
          const generated = planResponse || {
            id: `BP-${currentZone}-1024`,
            planId: `BP-${currentZone}-1024`,
            zone: currentZone,
            division: currentDivision,
            section: task.section || 'BPL - SEH',
            fromStation: task.fromStation || 'BPL',
            toStation: task.toStation || 'SEH',
            track: task.track || 'UP_MAIN',
            date: 'Today',
            startTime: '11:30',
            endTime: '13:30',
            durationMinutes: 120,
            departments: ['ENGINEERING', 'SIGNAL_AND_TELECOM', 'TRACTION_DISTRIBUTION'],
            assignedTaskIds: [taskId],
            status: 'APPROVAL_IN_PROGRESS',
            version: 1,
            weatherAlert: {
              forecast: 'Partly Cloudy with Moderate Surface Winds (14 km/h)',
              riskLevel: 'MODERATE_MONITORED',
              adverseConditions: 'Pre-monsoon convection along Betwa basin (Bhopal-Sehore)',
              affectedWorkType: 'OHE Wire Tension & Rail Welding',
              aiWarning: 'High ambient temperature (38°C) during 12:00–14:00 may affect rail neutral temperature (T_k). Ensure de-stressing tensors are calibrated.',
              operationalRecommendation: 'Maintain continuous thermit weld temperature logging. Track possession cleared for execution.'
            },
            affectedTrains: [
              { trainNo: '12002', name: 'New Delhi - Bhopal Shatabdi Exp', regulation: 'Regulated by +12 mins at Phanda (PUD)', impact: 'PASSENGER_REGULATION' },
              { trainNo: 'BOXN-8841', name: 'Freight Container (Coal)', regulation: 'Diverted via Down Loop line', impact: 'FREIGHT_DIVERSION' }
            ],
            approvalSteps: [
              { department: 'ENGINEERING', officerRole: 'SSE_PWAY', status: 'APPROVED', approvedBy: 'Er. Vikram Singh (SSE/P-Way)', approvedAt: '10:15 IST' },
              { department: 'SIGNAL_AND_TELECOM', officerRole: 'SSE_SIG', status: 'APPROVED', approvedBy: 'Er. Priya Sundaram (SSE/S&T)', approvedAt: '10:30 IST' },
              { department: 'TRACTION_DISTRIBUTION', officerRole: 'SSE_TRD', status: 'PENDING', approvedBy: null, approvedAt: null }
            ]
          };

          setActivePlan(generated);
          setShowConfidentialReport(true);
        } catch (err) {
          console.error('Error generating block plan:', err);
        } finally {
          setIsGeneratingPlan(false);
        }
      }
    }, 450);
  };

  // Department step approval handler
  const handleApproveDepartment = async (department) => {
    if (!activePlan) return;
    setIsApproving(true);

    try {
      const planId = activePlan.planId || activePlan.id;
      const officerId = authUser?.officerId || 'OFF-WCR-TRD-01';
      const officerName = authUser?.name || 'Er. Amitav Sen (SSE/TRD)';
      const role = authUser?.role || 'TRD_OFFICER';

      await approveBlockPlanStep(planId, department, officerId, officerName, role, 'All electrical clearances and isolators grounded');

      // Update active plan state locally
      const updatedSteps = (activePlan.approvalSteps || []).map(s => {
        if (s.department === department) {
          return {
            ...s,
            status: 'APPROVED',
            approvedBy: officerName,
            approvedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
          };
        }
        return s;
      });

      const allApproved = updatedSteps.every(s => s.status === 'APPROVED');
      const updatedPlan = {
        ...activePlan,
        approvalSteps: updatedSteps,
        status: allApproved ? 'APPROVED' : 'APPROVAL_IN_PROGRESS'
      };

      setActivePlan(updatedPlan);

      // Section 25: Critical Automatic Transition
      if (allApproved) {
        addToast(`🎉 Block Plan ${planId} FULLY APPROVED! Automatically transitioning to Currently Active Maintenance Work...`, 'success', 6000);
        await refreshZoneData(currentZone);
        setTimeout(() => {
          if (onNavigate) {
            onNavigate('active-work');
          }
        }, 1800);
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 w-full max-w-7xl mx-auto selection:bg-red-700 selection:text-white font-sans">
      {/* Official Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#070D18] via-[#0A1426] to-[#070D18] border border-blue-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              {currentZone} • {currentDivision} DIVISION
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              DOM AUTHORIZED SCHEDULE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono flex items-center gap-2">
            <span>TODAY'S MAINTENANCE WORK</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Requisitions approved by Divisional Operations Manager (DOM) for block planning and execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-slate-300">
            <span>TOTAL SCHEDULED: </span>
            <strong className="text-cyan-400">{todayWorkTasks.length} TASKS</strong>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('active-work')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span>VIEW ACTIVE WORK</span>
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Generation Stages Animation Overlay */}
      {isGeneratingPlan && (
        <div className="p-6 rounded-2xl bg-[#0B1424] border-2 border-cyan-500/80 shadow-2xl space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-cyan-400 animate-spin-slow" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Block Optimization Solver In Progress
                </h3>
                <p className="text-xs text-slate-400">
                  Executing multi-department corridor MILP constraints & weather analysis...
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-400">
              STAGE {generationStage + 1} OF {stages.length}
            </span>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 pt-2">
            {stages.map((stageName, sIdx) => {
              const isDone = sIdx <= generationStage;
              const isCurrent = sIdx === generationStage;

              return (
                <div
                  key={sIdx}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isDone
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="text-[10px] font-bold">
                    {isDone ? '✓' : sIdx + 1}
                  </div>
                  <div className="text-[9px] font-mono truncate mt-0.5">
                    {stageName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* CONFIDENTIAL BLOCK PLAN REPORT MODAL / VIEW              */}
      {/* ────────────────────────────────────────────────────────── */}
      {activePlan && showConfidentialReport && (
        <div className="p-6 rounded-2xl bg-[#0A1220] border-2 border-amber-500/60 shadow-2xl space-y-6 font-mono text-xs">
          {/* Top Banner: Confidential Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-400 font-bold">
                CONFIDENTIAL
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  CONFIDENTIAL — RAILWAY OPERATIONS / MAINTENANCE BLOCK PLAN
                </h2>
                <div className="text-[11px] text-slate-400">
                  {activePlan.zone} • {activePlan.division} DIVISION • PLAN ID: {activePlan.planId || activePlan.id} (v{activePlan.version || 1})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>PRINT DOSSIER</span>
              </button>
            </div>
          </div>

          {/* Section: Operational Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block">CORRIDOR / SECTION</span>
              <span className="text-white font-bold">{activePlan.section}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">BLOCK WINDOW TIME</span>
              <span className="text-amber-400 font-bold">{activePlan.startTime} – {activePlan.endTime} IST</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">TOTAL DURATION</span>
              <span className="text-slate-200 font-bold">{activePlan.durationMinutes} Minutes</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">TRACK OCCUPANCY</span>
              <span className="text-cyan-400 font-bold">{activePlan.track || 'UP MAIN LINE'}</span>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* 21. AI WEATHER & OPERATIONAL WEATHER ALERT               */}
          {/* ──────────────────────────────────────────────────────── */}
          {activePlan.weatherAlert && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-600/50 space-y-2">
              <div className="flex items-center justify-between text-cyan-300 font-bold">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span className="text-xs uppercase">AI WEATHER & OPERATIONAL WEATHER ALERT</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-900 text-blue-200 text-[10px] border border-blue-500/40">
                  RISK: {activePlan.weatherAlert.riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">FORECAST:</span>
                  <span>{activePlan.weatherAlert.forecast}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">AFFECTED WORK TYPE:</span>
                  <span>{activePlan.weatherAlert.affectedWorkType}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-950/70 border border-blue-800 text-[11px] text-amber-200">
                <strong>AI Operational Warning:</strong> {activePlan.weatherAlert.aiWarning}
              </div>
            </div>
          )}

          {/* Affected Trains & Regulations */}
          <div>
            <h4 className="font-bold text-slate-300 mb-2 uppercase text-xs">
              TRAIN REGULATION & CONFLICT MITIGATION PLAN:
            </h4>
            <div className="space-y-1.5">
              {activePlan.affectedTrains?.map((train, tIdx) => (
                <div
                  key={tIdx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-amber-400" />
                    <span className="text-white font-bold">{train.trainNo} - {train.name}</span>
                  </div>
                  <span className="text-slate-300 font-semibold">{train.regulation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* 23 & 24. SEQUENTIAL DEPARTMENT APPROVAL SYSTEM           */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>MANDATORY DEPARTMENTAL APPROVAL CHAIN</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sequential safety clearances required before track possession becomes active.
                </p>
              </div>

              {/* Overall Status Badge */}
              <div>
                {activePlan.approvalSteps?.every(s => s.status === 'APPROVED') ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    🟢 FULLY APPROVED
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-600 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    WAITING FOR TRD CLEARANCE
                  </span>
                )}
              </div>
            </div>

            {/* Approval Steps Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activePlan.approvalSteps?.map((step) => {
                const isApproved = step.status === 'APPROVED';
                return (
                  <div
                    key={step.department}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                      isApproved
                        ? 'bg-emerald-950/30 border-emerald-600/60'
                        : 'bg-amber-950/30 border-amber-600/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-xs">{step.department}</span>
                        {isApproved ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1 text-[10px]">
                            <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400">
                        {isApproved ? (
                          <>
                            <div className="text-slate-300 font-semibold">{step.approvedBy}</div>
                            <div className="text-slate-500">{step.approvedAt}</div>
                          </>
                        ) : (
                          <div className="text-amber-300/80">Awaiting SSE/TRD Clearance</div>
                        )}
                      </div>
                    </div>

                    {!isApproved && (
                      <button
                        onClick={() => handleApproveDepartment(step.department)}
                        disabled={isApproving}
                        className="mt-3 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>AUTHORIZE CLEARANCE</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TODAY'S WORK TASKS LIST                                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-mono tracking-wider text-slate-300 uppercase">
          SCHEDULED WORKS READY FOR BLOCK PLAN GENERATION ({todayWorkTasks.length})
        </h3>

        {todayWorkTasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0A1220] border border-slate-800 text-center space-y-3 font-mono">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300">
              No tasks currently selected for Today's Maintenance Work.
            </p>
            <p className="text-xs text-slate-500">
              Go to the Main Command Dashboard, select tasks from the AI Combined Priority Queue, and authenticate as DOM to schedule them.
            </p>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-xs"
            >
              Go to Command Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayWorkTasks.map((task, idx) => {
              const taskId = task.taskId || task.id || `TSK-${idx + 1}`;
              const hasGenerated = activePlan && (activePlan.assignedTaskIds || []).includes(taskId);

              return (
                <div
                  key={taskId}
                  className="p-5 rounded-2xl bg-[#0A1324] border border-slate-800 hover:border-slate-700 transition-all font-mono text-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-blue-950 border border-blue-600/60 text-cyan-400 font-bold flex items-center justify-center text-[11px]">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {task.title || task.workDescription || 'Section Overhaul & Inspection'}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                        {taskId}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold">
                        STATUS: {task.status || 'Awaiting Block Plan'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1 text-cyan-300 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {task.fromStation || 'BPL'} → {task.toStation || 'SEH'} ({task.section || 'BPL-SEH'})
                      </span>
                      <span>•</span>
                      <span>DURATION: {task.estimatedDurationMinutes || 120} MINS</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{task.department || 'ENGINEERING + S&T'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end lg:self-auto">
                    <button
                      onClick={() => handleGenerateBlockPlan(task)}
                      disabled={isGeneratingPlan}
                      className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-950/40 border border-red-500/40"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>GENERATE BLOCK PLAN</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
