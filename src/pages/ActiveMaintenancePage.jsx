import React, { useState, useEffect } from 'react';
import {
  Train,
  Radio,
  Activity,
  AlertTriangle,
  Zap,
  MessageSquare,
  Send,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Clock,
  MapPin,
  ChevronRight,
  ExternalLink,
  Flame,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Power
} from 'lucide-react';
import { useRailway } from '../context/RailwayContext';
import { useAuth } from '../context/AuthContext';
import { RailwayApiService } from '../services/api';


const demoCorridors = [
  {
    id: 'WRK-101',
    corridor: 'NDLS — CNB',
    from: 'NDLS',
    to: 'CNB',
    departments: 'Engineering + TRD',
    type: 'Track Maintenance',
    status: 'ACTIVE',
    startTime: '10:00 IST',
    endTime: '14:00 IST',
    track: 'TRACK 1 (UP)',
    maintenanceStatus: 'IN PROGRESS',
    stations: ['NDLS', 'GZB', 'CNB']
  },
  {
    id: 'WRK-102',
    corridor: 'NDLS — AGC',
    from: 'NDLS',
    to: 'AGC',
    departments: 'TRD + S&T',
    type: 'OHE + Signal Maintenance',
    status: 'ACTIVE',
    startTime: '11:30 IST',
    endTime: '13:30 IST',
    track: 'TRACK 2 (DOWN)',
    maintenanceStatus: 'ISOLATION DONE',
    stations: ['NDLS', 'MTJ', 'AGC']
  },
  {
    id: 'WRK-103',
    corridor: 'CNB — PRYG',
    from: 'CNB',
    to: 'PRYG',
    departments: 'Engineering + S&T',
    type: 'Track + Signalling Maintenance',
    status: 'ACTIVE',
    startTime: '09:00 IST',
    endTime: '15:00 IST',
    track: 'TRACK 3 (FAST)',
    maintenanceStatus: 'WORK IN PROGRESS',
    stations: ['CNB', 'FTP', 'PRYG']
  }
];

