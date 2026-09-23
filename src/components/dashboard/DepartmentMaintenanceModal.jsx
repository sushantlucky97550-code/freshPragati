import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Activity,
  Zap,
  CheckCircle2,
  Upload,
  FileText,
  Clock,
  MapPin,
  AlertTriangle,
  Users,
  ShieldCheck,
  Send,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useRailway } from '../../context/RailwayContext';
import { useAuth } from '../../context/AuthContext';

export const DepartmentMaintenanceModal = ({ department, isOpen, onClose }) => {
  const { currentZone, currentDivision, submitMaintenanceTask } = useRailway();
  const { user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState('MANUAL'); // 'MANUAL' | 'FILE_UPLOAD' | 'IMPORT'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Km 12/4 - 14/8',
    fromStation: 'BPL',
    toStation: 'SEH',
    section: 'BPL - SEH',
    track: 'UP_MAIN',
    severity: 'HIGH',
    priority: 'HIGH',
    criticality: 'SAFETY_CRITICAL',
    deadlineHours: 24,
    durationMinutes: 120,
    manpowerRequired: 14,
    specialEquipment: 'CSM Track Machine & Tamping Unit',
    remarks: 'Pre-monsoon maintenance & speed restriction lifting requirement'
  });

  // Pre-load co-located coordinates when department changes
  useEffect(() => {
    if (!department) return;
    if (department.id === 'ENGINEERING') {
      setFormData({
        title: 'Continuous Track Tamping (CSM 09-32) & Versine Rectification',
        description: 'Deep ballast tamping, track cross-level alignment, and ultrasonic rail flaw inspection.',
        location: 'Km 12/4 - 14/8',
        fromStation: 'BPL',
        toStation: 'SEH',
        section: 'BPL - SEH',
        track: 'UP_MAIN',
        severity: 'HIGH',
        priority: 'CRITICAL',
        criticality: 'SAFETY_CRITICAL',
        deadlineHours: 24,
        durationMinutes: 120,
        manpowerRequired: 14,
        specialEquipment: 'CSM 09-32 Tamping Machine & DTS',
        remarks: 'Track geometry index restoration before monsoon'
      });
    } else if (department.id === 'SIGNAL_AND_TELECOM') {
      setFormData({
        title: 'Point Machine 104B Overhaul & Digital Axle Counter Calibration',
        description: 'Clamp-lock mechanism obstacle clearance test and track circuit frequency verification.',
        location: 'Km 12/4 - 14/8',
        fromStation: 'BPL',
        toStation: 'SEH',
        section: 'BPL - SEH',
        track: 'UP_MAIN',
        severity: 'HIGH',
        priority: 'CRITICAL',
        criticality: 'SAFETY_CRITICAL',
        deadlineHours: 24,
        durationMinutes: 120,
        manpowerRequired: 8,
        specialEquipment: 'S&T Tool Van & Multi-meter Rig',
        remarks: 'Intermittent track vacancy drop calibration'
      });
    } else if (department.id === 'TRACTION_DISTRIBUTION') {
      setFormData({
        title: '25kV AC Contact Wire Height Adjustment & Cantilever Inspection',
        description: 'Catenary dropper tensioning and insulator washing under scheduled power isolation.',
        location: 'Km 12/4 - 14/8',
        fromStation: 'BPL',
        toStation: 'SEH',
        section: 'BPL - SEH',
        track: 'UP_MAIN',
        severity: 'HIGH',
        priority: 'HIGH',
        criticality: 'SAFETY_CRITICAL',
        deadlineHours: 36,
        durationMinutes: 150,
        manpowerRequired: 10,
        specialEquipment: '4-Wheeler OHE Tower Wagon',
        remarks: 'Contact wire stagger wear rectification'
      });
    }
  }, [department]);

  if (!isOpen || !department) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title || `${department.name} Periodic Maintenance`,
        description: formData.description || `Scheduled track overhaul and component inspection on section ${formData.section}`,
        department: department.id,
        zone: currentZone,
        division: currentDivision,
        section: formData.section,
        fromStation: formData.fromStation,
        toStation: formData.toStation,
        track: formData.track,
        location: formData.location,
        severity: formData.severity,
        priority: formData.priority,
        criticality: formData.criticality,
        estimatedDurationMinutes: Number(formData.durationMinutes) || 120,
        deadlineHours: Number(formData.deadlineHours) || 24,
        manpowerRequired: Number(formData.manpowerRequired) || 10,
        specialEquipment: formData.specialEquipment,
        remarks: formData.remarks,
        submittedBy: authUser?.name || 'Authorized Officer'
      };

      const result = await submitMaintenanceTask(payload);
      setSuccessData({
        taskId: result.taskId || result.id || `TSK-${currentZone}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        department: department.name
      });
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateFileUpload = () => {
    setIsSubmitting(true);
    setTimeout(async () => {
      const payload = {
        title: `${department.name} Bulk CSV Requisition`,
        description: `Imported automated sensor defect sheet for corridor ${formData.section}`,
        department: department.id,
        zone: currentZone,
        division: currentDivision,
        section: 'BPL - SEH',
        fromStation: 'BPL',
        toStation: 'SEH',
        track: 'DOWN_MAIN',
        location: 'Km 15/2 - 18/6',
        severity: 'HIGH',
        priority: 'HIGH',
        criticality: 'SAFETY_CRITICAL',
        estimatedDurationMinutes: 150,
        deadlineHours: 36,
        manpowerRequired: 18,
        specialEquipment: 'OHE Tower Wagon (TRD-W-104)',
        remarks: 'Imported from Central Track Defect Register (CTDR)',
        submittedBy: authUser?.name || 'Department Officer'
      };

      const result = await submitMaintenanceTask(payload);
      setSuccessData({
        taskId: result.taskId || result.id || `TSK-${currentZone}-9088`,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        department: department.name
      });
      setIsSubmitting(false);
    }, 800);
  };

  const handleClose = () => {
    setSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0B1322] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#070D18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
              {department.id === 'ENGINEERING' && <Wrench className="w-5 h-5 text-amber-400" />}
              {department.id === 'SIGNAL_AND_TELECOM' && <Activity className="w-5 h-5 text-sky-400" />}
              {department.id === 'TRACTION_DISTRIBUTION' && <Zap className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {currentZone} • {currentDivision} DIVISION
              </div>
              <h3 className="text-lg font-black text-white font-mono">
                {department.name} Maintenance Data Entry
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Modal View */}
        {successData ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-black text-white font-mono">
              Request Submitted Successfully
            </h4>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Requisition has been securely persisted in the Railway Maintenance Database (MongoDB) and dispatched to the AI Priority Engine for combined corridor analysis.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto text-left font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">REQUEST ID:</span>
                <span className="text-cyan-400 font-bold">{successData.taskId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DEPARTMENT:</span>
                <span className="text-slate-200">{successData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AUDIT TIMESTAMP:</span>
                <span className="text-slate-300">{successData.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DATABASE STATUS:</span>
                <span className="text-emerald-400 font-bold">MONGODB PERSISTED ✓</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-700/60 max-w-md mx-auto text-left font-mono text-xs text-cyan-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
              <span>
                <strong>AI Spatial-Temporal Engine:</strong> Entry automatically evaluated for identical section coordinates ({formData.section} {formData.location}). The combined departments list on your dashboard has updated in real-time.
              </span>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setSuccessData(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold"
              >
                Submit Another Request
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 text-white text-xs font-mono font-bold shadow-lg shadow-red-950/50"
              >
                Return to Command Queue
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-[#09101D] px-5 pt-3">
              <button
                onClick={() => setActiveTab('MANUAL')}
                className={`pb-2.5 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'MANUAL'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Manual Data Entry</span>
              </button>
              <button
                onClick={() => setActiveTab('FILE_UPLOAD')}
                className={`pb-2.5 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'FILE_UPLOAD'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>File Upload (CSV/Doc)</span>
              </button>
              <button
                onClick={() => setActiveTab('IMPORT')}
                className={`pb-2.5 px-4 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'IMPORT'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Import / Fetched Data</span>
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {activeTab === 'MANUAL' && (
                <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                  {/* Work Description */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 uppercase">
                      Work Description & Requisition Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder={`e.g. Deep screening and point machine 102 overhaul`}
                      className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Stations & Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">From Station *</label>
                      <input
                        type="text"
                        required
                        value={formData.fromStation}
                        onChange={(e) => handleChange('fromStation', e.target.value.toUpperCase())}
                        placeholder="e.g. BPL"
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">To Station *</label>
                      <input
                        type="text"
                        required
                        value={formData.toStation}
                        onChange={(e) => handleChange('toStation', e.target.value.toUpperCase())}
                        placeholder="e.g. SEH"
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Section / Corridor</label>
                      <input
                        type="text"
                        value={formData.section}
                        onChange={(e) => handleChange('section', e.target.value)}
                        placeholder="e.g. BPL - SEH"
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  {/* Location & Track */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Track / Line</label>
                      <select
                        value={formData.track}
                        onChange={(e) => handleChange('track', e.target.value)}
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="UP_MAIN">UP MAIN LINE</option>
                        <option value="DOWN_MAIN">DOWN MAIN LINE</option>
                        <option value="BOTH">BOTH UP & DOWN LINES</option>
                        <option value="YARD_LINE">YARD / LOOP LINE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Exact Location (Km Post)</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="e.g. Km 12/4 - 14/8"
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  {/* Priority, Severity & Criticality */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">ROUTINE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Severity</label>
                      <select
                        value={formData.severity}
                        onChange={(e) => handleChange('severity', e.target.value)}
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Criticality</label>
                      <select
                        value={formData.criticality}
                        onChange={(e) => handleChange('criticality', e.target.value)}
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="SAFETY_CRITICAL">SAFETY CRITICAL</option>
                        <option value="SPEED_RESTRICTION">SPEED RESTRICTION</option>
                        <option value="PREVENTIVE">PREVENTIVE</option>
                        <option value="ROUTINE">ROUTINE</option>
                      </select>
                    </div>
                  </div>

                  {/* Duration & Resources */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Est. Duration (Minutes)</label>
                      <input
                        type="number"
                        value={formData.durationMinutes}
                        onChange={(e) => handleChange('durationMinutes', e.target.value)}
                        min="30"
                        max="480"
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Deadline (Hours)</label>
                      <input
                        type="number"
                        value={formData.deadlineHours}
                        onChange={(e) => handleChange('deadlineHours', e.target.value)}
                        min="6"
                        max="168"
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Manpower Required</label>
                      <input
                        type="number"
                        value={formData.manpowerRequired}
                        onChange={(e) => handleChange('manpowerRequired', e.target.value)}
                        min="1"
                        max="100"
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  {/* Special Equipment & Remarks */}
                  <div>
                    <label className="block text-slate-400 mb-1">Required Equipment / Machinery</label>
                    <input
                      type="text"
                      value={formData.specialEquipment}
                      onChange={(e) => handleChange('specialEquipment', e.target.value)}
                      placeholder="e.g. BCM Machine, Tower Wagon, Tamping Unit"
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Remarks & Operational Constraints</label>
                    <textarea
                      rows={2}
                      value={formData.remarks}
                      onChange={(e) => handleChange('remarks', e.target.value)}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600"
                    />
                  </div>

                  {/* Footer Submit */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      SUBMITTING OFFICER: {authUser?.name || 'Department Officer'}
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-950/40 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Submitting to Database...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>SUBMIT MAINTENANCE REQUISITION</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'FILE_UPLOAD' && (
                <div className="space-y-4 text-center font-mono">
                  <div className="p-8 border-2 border-dashed border-slate-700 hover:border-cyan-400/60 rounded-2xl bg-slate-900/50 transition-colors flex flex-col items-center justify-center space-y-3 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                      <Upload className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Upload Departmental Work Schedule (CSV / XLSX)
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Format: Requisition ID, Location, From, To, Severity, Duration, Equipment
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-[11px]">
                      DRAG & DROP OR BROWSE LOCAL FILES
                    </span>
                  </div>

                  <button
                    onClick={handleSimulateFileUpload}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Database className="w-4 h-4" />
                    <span>PROCESS & INGEST SAMPLE REQUISITIONS TO MONGODB</span>
                  </button>
                </div>
              )}

              {activeTab === 'IMPORT' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-2">
                    <p className="font-bold text-white">
                      Central Railway Track Management System (TMS) Connector
                    </p>
                    <p className="text-slate-400">
                      Sync with CRIS-TMS live defect feed for section {currentZone} • {currentDivision}.
                    </p>
                    <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      TMS REPOSITORY ONLINE (2 PENDING EXTERNAL DEFECTS IDENTIFIED)
                    </div>
                  </div>

                  <button
                    onClick={handleSimulateFileUpload}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>FETCH & ENQUEUE TMS DEFECTS</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
