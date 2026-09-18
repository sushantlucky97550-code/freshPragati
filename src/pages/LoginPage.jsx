import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Train,
  ShieldCheck,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertOctagon,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Zap,
  Radio
} from 'lucide-react';

/* ─── Animated Railway SVG Background ─── */
const RailwayVisual = () => (
  <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
    {/* Grid overlay */}
    <div className="absolute inset-0 bg-grid-command opacity-40" />

    {/* Railway track SVG */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice">
      {/* Main track lines */}
      <g className="login-track-path" stroke="rgba(71,85,105,0.3)" strokeWidth="2" fill="none">
        <line x1="200" y1="0" x2="200" y2="900" />
        <line x1="210" y1="0" x2="210" y2="900" />
        {/* Cross ties */}
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1="190" y1={i * 30 + 10} x2="220" y2={i * 30 + 10} strokeWidth="3" opacity="0.25" />
        ))}
      </g>

      {/* Secondary track */}
      <g stroke="rgba(71,85,105,0.15)" strokeWidth="1.5" fill="none">
        <line x1="600" y1="0" x2="600" y2="900" />
        <line x1="608" y1="0" x2="608" y2="900" />
        {Array.from({ length: 30 }, (_, i) => (
          <line key={`s-${i}`} x1="593" y1={i * 30 + 20} x2="615" y2={i * 30 + 20} strokeWidth="2" opacity="0.15" />
        ))}
      </g>

      {/* OHE Power Lines */}
      <g stroke="rgba(6,182,212,0.12)" strokeWidth="1" fill="none">
        <path d="M 150,0 Q 200,150 180,300 Q 160,450 200,600 Q 240,750 200,900" />
        <path d="M 550,0 Q 600,200 580,400 Q 560,600 600,900" />
      </g>

      {/* Station markers */}
      <g>
        <circle cx="205" cy="180" r="6" fill="rgba(16,185,129,0.5)" className="animate-pulse" />
        <text x="230" y="184" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">NDLS</text>

        <circle cx="205" cy="400" r="5" fill="rgba(245,158,11,0.4)" />
        <text x="230" y="404" fill="rgba(148,163,184,0.3)" fontSize="9" fontFamily="monospace">GZB</text>

        <circle cx="205" cy="620" r="5" fill="rgba(6,182,212,0.4)" />
        <text x="230" y="624" fill="rgba(148,163,184,0.3)" fontSize="9" fontFamily="monospace">ALJN</text>

        <circle cx="205" cy="800" r="6" fill="rgba(16,185,129,0.5)" className="animate-pulse" />
        <text x="230" y="804" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="monospace">CNB</text>
      </g>

      {/* Signal indicators */}
      <g>
        <rect x="175" y="170" width="8" height="20" rx="2" fill="rgba(15,23,42,0.8)" stroke="rgba(71,85,105,0.3)" />
        <circle cx="179" cy="176" r="2.5" fill="#10B981" className="animate-signal-blink" opacity="0.8" />
        <circle cx="179" cy="184" r="2.5" fill="rgba(71,85,105,0.2)" />

        <rect x="175" y="610" width="8" height="20" rx="2" fill="rgba(15,23,42,0.8)" stroke="rgba(71,85,105,0.3)" />
        <circle cx="179" cy="616" r="2.5" fill="rgba(71,85,105,0.2)" />
        <circle cx="179" cy="624" r="2.5" fill="#F59E0B" className="animate-signal-blink" opacity="0.7" />
      </g>
    </svg>

    {/* Animated train on primary track */}
    <div className="absolute left-[192px] animate-train-move" style={{ top: '-20px' }}>
      <div className="w-5 h-3 bg-gradient-to-r from-red-700 to-red-900 rounded-sm border border-red-600/40 shadow-lg shadow-red-900/30" />
      <div className="w-4 h-2 bg-slate-700 rounded-sm mx-auto -mt-0.5 border border-slate-600/30" />
    </div>

    {/* Bottom gradient fade */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060A12] to-transparent" />
    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#060A12] to-transparent" />
  </div>
);

