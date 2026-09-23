import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  X,
  ArrowRight,
  AlertOctagon,
  CheckCircle2
} from 'lucide-react';
import { useRailway } from '../../context/RailwayContext';
import { useAuth } from '../../context/AuthContext';

export const DomAuthorizationModal = ({ isOpen, onClose, selectedTaskIds, onAuthorizedSuccess }) => {
  const { currentZone, currentDivision, authorizeTodayTasks } = useRailway();
  const { user: authUser } = useAuth();

  const [officerId, setOfficerId] = useState(authUser?.officerId || 'OFF-WCR-DOM-01');
  const [password, setPassword] = useState('RailOpt@Ops2026');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authorizedLog, setAuthorizedLog] = useState(null);

  if (!isOpen) return null;

  const handleAuthorize = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsVerifying(true);

    try {
      const response = await authorizeTodayTasks({
        taskIds: selectedTaskIds,
        officerId: officerId.trim(),
        password: password
      });

      setAuthorizedLog({
        officerId,
        authorizedCount: selectedTaskIds.length,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        zone: currentZone,
        division: currentDivision
      });

      if (onAuthorizedSuccess) {
        onAuthorizedSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authorization failed. Ensure DOM credentials match authenticated zone.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDone = () => {
    setAuthorizedLog(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0A1220] border-2 border-red-500/50 rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 via-[#0A1220] to-[#0A1220] border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-900/60 border border-red-500/60 flex items-center justify-center text-red-300">
              <ShieldAlert className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">
                CRITICAL OPERATION
              </div>
              <h3 className="text-base font-black text-white font-mono">
                AUTHORIZED OPERATION REQUIRED
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {authorizedLog ? (
          <div className="p-6 text-center space-y-4 font-mono">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-lg font-black text-white">
              DOM Authorization Confirmed
            </h4>

            <p className="text-xs text-slate-400">
              {authorizedLog.authorizedCount} Requisitions have been officially scheduled into Today's Maintenance Work queue for {authorizedLog.zone} • {authorizedLog.division} Division.
            </p>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-left text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">AUTHORIZING OFFICER:</span>
                <span className="text-cyan-400 font-bold">{authorizedLog.officerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AUDIT TIMESTAMP:</span>
                <span>{authorizedLog.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AUDIT ACTION:</span>
                <span className="text-emerald-400">DOM_AUTHORIZED ✓</span>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-xs shadow-lg"
            >
              PROCEED TO TODAY'S MAINTENANCE WORK
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-xs font-mono text-slate-300">
              <p className="font-bold text-red-300 uppercase mb-1">
                DOM / Sr. DOM Authorization
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adding tasks to today's operational schedule commits railway line capacity. Divisional Operations Manager (DOM) credentials are required.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAuthorize} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1.5">
                  Employee ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    placeholder="e.g. OFF-WCR-DOM-01"
                    className="w-full py-2.5 pl-10 pr-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full py-2.5 pl-10 pr-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                DEFAULT DEMO DOM: <strong className="text-slate-300">OFF-WCR-DOM-01</strong> / <strong className="text-slate-300">RailOpt@Ops2026</strong>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 border border-red-500/40 disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>Verifying Authorization with Server...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>AUTHORIZE & ADD TO TODAY'S LIST</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
