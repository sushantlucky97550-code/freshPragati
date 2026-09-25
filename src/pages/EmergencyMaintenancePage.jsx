import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  Train,
  MapPin,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';

export const EmergencyMaintenancePage = ({ onNavigate }) => {
  const { currentZone, currentDivision, addNotification, addToast } = useRailway();
  const { user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState('RAPID_WORKFLOW');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successEvent, setSuccessEvent] = useState(null);

  const [emergencyForm, setEmergencyForm] = useState({
    type: 'RAIL_FRACTURE',
    location: 'Km 14/2 - 14/6 (Bhopal - Sehore UP Line)',
    severity: 'CRITICAL',
    description: 'Sudden rail web fracture detected by ultrasonic flaw detector (USFD) car. Gap: 15mm under cold morning tension.',
    affectedTrack: 'UP_MAIN',
    affectedInfrastructure: 'Track Geometry / 60kg 90UTS Rail',
    trafficAction: 'IMMEDIATE_TRAFFIC_SUSPENSION'
  });

  // Recent emergencies log
  const [emergencyHistory, setEmergencyHistory] = useState([
    {
      id: 'EMG-WCR-901',
      type: 'RAIL_FRACTURE',
      location: 'Km 14/2 UP MAIN',
      severity: 'CRITICAL',
      status: 'UNDER_REPAIR',
      timestamp: 'Today, 09:40 IST',
      reportedBy: 'Er. Vikram Singh (SSE/P-Way)',
      aiAction: 'All approaching trains held at Phanda & Bhopal outer signals. Caution order 20 km/h generated.'
    },
    {
      id: 'EMG-WCR-889',
      type: 'OHE_CATENARY_PARTING',
      location: 'Km 22/1 DN MAIN',
      severity: 'HIGH',
      status: 'RESOLVED',
      timestamp: 'Yesterday, 16:15 IST',
      reportedBy: 'Er. Amitav Sen (SSE/TRD)',
      aiAction: 'Power isolated on sub-sector 12B. Traffic diverted via loop line for 45 minutes.'
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newId = `EMG-${currentZone}-${Math.floor(100 + Math.random() * 900)}`;
      const newRecord = {
        id: newId,
        type: emergencyForm.type,
        location: emergencyForm.location,
        severity: emergencyForm.severity,
        status: 'EMERGENCY_DECLARED',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        reportedBy: authUser?.name || 'Section Officer',
        aiAction: 'Immediate red signal clamp transmitted to Station Master. Emergency repair crew mobilized.'
      };

      setEmergencyHistory(prev => [newRecord, ...prev]);
      setSuccessEvent(newRecord);

      addNotification({
        type: 'EMERGENCY',
        title: `🔴 EMERGENCY DECLARED: ${emergencyForm.type}`,
        message: `${emergencyForm.description} at ${emergencyForm.location}. Emergency possession authorized.`,
        severity: 'EMERGENCY'
      });

      addToast(`🚨 Emergency ${newId} declared and broadcasted system-wide!`, 'error', 6000);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-20 w-full max-w-7xl mx-auto selection:bg-[#C62828] selection:text-white font-sans">
      {/* Header - White with danger accent */}
      <div className="rounded-xl overflow-hidden border border-[#C62828]/40 shadow-md bg-white">
        <div className="bg-[#C62828] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-amber-300 animate-pulse flex-shrink-0" />
            <div>
              <div className="text-[10px] font-mono font-bold text-red-200 uppercase tracking-widest">
                RAPID OPERATIONAL WORKFLOW &bull; {currentZone} / {currentDivision}
              </div>
              <h1 className="text-lg font-black text-white tracking-tight">EMERGENCY MAINTENANCE WORKS</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-800 border border-red-400 text-red-100 font-bold text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              RAPID RESPONSE DESK ACTIVE
            </span>
          </div>
        </div>
        <div className="px-5 py-3">
          <p className="text-xs text-[#5B6575] font-medium">
            Bypass standard planning queues for immediate track safety interventions, rail fractures, and OHE breakdowns.
          </p>
        </div>
      </div>

      {/* Primary Workflow Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rapid Declaration Form (Col 7) */}
        <div className="lg:col-span-7 rounded-xl bg-white border border-[#C62828] p-6 shadow-sm font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7]">
            <h2 className="text-sm font-bold text-[#172033] uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C62828]" />
              <span>Rapid Emergency Declaration Form</span>
            </h2>
            <span className="text-[10px] text-[#C62828] font-bold">INSTANT AI CONFLICT ANALYSIS</span>
          </div>

          {successEvent ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-300 text-[#C62828] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-[#172033]">
                Emergency Possession Broadcasted Successfully
              </h3>
              <p className="text-[#5B6575] text-xs">
                Emergency Block <strong className="text-[#172033]">{successEvent.id}</strong> is registered. Approach signals set to STOP. AI has calculated train diversions.
              </p>
              <div className="p-3 bg-white border border-red-200 rounded-lg text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5B6575]">EVENT ID:</span>
                  <span className="text-[#C62828] font-bold">{successEvent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B6575]">AI CONFLICT ACTION:</span>
                  <span className="text-[#D98C00] font-bold">{successEvent.aiAction}</span>
                </div>
              </div>
              <button
                onClick={() => setSuccessEvent(null)}
                className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold"
              >
                Declare Another Emergency Event
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[#172033] block mb-1 font-bold">EMERGENCY CLASSIFICATION *</label>
                <select
                  value={emergencyForm.type}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, type: e.target.value })}
                  className="w-full py-2.5 px-3 bg-[#F4F6F8] border border-[#D9DEE7] focus:border-[#C62828] focus:bg-white focus:outline-none rounded-xl text-[#172033] font-bold"
                >
                  <option value="RAIL_FRACTURE">RAIL FRACTURE / FISHPLATE FAILURE</option>
                  <option value="TRACK_OBSTRUCTION">TRACK OBSTRUCTION / DERAILMENT HAZARD</option>
                  <option value="OHE_CATENARY_PARTING">25kV OHE WIRE SNAPPING / PANTOGRAPH DAMAGE</option>
                  <option value="SIGNAL_FAILURE">ROUTE RELAY INTERLOCKING (RRI) TOTAL LOCKOUT</option>
                  <option value="FLASH_FLOOD">TRACK SUBMERGENCE / EMBANKMENT EROSION</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#172033] font-bold block mb-1">Location & Km Post *</label>
                  <input
                    type="text"
                    required
                    value={emergencyForm.location}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, location: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] focus:border-[#C62828] focus:bg-white focus:outline-none rounded-lg text-[#172033]"
                  />
                </div>
                <div>
                  <label className="text-[#172033] font-bold block mb-1">Affected Track *</label>
                  <select
                    value={emergencyForm.affectedTrack}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, affectedTrack: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] focus:border-[#C62828] focus:bg-white focus:outline-none rounded-lg text-[#172033] font-bold"
                  >
                    <option value="UP_MAIN">UP MAIN LINE</option>
                    <option value="DOWN_MAIN">DOWN MAIN LINE</option>
                    <option value="BOTH">BOTH LINES (DOUBLE BLOCK)</option>
                    <option value="YARD_LINE">YARD RUNNING LINE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Affected Infrastructure & Components</label>
                <input
                  type="text"
                  value={emergencyForm.affectedInfrastructure}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, affectedInfrastructure: e.target.value })}
                  className="w-full py-2 px-3 bg-[#170A0A] border border-red-900 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-[#172033] font-bold block mb-1">Situation Description & Field Findings</label>
                <textarea
                  rows={3}
                  value={emergencyForm.description}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, description: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] focus:border-[#C62828] focus:bg-white focus:outline-none rounded-lg text-[#172033]"
                />
              </div>

              {/* AI Conflict & Impact Pre-Analysis Box */}
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-1.5 text-[#172033]">
                <div className="flex items-center gap-2 font-bold text-[#C62828]">
                  <Cpu className="w-4 h-4 text-[#D98C00] animate-spin-slow" />
                  <span>AI REAL-TIME TRAFFIC IMPACT PROJECTION:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#5B6575]">
                  Train 12002 (Shatabdi Exp) is 6.2 km upstream on UP Main. Immediate stop order recommended at Signal S-14. Down line freight traffic can remain operational under 30 km/h caution order.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-red-950/80 border border-red-500"
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>AUTHORIZE & BROADCAST EMERGENCY POSSESSION</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Emergency Logs & History (Col 5) */}
        <div className="lg:col-span-5 rounded-xl bg-white border border-[#D9DEE7] p-6 shadow-sm font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7]">
            <h3 className="font-bold text-[#172033] uppercase">
              Emergency Events Audit Log
            </h3>
            <span className="text-[#5B6575] font-bold">{emergencyHistory.length} LOGGED</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {emergencyHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#F4F6F8] border border-[#D9DEE7] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#C62828] font-bold">{item.id}</span>
                  <span className="px-2 py-0.5 rounded bg-red-50 text-[#C62828] border border-red-200 text-[10px] font-bold">
                    {item.status}
                  </span>
                </div>

                <div className="text-[#172033] font-bold">{item.type}</div>
                <div className="text-[#5B6575] text-[11px]">Location: {item.location}</div>
                <div className="text-[#5B6575] text-[10px]">Reported: {item.timestamp} by {item.reportedBy}</div>

                <div className="pt-1.5 border-t border-[#D9DEE7] text-[#D98C00] text-[11px] font-bold">
                  <strong>AI Action:</strong> {item.aiAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