/* ─── Signal Light Component ─── */
const SignalLight = ({ color = 'green', label }) => {
  const colors = {
    green: 'bg-emerald-500 shadow-emerald-500/50',
    red: 'bg-red-500 shadow-red-500/50',
    amber: 'bg-amber-500 shadow-amber-500/50',
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[color]} shadow-lg animate-signal-blink`} />
      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
};

export const LoginPage = ({ onLoginSuccess }) => {
  const { login, authError, setAuthError } = useAuth();

  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const demoAccounts = [
    { roleName: 'Operations Controller', dept: 'OPERATIONS', id: 'OFF-OPS-101', pass: 'RailOpt@Ops2026', badge: 'CC-OPS', color: 'border-emerald-500/30 text-emerald-400' },
    { roleName: 'Engineering Officer (P-Way)', dept: 'ENGINEERING', id: 'OFF-ENG-201', pass: 'RailOpt@Eng2026', badge: 'SSE-PWAY', color: 'border-amber-500/30 text-amber-400' },
    { roleName: 'Signal & Telecom Officer', dept: 'SIGNAL_AND_TELECOM', id: 'OFF-SIG-301', pass: 'RailOpt@Sig2026', badge: 'SSE-SIG', color: 'border-sky-500/30 text-sky-400' },
    { roleName: 'Traction Distribution (TRD)', dept: 'TRACTION_DISTRIBUTION', id: 'OFF-TRD-401', pass: 'RailOpt@Trd2026', badge: 'SSE-TRD', color: 'border-purple-500/30 text-purple-400' },
    { roleName: 'System Administrator', dept: 'ADMINISTRATION', id: 'OFF-ADMIN-01', pass: 'RailOpt@Admin2026', badge: 'ADMIN', color: 'border-red-500/30 text-red-400' },
  ];

  const handleSelectDemo = (account) => {
    setOfficerId(account.id);
    setPassword(account.pass);
    setValidationError('');
    if (setAuthError) setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (setAuthError) setAuthError(null);

    const trimmedId = officerId.trim();
    if (!trimmedId) { setValidationError('Officer ID is required.'); return; }
    if (!password) { setValidationError('Password is required.'); return; }

    setIsSubmitting(true);
    try {
      await login(trimmedId, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      // Error stored in authError by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = validationError || authError;

  return (
    <div className="min-h-screen w-full bg-[#060A12] text-white flex relative overflow-hidden">
      {/* ─── Left: Railway Visual Panel ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center">
        <RailwayVisual />

        {/* Central branding overlay */}
        <div className="relative z-10 text-center max-w-md px-8">
          <div className={`transition-all duration-1000 ${introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-700 via-red-900 to-slate-900 border border-red-500/40 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-950/50">
              <Train className="w-10 h-10 text-amber-300" />
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
              PRAGATI
            </h1>
            <p className="text-sm text-slate-400 font-medium mb-6 tracking-wide">
              INTELLIGENT RAILWAY MAINTENANCE<br />& BLOCK OPTIMIZATION
            </p>

            {/* Status indicators */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <SignalLight color="green" label="CRIS CONNECTED" />
              <SignalLight color="green" label="AI ENGINE" />
              <SignalLight color="amber" label="TELEMETRY" />
            </div>

            {/* Ministry badge */}
            <div className="mt-8 py-3 px-5 rounded-xl bg-slate-900/50 border border-slate-800/50 inline-block">
              <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                Ministry of Railways • Indian Railways
              </p>
              <p className="text-[9px] font-mono text-slate-600 mt-1">
                CRIS / COIS Integration • G&SR Appendix-A Compliant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: Login Form ─── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 relative">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid-fine opacity-30 pointer-events-none" />

        <div className={`w-full max-w-md relative z-10 ${introComplete ? 'login-fade-in' : 'opacity-0'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-700 to-red-900 border border-red-500/40 flex items-center justify-center shadow-lg">
              <Train className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">PRAGATI</h1>
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">OFFICER GATEWAY</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Secure Access
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Railway Operations Control
            </h2>
            <p className="text-sm text-slate-400">
              Authenticate as an authorized Railway Officer to access the command center.
            </p>
          </div>

          {/* Error */}
          {displayError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 animate-shake">
              <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-200 leading-relaxed">{displayError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Officer ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Officer ID
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="e.g. OFF-OPS-101"
                  autoComplete="username"
                  className="w-full py-3 pl-11 pr-4 bg-command-surface border border-command-border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full py-3 pl-11 pr-12 bg-command-surface border border-command-border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-700 via-red-800 to-red-900 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white text-sm font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-red-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-600/30 group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>SECURE LOGIN</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <button
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 transition-all"
            >
              <span className="font-mono font-semibold uppercase tracking-wider text-[10px]">Demo Officer Accounts</span>
              {showDemoCredentials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoCredentials && (
              <div className="mt-2 space-y-1.5 login-fade-in">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectDemo(acc)}
                    className={`w-full text-left p-2.5 rounded-lg border ${acc.color} bg-slate-900/30 hover:bg-slate-800/50 transition-all text-xs`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-200 text-[11px]">{acc.roleName}</span>
                        <span className="ml-2 font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">{acc.badge}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{acc.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-slate-800/50 text-center">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              Authorized Personnel Only
            </p>
            <p className="text-[9px] font-mono text-slate-700 mt-1">
              System Access Monitored • Session Validity: 24 Hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