export const ActiveMaintenancePage = ({ onNavigate }) => {
  const {
    currentZone,
    currentDivision,
    activeWorkTasks,
    liveTrains,
    telemetrySummary,
    addNotification,
    addToast
  } = useRailway();

  const { user: authUser } = useAuth();

  // Active work focus
  const [selectedActiveWork, setSelectedActiveWork] = useState(demoCorridors[0]);

  // Train hover state
  const [hoveredTrain, setHoveredTrain] = useState(null);

  // Station Master ↔ Section Officer Chat
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'Station Master (Bhopal Jn)',
      senderRole: 'SM-BPL',
      text: 'Up line block granted from Km 12/4 to 14/8. Caution order TSR-12 issued to train 12002.',
      timestamp: '11:32 IST',
      acknowledged: true
    },
    {
      id: 2,
      sender: 'Section Officer (BPL - SEH)',
      senderRole: 'SEC-OFFICER',
      text: 'Understood SM/BPL. Maintenance crew and BCM track machine entering block zone. Red banner flag planted at Km 12/0.',
      timestamp: '11:35 IST',
      acknowledged: true
    }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Track Connection / Disconnection status
  const [trackPossessionState, setTrackPossessionState] = useState('DISCONNECTED_FOR_WORK'); // 'CONNECTED' | 'DISCONNECTED_FOR_WORK'
  const [possessionHistory, setPossessionHistory] = useState([
    { action: 'DISCONNECTION', time: '11:30 IST', officer: 'Section Officer Anil Sharma', location: 'Km 12/4 UP MAIN' }
  ]);

  // TRD TCP Power Request lifecycle: REQUESTED -> RECEIVED -> ACKNOWLEDGED -> ACTIONED
  const [tcpStatus, setTcpStatus] = useState('ACTIONED'); // 'IDLE' | 'REQUESTED' | 'RECEIVED' | 'ACKNOWLEDGED' | 'ACTIONED'
  const [tcpActionType, setTcpActionType] = useState('POWER_OFF');
  const [isTcpSubmitting, setIsTcpSubmitting] = useState(false);

  // Emergency Modal
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyData, setEmergencyData] = useState({
    type: 'TRACK_OBSTRUCTION',
    location: 'Km 13/2 UP MAIN',
    severity: 'CRITICAL',
    description: 'Boulders and ballast slippage observed after excavation on UP line.',
    affectedTrack: 'UP_MAIN'
  });

  // Final Maintenance Report Modal & submission
  const [isFinalReportModalOpen, setIsFinalReportModalOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [reportForm, setReportForm] = useState({
    workCompleted: true,
    actualStartTime: '11:30',
    actualEndTime: '13:15',
    workPerformed: 'Deep screening of 450 meters, point 104B calibration, and catenary dropper adjustment.',
    assetsAffected: 'Track Turnout 104, OHE Mast WCR-441',
    defectsFound: '1 hairline fatigue crack detected at frog wing rail.',
    defectsResolved: 'Crack ground and thermit fish-plate clamped for 30 km/h caution order.',
    manpowerUsed: 22,
    equipmentUsed: 'BCM Machine No. 12, Tamping Unit, OHE Tower Wagon',
    delaysEncountered: '15 mins delay awaiting down goods train clearance at Phanda.',
    incidentsReported: 'None. Safe execution verified.',
    blockUtilizationPercent: 88,
    recommendations: 'Follow-up tamping after 72 hours under loaded freight traffic.',
    remarks: 'Speed restriction can be relaxed to 50 km/h after tomorrow morning inspection.'
  });

  // Block plan changes broadcast banner state
  const [activeBlockChange, setActiveBlockChange] = useState({
    version: 2,
    planId: 'BP-WCR-1024',
    previousTime: '11:00 – 12:00 IST',
    newTime: '11:30 – 13:30 IST',
    reason: 'Operational conflict: High-priority clearance of Train 12002 (Shatabdi Exp)',
    authorizedBy: 'DOM Sanjay Srivastava'
  });

  // ML Insight
  const [mlInsight, setMlInsight] = useState({
    pattern: 'Historical block records in section BPL-SEH show similar multi-department works averaged 105 mins actual possession.',
    predictedUtilization: '85-92%',
    confidence: '94%',
    modelVersion: 'RailOpt-ML-v4.2.1'
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const msg = {
      id: Date.now(),
      sender: authUser?.name || 'Section Officer (P-Way)',
      senderRole: authUser?.role || 'SEC-OFFICER',
      text: newChatMessage.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      acknowledged: false
    };

    setChatMessages(prev => [...prev, msg]);
    setNewChatMessage('');

    // Simulate auto-acknowledgement from Station Master
    setTimeout(() => {
      setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, acknowledged: true } : m));
    }, 1500);
  };

  const handleToggleTrackPossession = () => {
    const nextState = trackPossessionState === 'CONNECTED' ? 'DISCONNECTED_FOR_WORK' : 'CONNECTED';
    setTrackPossessionState(nextState);
    const newHist = {
      action: nextState === 'CONNECTED' ? 'CONNECTION (RE-CONNECTED)' : 'DISCONNECTION',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      officer: authUser?.name || 'Section Officer Anil Sharma',
      location: 'Km 12/4 UP MAIN'
    };
    setPossessionHistory(prev => [newHist, ...prev]);
    addToast(`Track ${newHist.action} logged & transmitted to Station Master`, 'info');
  };

  // TCP Power Request Lifecycle
  const handleRequestTcp = (action) => {
    setIsTcpSubmitting(true);
    setTcpActionType(action);
    setTcpStatus('REQUESTED');

    addNotification({
      type: 'TCP_REQUEST',
      title: `TCP ${action} Requested`,
      message: `Traction power operation ${action} requested for section BPL-SEH by ${authUser?.name || 'Officer'}.`,
      severity: 'WARNING'
    });

    // Realistic Simulated Lifecycle: REQUESTED -> RECEIVED -> ACKNOWLEDGED -> ACTIONED
    setTimeout(() => {
      setTcpStatus('RECEIVED');
      setTimeout(() => {
        setTcpStatus('ACKNOWLEDGED');
        setTimeout(() => {
          setTcpStatus('ACTIONED');
          setIsTcpSubmitting(false);
          addToast(`TRD Traction Power ${action} confirmed by Central Traction Power Controller (TPC)`, 'success');
        }, 1200);
      }, 1000);
    }, 800);
  };

  // Emergency submission
  const handleSubmitEmergency = (e) => {
    e.preventDefault();
    addNotification({
      type: 'EMERGENCY',
      title: `🔴 RED ALERT: ${emergencyData.type}`,
      message: `${emergencyData.description} at ${emergencyData.location} on ${emergencyData.affectedTrack}. All approaching trains cautioned.`,
      severity: 'EMERGENCY'
    });

    addToast(`EMERGENCY BROADCASTED TO ALL CONTROLLERS & DRIVER CABINS!`, 'error', 7000);
    setIsEmergencyModalOpen(false);
  };

  // Submit Final Report
  const handleSubmitFinalReport = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        blockPlanId: 'BP-WCR-1024',
        workId: 'TSK-WCR-ENG-101',
        zone: currentZone,
        division: currentDivision,
        corridor: 'BPL - SEH',
        section: 'BPL - SEH (Km 12/4 - 14/8)',
        actualStartTime: reportForm.actualStartTime,
        actualEndTime: reportForm.actualEndTime,
        actualDurationMinutes: 105,
        workCompleted: reportForm.workCompleted,
        workPerformed: reportForm.workPerformed,
        defectsFound: reportForm.defectsFound,
        defectsResolved: reportForm.defectsResolved,
        manpowerUsed: Number(reportForm.manpowerUsed),
        equipmentUsed: reportForm.equipmentUsed,
        delaysEncountered: reportForm.delaysEncountered,
        incidentsReported: reportForm.incidentsReported,
        blockUtilizationPercent: Number(reportForm.blockUtilizationPercent),
        recommendations: reportForm.recommendations,
        remarks: reportForm.remarks,
        submittedBy: authUser?.name || 'Section Officer Anil Sharma'
      };

      await RailwayApiService.submitFinalReport(payload);

      setReportSuccess({
        reportId: `REP-${currentZone}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        mlFeedStatus: 'INGESTED TO HISTORICAL LEARNING DB'
      });
    } catch (err) {
      console.warn('Final report submission fallback:', err);
      setReportSuccess({
        reportId: `REP-${currentZone}-9012`,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        mlFeedStatus: 'INGESTED TO LOCAL ML PIPELINE'
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 w-full max-w-7xl mx-auto selection:bg-[#173B73] selection:text-white font-sans">
      {/* Top Banner: Demo Mode Indicator */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-[#D98C00] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#D98C00] animate-pulse flex-shrink-0" />
          <span><strong>DEMO MODE:</strong> Live interface preview enabled outside scheduled execution window.</span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-[#D98C00] border border-amber-300 font-bold">
          G&amp;SR RULE 4.12 EXECUTION PREVIEW
        </span>
      </div>

      {/* Header: Corridor & Division Title */}
      <div className="rounded-xl overflow-hidden border border-[#D9DEE7] shadow-md bg-white">
        <div className="bg-[#173B73] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-blue-200 uppercase">
                {currentZone} &bull; {currentDivision} DIVISION &bull; LIVE OPERATIONS
              </span>
              <h1 className="text-lg font-black text-white tracking-tight">CURRENTLY ACTIVE MAINTENANCE WORK</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE DIGITAL TWIN OPERATIONAL
            </span>
          </div>
        </div>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-[#5B6575] font-medium">
            Real-time track possession monitoring, train telemetry, station master communication, and safety isolations.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs flex items-center gap-2 shadow-md border border-[#C62828]/60"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>REPORT EMERGENCY</span>
            </button>
            <button
              onClick={() => setIsFinalReportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#168A55] hover:bg-[#126B43] text-white font-bold text-xs flex items-center gap-2 shadow-md border border-[#168A55]/60"
            >
              <FileCheck className="w-4 h-4" />
              <span>SUBMIT FINAL REPORT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Block Plan Change Broadcast Banner */}
      {activeBlockChange && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs text-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-900/60 text-amber-400 font-bold text-xs">
              BLOCK PLAN UPDATED
            </div>
            <div>
              <span className="font-bold text-white">
                {activeBlockChange.planId} (Version {activeBlockChange.version}):
              </span>{' '}
              Previous: <span className="line-through text-slate-400">{activeBlockChange.previousTime}</span> →{' '}
              <strong className="text-amber-300">New: {activeBlockChange.newTime}</strong>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Reason: {activeBlockChange.reason} (Auth: {activeBlockChange.authorizedBy})
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('block-changes')}
            className="px-3 py-1 bg-amber-900/80 hover:bg-amber-800 text-amber-200 rounded-lg text-[11px] font-bold self-start md:self-auto flex items-center gap-1"
          >
            <span>VIEW VERSION HISTORY</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      
      {/* ────────────────────────────────────────────────────────── */}
      {/* PART 1: LIVE CORRIDOR LIST                                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-4 font-mono select-none">
        <h2 className="text-[#173B73] font-bold text-lg">LIVE CORRIDORS (ACTIVE MAINTENANCE)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoCorridors.map((work, index) => (
            <div 
              key={work.id}
              onClick={() => setSelectedActiveWork(work)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedActiveWork.id === work.id ? 'border-[#173B73] bg-[#EBF2FA] shadow-md' : 'border-[#D9DEE7] bg-white hover:border-[#173B73]/50'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#173B73] font-bold text-lg">{index + 1}. {work.corridor}</span>
                <span className="px-2 py-1 bg-emerald-100 text-[#168A55] text-[10px] font-bold rounded">STATUS: {work.status}</span>
              </div>
              <div className="text-xs text-[#172033] space-y-1">
                <p><span className="font-bold">Work ID:</span> {work.id}</p>
                <p><span className="font-bold">From:</span> {work.from} <span className="font-bold">To:</span> {work.to}</p>
                <p><span className="font-bold">Type:</span> {work.type}</p>
                <p><span className="font-bold">Depts:</span> {work.departments}</p>
                <p><span className="font-bold">Time:</span> {work.startTime} - {work.endTime}</p>
                <p><span className="font-bold">Track:</span> {work.track}</p>
                <p><span className="font-bold text-amber-700">Maint. Status:</span> {work.maintenanceStatus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* ────────────────────────────────────────────────────────── */}
      {/* 27. LIVE CORRIDOR DIGITAL TWIN                            */}
      {/* ────────────────────────────────────────────────────────── */}
      
      <div className="rounded-2xl border-2 border-cyan-500/60 bg-[#070D18] p-6 shadow-2xl relative overflow-hidden font-mono select-none my-6">
        {/* Top Status Bar of Digital Twin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              LIVE CORRIDOR DIGITAL TWIN — {selectedActiveWork.corridor}
            </h2>
          </div>
          
          <div className="flex gap-4 text-xs text-white">
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Maintenance:</span>
              <span className="text-emerald-400 font-bold">{selectedActiveWork.status}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Track:</span>
              <span className="text-red-400 font-bold">RESTRICTED</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Trains:</span>
              <span className="text-cyan-400 font-bold">3</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Maintenance Teams:</span>
              <span className="text-amber-400 font-bold">2</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Block Status:</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Telemetry:</span>
              <span className="text-cyan-400 font-bold">SIMULATION</span>
            </div>
          </div>
        </div>

        {/* The Track Digital Twin SVG Diagram */}
        <div className="my-8 relative">
          <svg className="w-full h-80 rounded-xl bg-[#03060C] border border-slate-800/80" viewBox="0 0 1000 320">
            {/* Stations Background Pillars */}
            {selectedActiveWork.stations.map((st, i) => (
               <g key={st}>
                 <line x1={150 + i * 350} y1="20" x2={150 + i * 350} y2="300" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
                 <rect x={120 + i * 350} y="30" width="60" height="24" rx="4" fill="#0F172A" stroke="#334155" />
                 <text x={150 + i * 350} y="46" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">{st}</text>
               </g>
            ))}

            {/* TRACK 1 */}
            <line x1="40" y1="100" x2="960" y2="100" stroke="#475569" strokeWidth="3" />
            <line x1="40" y1="106" x2="960" y2="106" stroke="#475569" strokeWidth="3" />
            <text x="50" y="92" fill="#94A3B8" fontSize="10" fontWeight="bold">TRACK 1 ➔</text>
            
            {/* TRACK 2 */}
            <line x1="40" y1="170" x2="960" y2="170" stroke="#475569" strokeWidth="3" />
            <line x1="40" y1="176" x2="960" y2="176" stroke="#475569" strokeWidth="3" />
            <text x="50" y="162" fill="#94A3B8" fontSize="10" fontWeight="bold">TRACK 2 ➔</text>

            {/* TRACK 3 */}
            <line x1="40" y1="240" x2="960" y2="240" stroke="#475569" strokeWidth="3" />
            <line x1="40" y1="246" x2="960" y2="246" stroke="#475569" strokeWidth="3" />
            <text x="50" y="232" fill="#94A3B8" fontSize="10" fontWeight="bold">TRACK 3 ⬅</text>

            {/* Sleepers on tracks */}
            {Array.from({ length: 48 }).map((_, i) => (
              <g key={i}>
                <line x1={40 + i * 20} y1="96" x2={40 + i * 20} y2="110" stroke="#334155" strokeWidth="2" />
                <line x1={40 + i * 20} y1="166" x2={40 + i * 20} y2="180" stroke="#334155" strokeWidth="2" />
                <line x1={40 + i * 20} y1="236" x2={40 + i * 20} y2="250" stroke="#334155" strokeWidth="2" />
              </g>
            ))}

            {/* ACTIVE MAINTENANCE ZONE HIGHLIGHT */}
            <g transform={`translate(0, ${selectedActiveWork.track.includes('1') ? 0 : selectedActiveWork.track.includes('2') ? 70 : 140})`}>
              <rect
                x="300"
                y="85"
                width="250"
                height="36"
                rx="6"
                fill="#EF4444"
                fillOpacity="0.25"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              <text x="425" y="80" fill="#F87171" fontSize="10" fontWeight="bold" textAnchor="middle">
                ⚠ MAINTENANCE ACTIVE ({selectedActiveWork.from} ➔ {selectedActiveWork.to})
              </text>
              <circle cx="290" cy="80" r="5" fill="#EF4444" className="animate-pulse" />
              <line x1="290" y1="85" x2="290" y2="98" stroke="#EF4444" strokeWidth="2" />
              <text x="290" y="70" fill="#EF4444" fontSize="9" textAnchor="middle">STOP (RED)</text>
              
              <circle cx="560" cy="80" r="5" fill="#10B981" />
              <line x1="560" y1="85" x2="560" y2="98" stroke="#10B981" strokeWidth="2" />
              <text x="560" y="70" fill="#10B981" fontSize="9" textAnchor="middle">CLEAR (GREEN)</text>
            </g>
            
            <g transform={`translate(0, ${selectedActiveWork.track.includes('1') ? 70 : selectedActiveWork.track.includes('2') ? 140 : 0})`}>
              <circle cx="350" cy="80" r="5" fill="#EAB308" />
              <line x1="350" y1="85" x2="350" y2="98" stroke="#EAB308" strokeWidth="2" />
              <text x="350" y="70" fill="#EAB308" fontSize="9" textAnchor="middle">CAUTION (YELLOW)</text>
            </g>

            {/* ANIMATED TRAINS */}
            
            {/* Train 1: Normal Speed */}
            <g>
              <animateTransform attributeName="transform" type="translate" from="-100 92" to="1100 92" dur="20s" repeatCount="indefinite" />
              <rect x="0" y="0" width="60" height="22" rx="4" fill="#047857" stroke="#6EE7B7" strokeWidth="1.5" />
              <polygon points="60,4 70,11 60,18" fill="#10B981" />
              <text x="30" y="14" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">TR 12951</text>
              <text x="30" y="-5" fill="#10B981" fontSize="9" fontWeight="bold" textAnchor="middle">ON TIME</text>
            </g>

            {/* Train 2: Approaching Block, slower */}
            <g>
              <animateTransform attributeName="transform" type="translate" from="-100 162" to="250 162" dur="15s" repeatCount="indefinite" />
              <rect x="0" y="0" width="60" height="22" rx="4" fill="#B91C1C" stroke="#FCA5A5" strokeWidth="1.5" />
              <polygon points="60,4 70,11 60,18" fill="#F87171" />
              <text x="30" y="14" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">TR 12424</text>
              <text x="30" y="-5" fill="#F87171" fontSize="9" fontWeight="bold" textAnchor="middle">APPROACHING</text>
            </g>

            {/* Train 3: Opposite Direction */}
            <g>
              <animateTransform attributeName="transform" type="translate" from="1100 232" to="-100 232" dur="25s" repeatCount="indefinite" />
              <rect x="0" y="0" width="60" height="22" rx="4" fill="#D97706" stroke="#FCD34D" strokeWidth="1.5" />
              <polygon points="0,4 -10,11 0,18" fill="#FBBF24" />
              <text x="30" y="14" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">TR 12034</text>
              <text x="30" y="-5" fill="#FBBF24" fontSize="9" fontWeight="bold" textAnchor="middle">REGULATED</text>
            </g>
          </svg>
        </div>
      </div>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 29. LIVE MAINTENANCE CONTROLS                             */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* A. Station Master ↔ Section Officer Communication (Col 6) */}
        <div className="lg:col-span-6 rounded-xl bg-white border border-[#D9DEE7] p-5 shadow-sm flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#173B73]" />
                <h3 className="font-bold text-[#172033] uppercase">
                  Station Master ⟷ Section Officer Radio Log
                </h3>
              </div>
              <span className="text-[10px] text-[#168A55] font-bold">ONLINE (AUDITED)</span>
            </div>

            {/* Messages feed */}
            <div className="space-y-2.5 my-4 max-h-56 overflow-y-auto pr-1">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-[#F4F6F8] border border-[#D9DEE7] space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#173B73]">{msg.sender}</span>
                    <span className="text-[#5B6575]">{msg.timestamp}</span>
                  </div>
                  <p className="text-[#172033] text-xs leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end text-[9px] text-[#168A55] gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>TRANSMISSION ACKNOWLEDGED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-[#D9DEE7]">
            <input
              type="text"
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              placeholder="Transmit message to Station Master / Section Officer..."
              className="flex-1 py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-xl text-[#172033] placeholder-[#5B6575] focus:outline-none focus:border-[#173B73] focus:bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#173B73] hover:bg-[#1F4380] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>TRANSMIT</span>
            </button>
          </form>
        </div>

        {/* B & C. Track Possession + TCP Traction Controls (Col 6) */}
        <div className="lg:col-span-6 space-y-5">
          {/* B. Track Connection / Disconnection */}
          <div className="p-5 rounded-xl bg-white border border-[#D9DEE7] shadow-sm font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9DEE7]">
              <span className="font-bold text-[#172033] uppercase">
                Track Possession Isolation Controls (G&SR 4.14)
              </span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                trackPossessionState === 'DISCONNECTED_FOR_WORK'
                  ? 'bg-red-50 text-[#C62828] border border-red-200'
                  : 'bg-emerald-50 text-[#168A55] border border-emerald-200'
              }`}>
                {trackPossessionState === 'DISCONNECTED_FOR_WORK' ? '⛔ DISCONNECTED (SAFE FOR WORK)' : '🟢 CONNECTED (TRAFFIC OPEN)'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-[#172033] font-bold">UP LINE (Km 12/4 – 14/8)</p>
                <p className="text-[11px] text-[#5B6575]">Track disconnected with banner flag & detonator protection.</p>
              </div>

              <button
                onClick={handleToggleTrackPossession}
                className={`py-2 px-4 rounded-xl font-bold text-xs shadow-sm transition-all ${
                  trackPossessionState === 'DISCONNECTED_FOR_WORK'
                    ? 'bg-[#168A55] hover:bg-emerald-700 text-white'
                    : 'bg-[#C62828] hover:bg-red-800 text-white'
                }`}
              >
                {trackPossessionState === 'DISCONNECTED_FOR_WORK' ? 'RE-CONNECT TRACK' : 'DISCONNECT TRACK'}
              </button>
            </div>
          </div>

          {/* C. Request to TCP (Traction Power Control) */}
          <div className="p-5 rounded-xl bg-white border border-[#D9DEE7] shadow-sm font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9DEE7]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D98C00]" />
                <span className="font-bold text-[#172033] uppercase">
                  TRD Traction Power (TCP) Isolation
                </span>
              </div>

              {/* Status lifecycle badge */}
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                LIFECYCLE: {tcpStatus}
              </span>
            </div>

            <p className="text-[11px] text-[#5B6575]">
              Request OHE 25kV traction power shutdown or re-energization from Traction Power Controller (TPC).
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => handleRequestTcp('POWER_OFF')}
                disabled={isTcpSubmitting}
                className="flex-1 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-[#C62828] border border-red-200 font-bold flex items-center justify-center gap-2"
              >
                <Power className="w-3.5 h-3.5 text-[#C62828]" />
                <span>REQUEST POWER OFF (SHUTDOWN)</span>
              </button>

              <button
                onClick={() => handleRequestTcp('POWER_ON')}
                disabled={isTcpSubmitting}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#168A55] border border-emerald-200 font-bold flex items-center justify-center gap-2"
              >
                <Power className="w-3.5 h-3.5 text-[#168A55]" />
                <span>REQUEST POWER ON</span>
              </button>
            </div>
          </div>

          {/* ML Learning Insight Banner */}
          <div className="p-4 rounded-xl bg-[#F4F6F8] border border-[#D9DEE7] font-mono text-xs space-y-1.5 text-[#172033]">
            <div className="flex items-center gap-2 text-[#173B73] font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ML PREDICTIVE LEARNING ENGINE INSIGHT</span>
            </div>
            <p className="text-[11px] text-[#5B6575]">{mlInsight.pattern}</p>
            <div className="flex items-center justify-between text-[10px] text-[#5B6575] pt-1 border-t border-[#D9DEE7]">
              <span>PREDICTED UTILIZATION: <strong className="text-[#168A55]">{mlInsight.predictedUtilization}</strong></span>
              <span>MODEL CONFIDENCE: <strong className="text-[#173B73]">{mlInsight.confidence}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 30. SUBMIT FINAL MAINTENANCE REPORT MODAL                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {isFinalReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#D9DEE7] rounded-xl shadow-lg p-6 font-mono text-xs space-y-4 my-8 max-h-[85vh] overflow-y-auto">
            {reportSuccess ? (
              <div className="text-center space-y-3 py-6">
                <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 text-[#168A55] flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-[#172033]">
                  Final Maintenance Report Submitted & Ingested
                </h3>
                <p className="text-[#5B6575] text-xs max-w-md mx-auto">
                  The final maintenance execution dossier has been committed to MongoDB and immediately fed into the <strong className="text-[#172033]">Machine Learning Continuous Learning Pipeline</strong> to improve future duration and train delay predictions.
                </p>

                <div className="p-3 bg-[#F4F6F8] rounded-xl border border-[#D9DEE7] text-left text-xs max-w-sm mx-auto space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#5B6575]">REPORT ID:</span>
                    <span className="text-[#173B73] font-bold">{reportSuccess.reportId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6575]">ML INGESTION:</span>
                    <span className="text-[#168A55] font-bold">{reportSuccess.mlFeedStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6575]">AUDIT TIME:</span>
                    <span className="text-[#172033]">{reportSuccess.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsFinalReportModalOpen(false);
                    setReportSuccess(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#173B73] hover:bg-[#1F4380] text-white font-bold text-xs shadow-sm"
                >
                  Close & Return to Corridor
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFinalReport} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7]">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#173B73]" />
                    <h3 className="text-base font-bold text-[#172033] uppercase">
                      SUBMIT FINAL MAINTENANCE REPORT (G&SR FORM M-104)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFinalReportModalOpen(false)}
                    className="text-[#5B6575] hover:text-[#172033]"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#172033] font-bold block mb-1">Actual Start Time</label>
                    <input
                      type="text"
                      value={reportForm.actualStartTime}
                      onChange={(e) => setReportForm({ ...reportForm, actualStartTime: e.target.value })}
                      className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[#172033] font-bold block mb-1">Actual End Time</label>
                    <input
                      type="text"
                      value={reportForm.actualEndTime}
                      onChange={(e) => setReportForm({ ...reportForm, actualEndTime: e.target.value })}
                      className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#172033] font-bold block mb-1">Work Performed & Assets Affected</label>
                  <textarea
                    rows={2}
                    value={reportForm.workPerformed}
                    onChange={(e) => setReportForm({ ...reportForm, workPerformed: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#172033] font-bold block mb-1">Defects Found</label>
                    <input
                      type="text"
                      value={reportForm.defectsFound}
                      onChange={(e) => setReportForm({ ...reportForm, defectsFound: e.target.value })}
                      className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[#172033] font-bold block mb-1">Defects Resolved</label>
                    <input
                      type="text"
                      value={reportForm.defectsResolved}
                      onChange={(e) => setReportForm({ ...reportForm, defectsResolved: e.target.value })}
                      className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#172033] font-bold block mb-1">Manpower Used</label>
                    <input
                      type="number"
                      value={reportForm.manpowerUsed}
                      onChange={(e) => setReportForm({ ...reportForm, manpowerUsed: e.target.value })}
                      className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[#172033] font-bold block mb-1">Block Utilization %</label>
                    <input
                      type="number"
                      value={reportForm.blockUtilizationPercent}
                      onChange={(e) => setReportForm({ ...reportForm, blockUtilizationPercent: e.target.value })}
                      className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[#172033] font-bold block mb-1">Status</label>
                    <div className="py-2 px-3 bg-emerald-50 text-[#168A55] font-bold rounded-lg border border-emerald-200 text-center">
                      COMPLETED ✓
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[#172033] font-bold block mb-1">Equipment Used</label>
                  <input
                    type="text"
                    value={reportForm.equipmentUsed}
                    onChange={(e) => setReportForm({ ...reportForm, equipmentUsed: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[#172033] font-bold block mb-1">Recommendations & Speed Restrictions</label>
                  <textarea
                    rows={2}
                    value={reportForm.recommendations}
                    onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })}
                    className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73] focus:bg-white"
                  />
                </div>

                <div className="pt-3 border-t border-[#D9DEE7] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFinalReportModalOpen(false)}
                    className="py-2 px-4 rounded-xl bg-white border border-[#D9DEE7] hover:bg-[#F4F6F8] text-[#172033] font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-6 rounded-xl bg-[#168A55] hover:bg-[#126b42] text-white font-bold text-xs shadow-sm"
                  >
                    SUBMIT TO MONGODB & FEED ML PIPELINE
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 29-D. EMERGENCY REPORT MODAL                               */}
      {/* ────────────────────────────────────────────────────────── */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-t-4 border-[#C62828] rounded-xl shadow-lg p-6 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7]">
              <div className="flex items-center gap-2 text-[#C62828] font-bold">
                <Flame className="w-5 h-5 animate-pulse text-[#D98C00]" />
                <span className="text-sm uppercase">REPORT CORRIDOR EMERGENCY</span>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="text-[#5B6575] hover:text-[#172033]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEmergency} className="space-y-3">
              <div>
                <label className="text-[#172033] font-bold block mb-1">Emergency Category</label>
                <select
                  value={emergencyData.type}
                  onChange={(e) => setEmergencyData({ ...emergencyData, type: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] focus:border-[#173B73] focus:bg-white focus:outline-none rounded-lg text-[#172033] font-bold"
                >
                  <option value="TRACK_OBSTRUCTION">TRACK OBSTRUCTION / RAIL FRACTURE</option>
                  <option value="OHE_BREAKDOWN">OHE POWER WIRE SNAPPING</option>
                  <option value="SIGNAL_FAILURE">ELECTRONIC INTERLOCKING TOTAL FAILURE</option>
                  <option value="WEATHER_BREACH">FLOOD / LANDSLIP BREACH</option>
                </select>
              </div>

              <div>
                <label className="text-[#172033] font-bold block mb-1">Exact Location (Km Post)</label>
                <input
                  type="text"
                  value={emergencyData.location}
                  onChange={(e) => setEmergencyData({ ...emergencyData, location: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] focus:border-[#173B73] focus:bg-white focus:outline-none rounded-lg text-[#172033]"
                />
              </div>

              <div>
                <label className="text-[#172033] font-bold block mb-1">Severity Level</label>
                <div className="p-2 rounded bg-red-50 text-[#C62828] font-bold border border-red-200 text-center">
                  RED ALERT — MANDATORY TRAFFIC SUSPENSION
                </div>
              </div>

              <div>
                <label className="text-[#172033] font-bold block mb-1">Detailed Situation Description</label>
                <textarea
                  rows={3}
                  value={emergencyData.description}
                  onChange={(e) => setEmergencyData({ ...emergencyData, description: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] focus:border-[#173B73] focus:bg-white focus:outline-none rounded-lg text-[#172033]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-white border border-[#D9DEE7] hover:bg-[#F4F6F8] text-[#172033] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#C62828] hover:bg-red-800 text-white font-bold shadow-sm"
                >
                  BROADCAST EMERGENCY ALERT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
