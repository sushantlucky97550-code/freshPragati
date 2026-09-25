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
          // Ensure the generated plan has all required UI fields mapped correctly
          // and add the requested weather forecasting detail notifying about rainfall.
          const normalizedPlan = {
            ...(planResponse || {}),
            id: planResponse?.id || `BP-${currentZone || 'WCR'}-1024`,
            planId: planResponse?.planId || `BLK-AI-2026-${Math.floor(1000 + Math.random() * 8000)}`,
            zone: planResponse?.zone || currentZone || 'WCR',
            division: planResponse?.division || currentDivision || 'Bhopal',
            section: planResponse?.section || task.section || 'Bhopal (BPL) - Sehore (SEH)',
            fromStation: planResponse?.fromStation || task.fromStation || 'BPL',
            toStation: planResponse?.toStation || task.toStation || 'SEH',
            track: planResponse?.track || planResponse?.trackLine || task.track || 'UP MAIN LINE',
            date: planResponse?.date || planResponse?.scheduledDate || new Date().toISOString().split('T')[0],
            startTime: planResponse?.startTime || (planResponse?.windowStart ? planResponse.windowStart.replace(' IST', '') : '11:30'),
            endTime: planResponse?.endTime || (planResponse?.windowEnd ? planResponse.windowEnd.replace(' IST', '') : '13:30'),
            durationMinutes: planResponse?.durationMinutes || (planResponse?.durationHours ? planResponse.durationHours * 60 : 120),
            departments: planResponse?.departments || ['ENGINEERING', 'SIGNAL_AND_TELECOM', 'TRACTION_DISTRIBUTION'],
            assignedTaskIds: planResponse?.assignedTaskIds || planResponse?.assignedTasks?.map(t => t.taskId) || [taskId],
            status: planResponse?.status || 'APPROVAL_IN_PROGRESS',
            version: planResponse?.version || 1,
            weatherAlert: planResponse?.weatherAlert || {
              forecast: `Heavy overcast with 85% probability of localized showers on ${planResponse?.date || planResponse?.scheduledDate || new Date().toISOString().split('T')[0]}`,
              riskLevel: 'HIGH_ALERT',
              adverseConditions: 'Chances of sudden rainfall and thunderstorms during the block window',
              affectedWorkType: 'OHE Wire Tension, Signalling & Rail Welding',
              aiWarning: 'High risk of rainfall during block execution. Ensure water drainage systems are clear and sensitive equipment is protected from moisture.',
              operationalRecommendation: 'Maintain continuous weather monitoring. Keep protective tarpaulins ready on site for welding points and exposed signaling gears.'
            },
            affectedTrains: planResponse?.affectedTrains || [
              { trainNo: '12002', name: 'New Delhi - Bhopal Shatabdi Exp', regulation: 'Regulated by +12 mins at Phanda (PUD)', impact: 'PASSENGER_REGULATION' },
              { trainNo: 'BOXN-8841', name: 'Freight Container (Coal)', regulation: 'Diverted via Down Loop line', impact: 'FREIGHT_DIVERSION' }
            ],
            approvalSteps: planResponse?.approvalSteps || [
              { department: 'ENGINEERING', officerRole: 'SSE_PWAY', status: 'APPROVED', approvedBy: 'Er. Vikram Singh (SSE/P-Way)', approvedAt: '10:15 IST' },
              { department: 'SIGNAL_AND_TELECOM', officerRole: 'SSE_SIG', status: 'APPROVED', approvedBy: 'Er. Priya Sundaram (SSE/S&T)', approvedAt: '10:30 IST' },
              { department: 'TRACTION_DISTRIBUTION', officerRole: 'SSE_TRD', status: 'PENDING', approvedBy: null, approvedAt: null }
            ]
          };

          setActivePlan(normalizedPlan);
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
    <div className="space-y-6 pb-16 w-full max-w-7xl mx-auto selection:bg-[#173B73] selection:text-white font-sans">
      {/* Official Header - White + Navy */}
      <div className="rounded-xl overflow-hidden border border-[#D9DEE7] shadow-md bg-white">
        <div className="bg-[#173B73] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-blue-200 uppercase tracking-widest mb-0.5">
                <span>{currentZone} &bull; {currentDivision} DIVISION &bull; DOM AUTHORIZED SCHEDULE</span>
              </div>
              <h1 className="text-lg font-black text-white tracking-tight">TODAY'S MAINTENANCE WORK</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />DOM AUTHORIZED
            </span>
          </div>
        </div>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-[#5B6575] font-medium">
            Requisitions approved by Divisional Operations Manager (DOM) for block planning and execution.
          </p>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#EBF2FA] border border-[#D9DEE7] font-mono text-xs text-[#172033]">
              <span>TOTAL SCHEDULED: </span>
              <strong className="text-[#173B73]">{todayWorkTasks.length} TASKS</strong>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('active-work')}
              className="px-4 py-2 rounded-xl bg-[#173B73] hover:bg-[#1F4380] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>VIEW ACTIVE WORK</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Generation Stages Animation Overlay */}
      {isGeneratingPlan && (
        <div className="p-6 rounded-xl bg-[#EBF2FA] border border-[#173B73]/20 shadow-md space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-[#173B73] animate-spin-slow" />
              <div>
                <h3 className="text-sm font-bold text-[#173B73] uppercase tracking-wider">
                  AI Block Optimization Solver In Progress
                </h3>
                <p className="text-xs text-[#5B6575]">
                  Executing multi-department corridor MILP constraints & weather analysis...
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#173B73]">
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
                      ? 'bg-[#173B73] border-[#173B73] text-white'
                      : 'bg-white border-[#D9DEE7] text-[#5B6575]'
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
      {/* PROFESSIONAL BLOCK PLAN REPORT DOSSIER                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {activePlan && showConfidentialReport && (
        <div className="bg-white border border-gray-300 shadow-xl max-w-5xl mx-auto font-sans text-gray-900 mt-6">
          
          {/* PROFESSIONAL HEADER */}
          <div className="p-8 border-b-4 border-[#173B73]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <img src="/assets/indian_railways_logo.png" alt="Indian Railways Logo" className="w-16 h-16 object-contain" onError={(e) => e.target.style.display = 'none'} />
                <div>
                  <h1 className="text-xl font-bold text-[#173B73] tracking-wider">PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration</h1>
                  <h2 className="text-2xl font-black text-[#1F4380] uppercase tracking-tight">AI GENERATED BLOCK PLAN</h2>
                  <div className="text-xs font-bold text-[#D98C00] tracking-widest mt-1">PROTOTYPE / DEMONSTRATION SYSTEM</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-xs font-bold text-[#173B73] flex items-center gap-1.5 shadow-sm">
                  <Printer className="w-4 h-4" /> PRINT DOSSIER
                </button>
                <div className="text-right text-sm">
                  <div className="font-bold text-[#173B73]">GENERATED TIME</div>
                  <div className="font-mono">{new Date().toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Header Summary Table */}
            <table className="w-full text-sm border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">BLOCK PLAN ID</td>
                  <td className="border border-gray-300 p-2 w-1/4 font-bold font-mono">{activePlan.planId || activePlan.id}</td>
                  <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">ZONE</td>
                  <td className="border border-gray-300 p-2 w-1/4 uppercase">{activePlan.zone}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">DIVISION</td>
                  <td className="border border-gray-300 p-2 uppercase">{activePlan.division}</td>
                  <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">DATE</td>
                  <td className="border border-gray-300 p-2 font-bold">{activePlan.date}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">VERSION</td>
                  <td className="border border-gray-300 p-2">v{activePlan.version || 1} (AI Generated)</td>
                  <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">STATUS</td>
                  <td className="border border-gray-300 p-2 font-bold uppercase text-amber-700">{activePlan.status}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-8 space-y-6">
            
            {/* 1. BLOCK PLAN DETAILS */}
            <section>
              <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
                1. BLOCK PLAN DETAILS
              </h3>
              <table className="w-full text-sm border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Start time</td>
                    <td className="border border-gray-300 p-2 font-mono font-bold text-red-700 w-1/4">{activePlan.startTime} IST</td>
                    <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">End time</td>
                    <td className="border border-gray-300 p-2 font-mono font-bold text-red-700 w-1/4">{activePlan.endTime} IST</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Total duration</td>
                    <td className="border border-gray-300 p-2 font-bold" colSpan="3">{activePlan.durationMinutes} Minutes</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 2. MAINTENANCE WORK */}
            <section>
              <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
                2. MAINTENANCE WORK
              </h3>
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-[#F4F6F8] text-[#173B73]">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">Assigned Task IDs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 font-mono">{activePlan.assignedTaskIds?.join(', ') || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 3. DEPARTMENTS */}
            <section>
              <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
                3. DEPARTMENTS
              </h3>
              <div className="border border-gray-300 p-3 text-sm font-bold text-[#173B73] bg-[#F4F6F8]">
                {activePlan.departments?.join(' • ') || 'None specified'}
              </div>
            </section>

            {/* 4. LOCATION */}
            <section>
              <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
                4. LOCATION
              </h3>
              <table className="w-full text-sm border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Corridor / Section</td>
                    <td className="border border-gray-300 p-2 w-3/4" colSpan="3">{activePlan.section}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">From station</td>
                    <td className="border border-gray-300 p-2 w-1/4">{activePlan.fromStation}</td>
                    <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">To station</td>
                    <td className="border border-gray-300 p-2 w-1/4">{activePlan.toStation}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Track Occupancy</td>
                    <td className="border border-gray-300 p-2" colSpan="3">{activePlan.track}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 5. TRAIN IMPACT */}
            <section>
              <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
                5. TRAIN IMPACT & MITIGATION
              </h3>
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-[#F4F6F8] text-[#173B73]">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">Affected trains</th>
                    <th className="border border-gray-300 p-2 text-left">Regulation requirement</th>
                    <th className="border border-gray-300 p-2 text-left">Expected operational impact</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlan.affectedTrains?.map((train, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-gray-300 p-2 font-mono font-bold">{train.trainNo} {train.name}</td>
                      <td className="border border-gray-300 p-2">{train.regulation}</td>
                      <td className="border border-gray-300 p-2 font-bold text-amber-700">{train.impact}</td>
                    </tr>
                  ))}
                  {(!activePlan.affectedTrains || activePlan.affectedTrains.length === 0) && (
                    <tr>
                      <td colSpan="3" className="border border-gray-300 p-4 text-center text-gray-500 italic">No significant train impact anticipated.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* 6. AI WEATHER & OPERATIONAL ALERT */}
            {activePlan.weatherAlert && (
              <section>
                <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3 flex items-center gap-2">
                  <CloudRain className="w-4 h-4" /> 6. WEATHER INFORMATION & ALERTS
                </h3>
                <div className="border border-gray-300 p-4 bg-blue-50/50 space-y-3">
                  <table className="w-full text-sm border-collapse border border-gray-300 bg-white">
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Forecast</td>
                        <td className="border border-gray-300 p-2 w-3/4" colSpan="3">{activePlan.weatherAlert.forecast}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Risk Level</td>
                        <td className="border border-gray-300 p-2 font-bold text-amber-700 w-1/4">{activePlan.weatherAlert.riskLevel}</td>
                        <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Adverse Conditions</td>
                        <td className="border border-gray-300 p-2 w-1/4">{activePlan.weatherAlert.adverseConditions}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="p-3 bg-white border border-gray-300 text-sm">
                    <p className="mb-2"><strong className="text-[#173B73]">Affected Work Type:</strong> {activePlan.weatherAlert.affectedWorkType}</p>
                    <p className="mb-2"><strong className="text-amber-700">AI Warning:</strong> {activePlan.weatherAlert.aiWarning}</p>
                    <p><strong className="text-emerald-700">Recommendation:</strong> {activePlan.weatherAlert.operationalRecommendation}</p>
                  </div>
                </div>
              </section>
            )}

            {/* 7. MANDATORY DEPARTMENTAL APPROVAL CHAIN */}
            <section>
              <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 7. MANDATORY DEPARTMENTAL APPROVAL CHAIN
              </h3>
              <div className="border border-gray-300 p-5 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-700">
                    Sequential safety clearances required before track possession becomes active.
                  </p>
                  <div>
                    {activePlan.approvalSteps?.every(s => s.status === 'APPROVED') ? (
                      <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-sm">
                        🟢 FULLY APPROVED
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 font-bold text-sm">
                        🟡 WAITING CLEARANCES
                      </span>
                    )}
                  </div>
                </div>
                
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead className="bg-[#F4F6F8] text-[#173B73]">
                    <tr>
                      <th className="border border-gray-300 p-2 text-left">Department</th>
                      <th className="border border-gray-300 p-2 text-left">Status</th>
                      <th className="border border-gray-300 p-2 text-left">Approved By</th>
                      <th className="border border-gray-300 p-2 text-left">Approval Time</th>
                      <th className="border border-gray-300 p-2 text-center w-40">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePlan.approvalSteps?.map((step) => {
                      const isApproved = step.status === 'APPROVED';
                      return (
                        <tr key={step.department} className={isApproved ? "bg-emerald-50/30" : "bg-white"}>
                          <td className="border border-gray-300 p-2 font-bold">{step.department}</td>
                          <td className="border border-gray-300 p-2">
                            {isApproved ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Approved
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold flex items-center gap-1">
                                <Clock className="w-4 h-4" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="border border-gray-300 p-2">{step.approvedBy || '-'}</td>
                          <td className="border border-gray-300 p-2">{step.approvedAt || '-'}</td>
                          <td className="border border-gray-300 p-2 text-center">
                            {!isApproved && (
                              <button
                                onClick={() => handleApproveDepartment(step.department)}
                                disabled={isApproving}
                                className="w-full py-1.5 px-3 bg-[#173B73] hover:bg-[#1F4380] text-white font-bold text-xs shadow"
                              >
                                AUTHORIZE
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TODAY'S WORK TASKS LIST                                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-mono tracking-wider text-[#172033] uppercase">
          SCHEDULED WORKS READY FOR BLOCK PLAN GENERATION ({todayWorkTasks.length})
        </h3>

        {todayWorkTasks.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-[#D9DEE7] text-center space-y-3 font-mono shadow-sm">
            <Calendar className="w-10 h-10 text-[#5B6575] mx-auto" />
            <p className="text-sm text-[#172033] font-bold">
              No tasks currently selected for Today's Maintenance Work.
            </p>
            <p className="text-xs text-[#5B6575]">
              Go to the Main Command Dashboard, select tasks from the AI Combined Priority Queue, and authenticate as DOM to schedule them.
            </p>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="px-4 py-2 rounded-xl bg-[#173B73] hover:bg-[#1F4380] text-white font-bold text-xs"
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
                  className="p-5 rounded-xl bg-white border border-[#D9DEE7] hover:border-[#173B73] shadow-sm transition-all font-mono text-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-[#EBF2FA] border border-[#173B73]/20 text-[#173B73] font-bold flex items-center justify-center text-[11px]">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-[#172033]">
                        {task.title || task.workDescription || 'Section Overhaul & Inspection'}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-[#F4F6F8] text-[#5B6575] border border-[#D9DEE7] text-[10px]">
                        {taskId}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#168A55] border border-emerald-200 text-[10px] font-bold">
                        STATUS: {task.status || 'Awaiting Block Plan'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[#5B6575] text-[11px]">
                      <span className="flex items-center gap-1 text-[#173B73] font-bold">
                        <MapPin className="w-3.5 h-3.5 text-[#173B73]" />
                        {task.fromStation || 'BPL'} → {task.toStation || 'SEH'} ({task.section || 'BPL-SEH'})
                      </span>
                      <span>•</span>
                      <span>DURATION: {task.estimatedDurationMinutes || 120} MINS</span>
                      <span>•</span>
                      <span className="text-[#D98C00] font-semibold">{task.department || 'ENGINEERING + S&T'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end lg:self-auto">
                    <button
                      onClick={() => handleGenerateBlockPlan(task)}
                      disabled={isGeneratingPlan}
                      className="py-2.5 px-5 rounded-xl bg-[#173B73] hover:bg-[#1F4380] text-white font-bold flex items-center gap-2 shadow-sm border border-[#10274C]"
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
