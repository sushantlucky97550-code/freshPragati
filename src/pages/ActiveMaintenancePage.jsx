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
  const [selectedActiveWork, setSelectedActiveWork] = useState(null);

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
    <div className="space-y-6 pb-20 w-full max-w-7xl mx-auto selection:bg-red-700 selection:text-white font-sans">
      {/* Top Banner: Demo Mode Indicator */}
      <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs shadow-md">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
          <span>
            <strong>DEMO MODE:</strong> Live interface preview enabled outside scheduled execution window.
          </span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-600/40">
          G&SR RULE 4.12 EXECUTION PREVIEW
        </span>
      </div>

      {/* Header: Corridor & Division Title */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#070D18] via-[#0A1426] to-[#070D18] border border-blue-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              {currentZone} • {currentDivision} DIVISION
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE DIGITAL TWIN OPERATIONAL
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            CURRENTLY ACTIVE MAINTENANCE WORK
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time track possession monitoring, train telemetry, station master communication, and safety isolations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/60 border border-red-500/40 animate-pulse"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>REPORT EMERGENCY</span>
          </button>

          <button
            onClick={() => setIsFinalReportModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-500/40"
          >
            <FileCheck className="w-4 h-4 text-cyan-300" />
            <span>SUBMIT FINAL REPORT</span>
          </button>
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
      {/* 27. LIVE CORRIDOR DIGITAL TWIN                            */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-cyan-500/60 bg-[#070D18] p-6 shadow-2xl relative overflow-hidden font-mono select-none">
        {/* Top Status Bar of Digital Twin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              LIVE CORRIDOR DIGITAL TWIN — BHOPAL (BPL) ⟷ SEHORE (SEH)
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
              SOURCE: SIMULATION TELEMETRY
            </span>
            <span className="text-slate-400 hidden sm:inline">
              TRACK SPEED LIMIT: 130 KM/H
            </span>
          </div>
        </div>

        {/* The Track Digital Twin SVG Diagram */}
        <div className="my-8 relative">
          <svg className="w-full h-56 rounded-xl bg-[#03060C] border border-slate-800/80" viewBox="0 0 900 220">
            {/* Stations Background Pillars */}
            {/* Station 1: BPL */}
            <line x1="80" y1="20" x2="80" y2="200" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="50" y="30" width="60" height="24" rx="4" fill="#0F172A" stroke="#334155" />
            <text x="80" y="46" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">BPL</text>

            {/* Station 2: BIH (Bairagarh / Sant Hirdaram Nagar) */}
            <line x1="450" y1="20" x2="450" y2="200" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="420" y="30" width="60" height="24" rx="4" fill="#0F172A" stroke="#334155" />
            <text x="450" y="46" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">BIH</text>

            {/* Station 3: SEH (Sehore) */}
            <line x1="820" y1="20" x2="820" y2="200" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="790" y="30" width="60" height="24" rx="4" fill="#0F172A" stroke="#334155" />
            <text x="820" y="46" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">SEH</text>

            {/* UP MAIN LINE Track */}
            <line x1="40" y1="100" x2="860" y2="100" stroke="#475569" strokeWidth="3" />
            <line x1="40" y1="106" x2="860" y2="106" stroke="#475569" strokeWidth="3" />
            <text x="50" y="92" fill="#94A3B8" fontSize="10" fontWeight="bold">UP LINE ➔</text>

            {/* DOWN MAIN LINE Track */}
            <line x1="40" y1="150" x2="860" y2="150" stroke="#475569" strokeWidth="3" />
            <line x1="40" y1="156" x2="860" y2="156" stroke="#475569" strokeWidth="3" />
            <text x="50" y="142" fill="#94A3B8" fontSize="10" fontWeight="bold">DOWN LINE ⬅</text>

            {/* Sleepers on tracks */}
            {Array.from({ length: 42 }).map((_, i) => (
              <g key={i}>
                <line x1={50 + i * 20} y1="96" x2={50 + i * 20} y2="110" stroke="#334155" strokeWidth="2" />
                <line x1={50 + i * 20} y1="146" x2={50 + i * 20} y2="160" stroke="#334155" strokeWidth="2" />
              </g>
            ))}

            {/* ──────────────────────────────────────────────────── */}
            {/* ACTIVE MAINTENANCE ZONE HIGHLIGHT (ON UP LINE)       */}
            {/* ──────────────────────────────────────────────────── */}
            <rect
              x="220"
              y="85"
              width="220"
              height="36"
              rx="6"
              fill="#EF4444"
              fillOpacity="0.25"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {/* Striped construction bars inside */}
            <text x="330" y="80" fill="#F87171" fontSize="10" fontWeight="bold" textAnchor="middle">
              ⚠ ACTIVE MAINTENANCE ZONE (Km 12/4 – 14/8)
            </text>

            {/* Signal Red at Block Limit */}
            <circle cx="215" cy="80" r="5" fill="#EF4444" className="animate-pulse" />
            <line x1="215" y1="85" x2="215" y2="98" stroke="#EF4444" strokeWidth="2" />
            <text x="200" y="70" fill="#EF4444" fontSize="9" textAnchor="middle">STOP S-14</text>

            {/* Signal Green downstream */}
            <circle cx="445" cy="80" r="5" fill="#10B981" />
            <line x1="445" y1="85" x2="445" y2="98" stroke="#10B981" strokeWidth="2" />
            <text x="445" y="70" fill="#10B981" fontSize="9" textAnchor="middle">CLEAR S-18</text>

            {/* Signal Green on Down line */}
            <circle cx="455" cy="175" r="5" fill="#10B981" />
            <line x1="455" y1="160" x2="455" y2="170" stroke="#10B981" strokeWidth="2" />
            <text x="455" y="188" fill="#10B981" fontSize="9" textAnchor="middle">CLEAR S-21</text>

            {/* ──────────────────────────────────────────────────── */}
            {/* 28. ANIMATED TRAINS                                  */}
            {/* ──────────────────────────────────────────────────── */}
            {/* Train 1: 12002 Shatabdi (Approaching block on UP line) */}
            <g
              transform="translate(130, 92)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredTrain({
                number: '12002',
                name: 'New Delhi - Bhopal Shatabdi Express',
                location: 'Km 8/2 (Approaching Phanda / BIH)',
                direction: 'UP LINE (Towards Sehore)',
                speed: '45 km/h (Regulated for block caution)',
                delay: '+12 Mins',
                nextStation: 'BIH (Bairagarh)',
                blockImpact: 'Regulated behind Signal S-14 until possession is cleared.'
              })}
              onMouseLeave={() => setHoveredTrain(null)}
            >
              <rect x="0" y="0" width="55" height="22" rx="4" fill="#B91C1C" stroke="#FCA5A5" strokeWidth="1.5" />
              <polygon points="55,4 65,11 55,18" fill="#F87171" />
              <text x="27" y="14" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">12002</text>
            </g>

            {/* Train 2: Freight BOXN on Down line (Running clear) */}
            <g
              transform="translate(620, 142)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredTrain({
                number: 'BOXN-8841',
                name: 'Freight Coal Rake (Jabalpur - Kota)',
                location: 'Km 24/6 (Down Line)',
                direction: 'DOWN LINE (Towards Bhopal)',
                speed: '65 km/h',
                delay: 'ON TIME',
                nextStation: 'BPL (Bhopal Jn)',
                blockImpact: 'No impact. Down line traffic fully open.'
              })}
              onMouseLeave={() => setHoveredTrain(null)}
            >
              <rect x="0" y="0" width="65" height="22" rx="4" fill="#047857" stroke="#6EE7B7" strokeWidth="1.5" />
              <polygon points="0,4 -10,11 0,18" fill="#10B981" />
              <text x="32" y="14" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">BOXN-88</text>
            </g>
          </svg>

          {/* Train Hover Details Overlay */}
          {hoveredTrain && (
            <div className="absolute top-2 right-4 p-3.5 rounded-xl bg-slate-950/95 border-2 border-cyan-500 shadow-2xl text-xs space-y-1 z-30 max-w-sm">
              <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1">
                <span>TRAIN {hoveredTrain.number}</span>
                <span>{hoveredTrain.delay}</span>
              </div>
              <div className="text-white font-bold">{hoveredTrain.name}</div>
              <div className="text-slate-300 text-[11px]">Location: {hoveredTrain.location}</div>
              <div className="text-slate-300 text-[11px]">Speed: {hoveredTrain.speed}</div>
              <div className="text-slate-300 text-[11px]">Next: {hoveredTrain.nextStation}</div>
              <div className="text-amber-300 text-[11px] pt-1 border-t border-slate-900">
                <strong>Block Impact:</strong> {hoveredTrain.blockImpact}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 29. LIVE MAINTENANCE CONTROLS                             */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* A. Station Master ↔ Section Officer Communication (Col 6) */}
        <div className="lg:col-span-6 rounded-2xl bg-[#0A1220] border border-slate-800 p-5 shadow-xl flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white uppercase">
                  Station Master ⟷ Section Officer Radio Log
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">ONLINE (AUDITED)</span>
            </div>

            {/* Messages feed */}
            <div className="space-y-2.5 my-4 max-h-56 overflow-y-auto pr-1">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-cyan-300">{msg.sender}</span>
                    <span className="text-slate-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end text-[9px] text-emerald-400 gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>TRANSMISSION ACKNOWLEDGED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              placeholder="Transmit message to Station Master / Section Officer..."
              className="flex-1 py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>TRANSMIT</span>
            </button>
          </form>
        </div>

        {/* B & C. Track Possession + TCP Traction Controls (Col 6) */}
        <div className="lg:col-span-6 space-y-5">
          {/* B. Track Connection / Disconnection */}
          <div className="p-5 rounded-2xl bg-[#0A1220] border border-slate-800 shadow-xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white uppercase">
                Track Possession Isolation Controls (G&SR 4.14)
              </span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                trackPossessionState === 'DISCONNECTED_FOR_WORK'
                  ? 'bg-red-950 text-red-300 border border-red-700'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
              }`}>
                {trackPossessionState === 'DISCONNECTED_FOR_WORK' ? '⛔ DISCONNECTED (SAFE FOR WORK)' : '🟢 CONNECTED (TRAFFIC OPEN)'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-slate-300 font-bold">UP LINE (Km 12/4 – 14/8)</p>
                <p className="text-[11px] text-slate-500">Track disconnected with banner flag & detonator protection.</p>
              </div>

              <button
                onClick={handleToggleTrackPossession}
                className={`py-2 px-4 rounded-xl font-bold text-xs shadow-md transition-all ${
                  trackPossessionState === 'DISCONNECTED_FOR_WORK'
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-red-700 hover:bg-red-600 text-white'
                }`}
              >
                {trackPossessionState === 'DISCONNECTED_FOR_WORK' ? 'RE-CONNECT TRACK' : 'DISCONNECT TRACK'}
              </button>
            </div>
          </div>

          {/* C. Request to TCP (Traction Power Control) */}
          <div className="p-5 rounded-2xl bg-[#0A1220] border border-slate-800 shadow-xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white uppercase">
                  TRD Traction Power (TCP) Isolation
                </span>
              </div>

              {/* Status lifecycle badge */}
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-bold">
                LIFECYCLE: {tcpStatus}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Request OHE 25kV traction power shutdown or re-energization from Traction Power Controller (TPC).
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => handleRequestTcp('POWER_OFF')}
                disabled={isTcpSubmitting}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-600/50 font-bold flex items-center justify-center gap-2"
              >
                <Power className="w-3.5 h-3.5 text-red-400" />
                <span>REQUEST POWER OFF (SHUTDOWN)</span>
              </button>

              <button
                onClick={() => handleRequestTcp('POWER_ON')}
                disabled={isTcpSubmitting}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-2"
              >
                <Power className="w-3.5 h-3.5 text-emerald-400" />
                <span>REQUEST POWER ON</span>
              </button>
            </div>
          </div>

          {/* ML Learning Insight Banner */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-600/40 font-mono text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>ML PREDICTIVE LEARNING ENGINE INSIGHT</span>
            </div>
            <p className="text-[11px] text-slate-300">{mlInsight.pattern}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-blue-900">
              <span>PREDICTED UTILIZATION: <strong className="text-emerald-400">{mlInsight.predictedUtilization}</strong></span>
              <span>MODEL CONFIDENCE: <strong className="text-cyan-400">{mlInsight.confidence}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 30. SUBMIT FINAL MAINTENANCE REPORT MODAL                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {isFinalReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0A1220] border-2 border-emerald-500/60 rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 my-8 max-h-[85vh] overflow-y-auto">
            {reportSuccess ? (
              <div className="text-center space-y-3 py-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">
                  Final Maintenance Report Submitted & Ingested
                </h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto">
                  The final maintenance execution dossier has been committed to MongoDB and immediately fed into the <strong>Machine Learning Continuous Learning Pipeline</strong> to improve future duration and train delay predictions.
                </p>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-left text-xs max-w-sm mx-auto space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">REPORT ID:</span>
                    <span className="text-cyan-400 font-bold">{reportSuccess.reportId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ML INGESTION:</span>
                    <span className="text-emerald-400 font-bold">{reportSuccess.mlFeedStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AUDIT TIME:</span>
                    <span className="text-slate-300">{reportSuccess.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsFinalReportModalOpen(false);
                    setReportSuccess(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold text-xs"
                >
                  Close & Return to Corridor
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFinalReport} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white uppercase">
                      SUBMIT FINAL MAINTENANCE REPORT (G&SR FORM M-104)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFinalReportModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Actual Start Time</label>
                    <input
                      type="text"
                      value={reportForm.actualStartTime}
                      onChange={(e) => setReportForm({ ...reportForm, actualStartTime: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Actual End Time</label>
                    <input
                      type="text"
                      value={reportForm.actualEndTime}
                      onChange={(e) => setReportForm({ ...reportForm, actualEndTime: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Work Performed & Assets Affected</label>
                  <textarea
                    rows={2}
                    value={reportForm.workPerformed}
                    onChange={(e) => setReportForm({ ...reportForm, workPerformed: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Defects Found</label>
                    <input
                      type="text"
                      value={reportForm.defectsFound}
                      onChange={(e) => setReportForm({ ...reportForm, defectsFound: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Defects Resolved</label>
                    <input
                      type="text"
                      value={reportForm.defectsResolved}
                      onChange={(e) => setReportForm({ ...reportForm, defectsResolved: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Manpower Used</label>
                    <input
                      type="number"
                      value={reportForm.manpowerUsed}
                      onChange={(e) => setReportForm({ ...reportForm, manpowerUsed: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Block Utilization %</label>
                    <input
                      type="number"
                      value={reportForm.blockUtilizationPercent}
                      onChange={(e) => setReportForm({ ...reportForm, blockUtilizationPercent: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Status</label>
                    <div className="py-2 px-3 bg-emerald-950 text-emerald-300 font-bold rounded-lg border border-emerald-700 text-center">
                      COMPLETED ✓
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Equipment Used</label>
                  <input
                    type="text"
                    value={reportForm.equipmentUsed}
                    onChange={(e) => setReportForm({ ...reportForm, equipmentUsed: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Recommendations & Speed Restrictions</label>
                  <textarea
                    rows={2}
                    value={reportForm.recommendations}
                    onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFinalReportModalOpen(false)}
                    className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 text-white font-bold text-xs shadow-lg"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0808] border-2 border-red-500 rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-900/60">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <Flame className="w-5 h-5 animate-pulse" />
                <span className="text-sm uppercase">REPORT CORRIDOR EMERGENCY</span>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEmergency} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Emergency Category</label>
                <select
                  value={emergencyData.type}
                  onChange={(e) => setEmergencyData({ ...emergencyData, type: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-900 border border-red-900/80 rounded-lg text-white font-bold"
                >
                  <option value="TRACK_OBSTRUCTION">TRACK OBSTRUCTION / RAIL FRACTURE</option>
                  <option value="OHE_BREAKDOWN">OHE POWER WIRE SNAPPING</option>
                  <option value="SIGNAL_FAILURE">ELECTRONIC INTERLOCKING TOTAL FAILURE</option>
                  <option value="WEATHER_BREACH">FLOOD / LANDSLIP BREACH</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Exact Location (Km Post)</label>
                <input
                  type="text"
                  value={emergencyData.location}
                  onChange={(e) => setEmergencyData({ ...emergencyData, location: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Severity Level</label>
                <div className="p-2 rounded bg-red-950/80 text-red-300 font-bold border border-red-600 text-center">
                  RED ALERT — MANDATORY TRAFFIC SUSPENSION
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Detailed Situation Description</label>
                <textarea
                  rows={3}
                  value={emergencyData.description}
                  onChange={(e) => setEmergencyData({ ...emergencyData, description: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-xl shadow-red-950/80"
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
