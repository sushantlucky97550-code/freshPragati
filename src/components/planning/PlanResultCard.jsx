import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useRailway } from '../../context/RailwayContext';
import { RailwayApiService } from '../../services/api';

export const PlanResultCard = ({ plan, onApprove }) => {
  const { currentUser, addToast } = useRailway();
  const [isApproving, setIsApproving] = useState(false);

  // Gemini AI Explanation state
  const [explanation, setExplanation] = useState(null);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);

  const fetchExplanation = useCallback(async () => {
    if (!plan) return;
    const planIdentifier = plan._backendId || plan.id || plan.planId;
    if (!planIdentifier) return;

    setIsExplanationLoading(true);
    try {
      const data = await RailwayApiService.getBlockPlanExplanation(planIdentifier);
      if (data) {
        setExplanation(data);
      }
    } catch (err) {
      console.warn('[PlanResultCard] Failed to fetch explanation:', err);
    } finally {
      setIsExplanationLoading(false);
    }
  }, [plan]);

  useEffect(() => {
    fetchExplanation();
  }, [fetchExplanation]);

  if (!plan) return null;

  const isApproved = plan.status === 'APPROVED_BY_CONTROLLER';

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      onApprove(plan.planId);
      setIsApproving(false);
    }, 600);
  };

  const handlePrintDispatch = () => {
    window.print();
  };

  const departmentsInvolved = [...new Set(plan.assignedTasks?.map(t => t.dept) || [])];
  
  return (
    <div className="bg-white border border-gray-300 shadow-xl max-w-5xl mx-auto font-sans text-gray-900">
      
      {/* PROFESSIONAL HEADER */}
      <div className="p-8 border-b-4 border-[#173B73]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src="/assets/indian_railways_logo.png" alt="Indian Railways Logo" className="w-16 h-16 object-contain" onError={(e) => e.target.style.display = 'none'} />
            <div>
              <h1 className="text-xl font-bold text-[#173B73] tracking-wider">PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration</h1>
              <h2 className="text-2xl font-black text-[#1F4380] uppercase tracking-tight">AI GENERATED BLOCK PLAN</h2>
              <div className="text-xs font-bold text-[#D98C00] tracking-widest mt-1">PROTOTYPE / DEMONSTRATION SYSTEM</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold text-[#173B73]">GENERATED TIME</div>
            <div className="font-mono">{new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Header Summary Table */}
        <table className="w-full text-sm border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">BLOCK PLAN ID</td>
              <td className="border border-gray-300 p-2 w-1/4 font-bold font-mono">{plan.planId}</td>
              <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">ZONE</td>
              <td className="border border-gray-300 p-2 w-1/4 uppercase">{plan.zone || 'WCR'}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">DIVISION</td>
              <td className="border border-gray-300 p-2 uppercase">{plan.division || 'BHOPAL'}</td>
              <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">DATE</td>
              <td className="border border-gray-300 p-2 font-bold">{plan.scheduledDate}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">VERSION</td>
              <td className="border border-gray-300 p-2">v1.0 (AI Draft)</td>
              <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">STATUS</td>
              <td className="border border-gray-300 p-2 font-bold uppercase text-amber-700">{plan.status}</td>
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
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Block Plan ID</td>
                <td className="border border-gray-300 p-2 w-1/4 font-mono">{plan.planId}</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Date</td>
                <td className="border border-gray-300 p-2 w-1/4">{plan.scheduledDate}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Zone</td>
                <td className="border border-gray-300 p-2">{plan.zone || 'WCR'}</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Division</td>
                <td className="border border-gray-300 p-2">{plan.division || 'BHOPAL'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Start time</td>
                <td className="border border-gray-300 p-2 font-mono font-bold text-red-700">{plan.windowStart}</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">End time</td>
                <td className="border border-gray-300 p-2 font-mono font-bold text-red-700">{plan.windowEnd}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Total duration</td>
                <td className="border border-gray-300 p-2 font-bold">{plan.durationHours} Hours</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Status / Version</td>
                <td className="border border-gray-300 p-2 uppercase">{plan.status} / v1.0</td>
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
                <th className="border border-gray-300 p-2 text-left">Work ID</th>
                <th className="border border-gray-300 p-2 text-left">Work description</th>
                <th className="border border-gray-300 p-2 text-left">Work type</th>
                <th className="border border-gray-300 p-2 text-center">Priority</th>
                <th className="border border-gray-300 p-2 text-center">Severity</th>
                <th className="border border-gray-300 p-2 text-left">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {plan.assignedTasks?.map((task, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="border border-gray-300 p-2 font-mono">{task.taskId}</td>
                  <td className="border border-gray-300 p-2">{task.title}</td>
                  <td className="border border-gray-300 p-2">{task.type || 'Standard Maintenance'}</td>
                  <td className="border border-gray-300 p-2 text-center font-bold">{task.criticality || task.priority || 'HIGH'}</td>
                  <td className="border border-gray-300 p-2 text-center">{task.severity || 'Moderate'}</td>
                  <td className="border border-gray-300 p-2">{task.deadline || plan.scheduledDate}</td>
                </tr>
              ))}
              {(!plan.assignedTasks || plan.assignedTasks.length === 0) && (
                <tr>
                  <td colSpan="6" className="border border-gray-300 p-4 text-center text-gray-500 italic">No specific work tasks assigned</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* 3. DEPARTMENTS */}
        <section>
          <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
            3. DEPARTMENTS
          </h3>
          <div className="border border-gray-300 p-3 text-sm font-bold text-[#173B73] bg-[#F4F6F8]">
            {departmentsInvolved.length > 0 
              ? departmentsInvolved.map(d => d === 'P_WAY' ? 'Engineering / P-Way' : d === 'TRD_OHE' ? 'TRD' : d === 'S_AND_T' ? 'S&T' : d).join(' • ') 
              : 'None specified'}
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
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Corridor</td>
                <td className="border border-gray-300 p-2 w-1/4">{plan.corridorName}</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Section</td>
                <td className="border border-gray-300 p-2 w-1/4">{plan.section || 'Main Section'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">From station</td>
                <td className="border border-gray-300 p-2">{plan.fromStation || 'STN-A'}</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">To station</td>
                <td className="border border-gray-300 p-2">{plan.toStation || 'STN-B'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Track</td>
                <td className="border border-gray-300 p-2">{plan.trackName || plan.trackLine || 'UP Main Line'}</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Line</td>
                <td className="border border-gray-300 p-2">{plan.lineType || 'Main Line'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Block section</td>
                <td className="border border-gray-300 p-2" colSpan="3">{plan.blockSection || 'Primary Block Section'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 5. TRAIN IMPACT */}
        <section>
          <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
            5. TRAIN IMPACT
          </h3>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-[#F4F6F8] text-[#173B73]">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Affected trains</th>
                <th className="border border-gray-300 p-2 text-left">Train conflict</th>
                <th className="border border-gray-300 p-2 text-left">Regulation requirement</th>
                <th className="border border-gray-300 p-2 text-left">Expected operational impact</th>
              </tr>
            </thead>
            <tbody>
              {plan.affectedTrains?.map((train, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="border border-gray-300 p-2 font-mono font-bold">{train.trainNo} {train.trainName}</td>
                  <td className="border border-gray-300 p-2 text-amber-700 font-bold">{train.conflictLevel || 'Moderate Intersection'}</td>
                  <td className="border border-gray-300 p-2">{train.action || 'Regulate at nearest station'}</td>
                  <td className="border border-gray-300 p-2 font-bold">{train.delayMinutes} mins delay</td>
                </tr>
              ))}
              {(!plan.affectedTrains || plan.affectedTrains.length === 0) && (
                <tr>
                  <td colSpan="4" className="border border-gray-300 p-4 text-center text-gray-500 italic">No significant train impact anticipated.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* 6. DEPARTMENT RESPONSIBILITIES */}
        <section>
          <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
            6. DEPARTMENT RESPONSIBILITIES
          </h3>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-[#F4F6F8] text-[#173B73]">
              <tr>
                <th className="border border-gray-300 p-2 text-left w-1/3">Department</th>
                <th className="border border-gray-300 p-2 text-left">Assigned Work</th>
              </tr>
            </thead>
            <tbody>
              {plan.assignedTasks?.map((task, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-2 font-bold">{task.dept === 'P_WAY' ? 'Engineering / P-Way' : task.dept === 'TRD_OHE' ? 'TRD' : task.dept === 'S_AND_T' ? 'S&T' : task.dept}</td>
                  <td className="border border-gray-300 p-2">{task.title} (ID: {task.taskId})</td>
                </tr>
              ))}
              {(!plan.assignedTasks || plan.assignedTasks.length === 0) && (
                <tr>
                  <td colSpan="2" className="border border-gray-300 p-4 text-center text-gray-500 italic">No specific responsibilities mapped.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* 7. RESOURCES */}
        <section>
          <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
            7. RESOURCES
          </h3>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-[#F4F6F8] text-[#173B73]">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Department</th>
                <th className="border border-gray-300 p-2 text-left">Manpower</th>
                <th className="border border-gray-300 p-2 text-left">Equipment</th>
                <th className="border border-gray-300 p-2 text-left">Tools</th>
                <th className="border border-gray-300 p-2 text-left">Maintenance team</th>
              </tr>
            </thead>
            <tbody>
              {plan.assignedTasks?.map((task, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="border border-gray-300 p-2 font-bold">{task.dept === 'P_WAY' ? 'Engineering / P-Way' : task.dept === 'TRD_OHE' ? 'TRD' : task.dept === 'S_AND_T' ? 'S&T' : task.dept}</td>
                  <td className="border border-gray-300 p-2">{task.crew || 10} Personnel</td>
                  <td className="border border-gray-300 p-2">{task.machine || 'Standard Equipment'}</td>
                  <td className="border border-gray-300 p-2">{task.tools || 'Standard Toolkit'}</td>
                  <td className="border border-gray-300 p-2">{task.teamName || 'Designated Section Team'}</td>
                </tr>
              ))}
              {(!plan.assignedTasks || plan.assignedTasks.length === 0) && (
                <tr>
                  <td colSpan="5" className="border border-gray-300 p-4 text-center text-gray-500 italic">Resource allocation pending.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* 8. SAFETY / OPERATIONAL CONSTRAINTS */}
        <section>
          <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
            8. SAFETY / OPERATIONAL CONSTRAINTS
          </h3>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Track occupancy</td>
                <td className="border border-gray-300 p-2 w-3/4">Absolute Block working suspended between affected stations during block window.</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Safety restrictions</td>
                <td className="border border-gray-300 p-2">25kV OHE Power supply to be isolated and discharged before TRD/Engineering teams commence work.</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Operational constraints</td>
                <td className="border border-gray-300 p-2">Temporary speed restriction of 30 kmph applicable immediately post-block.</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Dependencies</td>
                <td className="border border-gray-300 p-2">S&T Disconnection Notice mandatory prior to any point/track-circuit interference.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 9. AI REASONING */}
        <section>
          <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3 flex items-center gap-2">
            9. AI BLOCK PLAN REASONING
            {isExplanationLoading && <span className="text-[10px] font-normal italic animate-pulse">(Analyzing...)</span>}
          </h3>
          <div className="border border-gray-300 p-4 text-sm bg-blue-50/50">
            {explanation ? (
              <div className="space-y-3">
                <p>{explanation.safetyNotice}</p>
                {explanation.operationalPlan && (
                  <p className="font-bold text-[#173B73] mt-2">Operational Logic:</p>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{explanation.operationalPlan}</p>
              </div>
            ) : (
              <p>
                AI identified overlapping maintenance activities for the involved departments on the same corridor and scheduled them within a common maintenance window while considering train movement and operational constraints. This optimized shadow block ensures maximum utilization of track possession time while minimizing cumulative delays to passenger and freight operations.
              </p>
            )}
          </div>
        </section>

        {/* 10. WEATHER INFORMATION */}
        <section>
          <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
            10. WEATHER INFORMATION
          </h3>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Forecast for {plan.scheduledDate || 'selected date'}</td>
                <td className="border border-gray-300 p-2 w-3/4 font-bold text-amber-700" colSpan="3">
                  Heavy overcast with 85% probability of localized showers / rainfall during the scheduled block window.
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Conditions</td>
                <td className="border border-gray-300 p-2 w-1/4 text-red-600 font-bold">Rainfall Expected</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Temperature</td>
                <td className="border border-gray-300 p-2 w-1/4">24°C</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Wind</td>
                <td className="border border-gray-300 p-2">15-20 km/h (Gusty)</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Visibility</td>
                <td className="border border-gray-300 p-2 text-amber-600 font-bold">Reduced during rain (&lt;5km)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">AI Recommendation</td>
                <td className="border border-gray-300 p-2" colSpan="3">
                  High risk of rainfall during block execution. Ensure water drainage systems are clear and sensitive equipment is protected from moisture. Keep protective tarpaulins ready on site.
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 11. APPROVAL INFORMATION */}
        <section>
          <h3 className="text-sm font-bold text-white bg-[#173B73] px-3 py-1.5 uppercase mb-3">
            11. APPROVAL INFORMATION
          </h3>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Approval Status</td>
                <td className="border border-gray-300 p-2 w-1/4 font-bold uppercase">{plan.status}</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73] w-1/4">Version Information</td>
                <td className="border border-gray-300 p-2 w-1/4">v1.0 (Generated)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Approved By</td>
                <td className="border border-gray-300 p-2">{isApproved ? (currentUser?.name || 'Controller') : 'Pending Approval'}</td>
                <td className="border border-gray-300 p-2 bg-[#F4F6F8] font-bold text-[#173B73]">Approval Time</td>
                <td className="border border-gray-300 p-2">{isApproved ? new Date().toLocaleString() : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </section>

      </div>

      {/* Footer Controls & Approval Action */}
      <div className="p-6 bg-[#F4F6F8] border-t-4 border-[#173B73] flex flex-wrap items-center justify-between gap-4 font-sans print:hidden">
        <div className="flex items-center gap-2 text-sm text-[#173B73] font-bold">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>COMPLIANT WITH INDIAN RAILWAYS G&SR</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrintDispatch}
            className="px-6 py-2 border-2 border-[#173B73] bg-white text-[#173B73] hover:bg-[#EBF2FA] text-sm font-bold transition-colors"
          >
            PRINT BLOCK PLAN
          </button>

          {!isApproved ? (
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="px-8 py-2 bg-[#173B73] hover:bg-[#1F4380] text-white text-sm font-bold shadow-md transition-colors disabled:opacity-50"
            >
              {isApproving ? 'TRANSMITTING TO COIS...' : 'APPROVE & TRANSMIT'}
            </button>
          ) : (
            <div className="px-8 py-2 bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
              DISPATCHED TO CONTROL OFFICE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
