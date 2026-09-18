import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import {
  ShieldAlert,
  X,
  RefreshCw,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const AdminAuditModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'officers'
  const [auditLogs, setAuditLogs] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsData, officersData] = await Promise.all([
        authService.getAuditLogs().catch((err) => {
          console.warn('Audit logs load failed:', err);
          return [];
        }),
        authService.getAllOfficers().catch((err) => {
          console.warn('Officers load failed:', err);
          return [];
        })
      ]);
      setAuditLogs(Array.isArray(logsData) ? logsData : []);
      setOfficers(Array.isArray(officersData) ? officersData : []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve administrative security telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0A101E] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0E172B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Security Administration & Audit Trail
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  ADMIN ONLY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official record of authentication events, possession authorizations, and officer directories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'audit'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Auth Audit Logs ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('officers')}
            className={`pb-2.5 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'officers'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Authorized Officers ({officers.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-mono">
                  No authentication audit logs recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left font-mono">
                    <thead className="bg-[#0D1527] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Status</th>
                        <th className="p-3">Officer ID</th>
                        <th className="p-3">Event Type</th>
                        <th className="p-3">Details</th>
                        <th className="p-3">Client IP</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-[11px]">
                      {auditLogs.map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-slate-800/30">
                          <td className="p-3">
                            {log.success ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                                <XCircle className="w-3.5 h-3.5" /> FAILED
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-white">{log.officerId}</td>
                          <td className="p-3 text-slate-300 font-semibold">{log.eventType}</td>
                          <td className="p-3 text-slate-400 truncate max-w-xs">{log.details || '—'}</td>
                          <td className="p-3 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                          <td className="p-3 text-slate-400">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Just now'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'officers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {officers.map((officer) => (
                <div
                  key={officer.officerId}
                  className="p-3.5 rounded-xl border border-slate-800 bg-[#0D1527] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-white">{officer.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {officer.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">{officer.title}</div>
                    <div className="space-y-1 text-[11px] font-mono text-slate-400">
                      <div>ID: <span className="text-slate-200">{officer.officerId}</span></div>
                      <div>Department: <span className="text-slate-200">{officer.department}</span></div>
                      <div>Division: <span className="text-slate-200">{officer.division}</span></div>
                      <div>Status: <span className="text-emerald-400 font-bold">{officer.accountStatus}</span></div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                    Last Login: {officer.lastLogin ? new Date(officer.lastLogin).toLocaleString('en-IN') : 'Never'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0E172B] flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Indian Railways Automated Security Layer</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
