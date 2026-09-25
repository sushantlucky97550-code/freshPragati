import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Train, ShieldCheck, Lock, ArrowRight, Eye, EyeOff,
  AlertOctagon, KeyRound, ChevronDown, ChevronUp, Radio, CheckCircle2
} from 'lucide-react';

/* Railway Track SVG Background - white/navy themed */
const RailwayVisual = () => (
  <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
    <div className="absolute inset-0 bg-grid-pattern-light opacity-60" />
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice">
      {/* Main track lines */}
      <g stroke="rgba(23,59,115,0.2)" strokeWidth="2" fill="none">
        <line x1="200" y1="0" x2="200" y2="900" />
        <line x1="210" y1="0" x2="210" y2="900" />
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1="190" y1={i * 30 + 10} x2="220" y2={i * 30 + 10} strokeWidth="3" opacity="0.3" />
        ))}
      </g>
      {/* Secondary track */}
      <g stroke="rgba(23,59,115,0.1)" strokeWidth="1.5" fill="none">
        <line x1="600" y1="0" x2="600" y2="900" />
        <line x1="608" y1="0" x2="608" y2="900" />
        {Array.from({ length: 30 }, (_, i) => (
          <line key={`s-${i}`} x1="593" y1={i * 30 + 20} x2="615" y2={i * 30 + 20} strokeWidth="2" opacity="0.2" />
        ))}
      </g>
      {/* OHE Power Lines */}
      <g stroke="rgba(23,59,115,0.08)" strokeWidth="1" fill="none">
        <path d="M 150,0 Q 200,150 180,300 Q 160,450 200,600 Q 240,750 200,900" />
        <path d="M 550,0 Q 600,200 580,400 Q 560,600 600,900" />
      </g>
      {/* Station markers */}
      <g>
        <circle cx="205" cy="180" r="6" fill="rgba(22,138,85,0.6)" className="animate-pulse" />
        <text x="230" y="184" fill="rgba(23,59,115,0.5)" fontSize="10" fontFamily="monospace">NDLS</text>
        <circle cx="205" cy="400" r="5" fill="rgba(217,140,0,0.5)" />
        <text x="230" y="404" fill="rgba(23,59,115,0.4)" fontSize="9" fontFamily="monospace">GZB</text>
        <circle cx="205" cy="620" r="5" fill="rgba(23,59,115,0.4)" />
        <text x="230" y="624" fill="rgba(23,59,115,0.4)" fontSize="9" fontFamily="monospace">ALJN</text>
        <circle cx="205" cy="800" r="6" fill="rgba(22,138,85,0.6)" className="animate-pulse" />
        <text x="230" y="804" fill="rgba(23,59,115,0.5)" fontSize="10" fontFamily="monospace">CNB</text>
      </g>
      {/* Signal boxes */}
      <g>
        <rect x="175" y="170" width="8" height="20" rx="2" fill="rgba(255,255,255,0.9)" stroke="rgba(23,59,115,0.3)" />
        <circle cx="179" cy="176" r="2.5" fill="#168A55" className="animate-signal-blink" opacity="0.9" />
        <circle cx="179" cy="184" r="2.5" fill="rgba(217,222,231,0.8)" />
        <rect x="175" y="610" width="8" height="20" rx="2" fill="rgba(255,255,255,0.9)" stroke="rgba(23,59,115,0.3)" />
        <circle cx="179" cy="616" r="2.5" fill="rgba(217,222,231,0.8)" />
        <circle cx="179" cy="624" r="2.5" fill="#D98C00" className="animate-signal-blink" opacity="0.8" />
      </g>
    </svg>
    {/* Animated train */}
    <div className="absolute left-[192px] animate-train-move" style={{ top: '-20px' }}>
      <div className="w-5 h-3 bg-[#173B73] rounded-sm border border-[#173B73]/60 shadow-md" />
      <div className="w-4 h-2 bg-[#1F4380] rounded-sm mx-auto -mt-0.5 border border-[#173B73]/30" />
    </div>
    {/* Bottom fade */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F4F6F8] to-transparent" />
    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent" />
  </div>
);

export const LoginPage = ({ onLoginSuccess, selectedZone, selectedDivision, onBackToGateway, onBackToDivision }) => {
  const { login, authError, setAuthError } = useAuth();
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 600);
    if (setAuthError) setAuthError(null);
    return () => clearTimeout(timer);
  }, [setAuthError, selectedZone, selectedDivision]);

  const zoneCode = selectedZone?.code || (typeof selectedZone === 'string' ? selectedZone : 'WCR');
  const zoneName = selectedZone?.name || (zoneCode === 'WCR' ? 'WEST CENTRAL RAILWAY' : `${zoneCode} RAILWAY`);
  const divName = selectedDivision?.name || (typeof selectedDivision === 'string' ? selectedDivision : 'Bhopal');
  const divCode = selectedDivision?.code || (divName === 'Bhopal' ? 'BPL' : (divName === 'Jabalpur' ? 'JBP' : (divName === 'Kota' ? 'KTT' : 'DIV')));

  const demoAccounts = [
    { roleName: 'DOM (Divisional Operations Manager)', dept: 'OPERATIONS', id: 'OFF-WCR-DOM-01', pass: 'RailOpt@Ops2026', badge: 'DOM / SR. DOM', color: 'border-emerald-300 text-[#168A55]' },
    { roleName: 'Divisional Railway Manager (DRM)', dept: 'ADMINISTRATION', id: 'OFF-WCR-DRM-01', pass: 'RailOpt@Ops2026', badge: 'DRM-BHOPAL', color: 'border-[#173B73]/40 text-[#173B73]' },
    { roleName: 'Engineering Officer (P-Way)', dept: 'ENGINEERING', id: 'OFF-WCR-ENG-01', pass: 'RailOpt@Eng2026', badge: 'SSE-PWAY', color: 'border-amber-300 text-[#D98C00]' },
    { roleName: 'Signal & Telecom (S&T)', dept: 'SIGNAL_AND_TELECOM', id: 'OFF-WCR-SIG-01', pass: 'RailOpt@Sig2026', badge: 'SSE-SIG', color: 'border-sky-300 text-sky-700' },
    { roleName: 'Traction Distribution (TRD)', dept: 'TRACTION_DISTRIBUTION', id: 'OFF-WCR-TRD-01', pass: 'RailOpt@Trd2026', badge: 'SSE-TRD', color: 'border-purple-300 text-purple-700' },
    { roleName: 'Section Officer (BPL - SEH)', dept: 'OPERATIONS', id: 'OFF-WCR-SEC-01', pass: 'RailOpt@Sec2026', badge: 'SEC-OFFICER', color: 'border-[#173B73]/30 text-[#173B73]' },
    { roleName: 'Station Master (Bhopal Jn)', dept: 'OPERATIONS', id: 'OFF-WCR-SM-01', pass: 'RailOpt@Sm2026', badge: 'SM-BHOPAL', color: 'border-amber-300 text-[#D98C00]' },
    { roleName: 'PCOM / Admin Officer', dept: 'ADMINISTRATION', id: 'OFF-ADMIN-01', pass: 'RailOpt@Admin2026', badge: 'PCOM-HQ', color: 'border-indigo-300 text-indigo-700' },
    { roleName: 'NR DOM (Cross-Zone Security Test)', dept: 'OPERATIONS', id: 'OFF-NR-DOM-01', pass: 'RailOpt@Nr2026', badge: 'NR-DELHI', color: 'border-[#C62828]/40 text-[#C62828]' }
  ];

  const handleSelectDemo = async (account) => {
    setOfficerId(account.id);
    setPassword(account.pass);
    setValidationError('');
    if (setAuthError) setAuthError(null);
    setIsSubmitting(true);
    try {
      await login(account.id, account.pass, zoneCode);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
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
      await login(trimmedId, password, zoneCode);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      // Error stored in authError by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = validationError || (authError && !authError.toLowerCase().includes('expired') ? authError : null);

  return (
    <div className="min-h-screen w-full bg-[#F4F6F8] flex relative overflow-hidden font-sans">

      {/* LEFT: Railway Visual Panel */}
      <div className="hidden lg:flex lg:w-[50%] relative items-center justify-center bg-white border-r border-[#D9DEE7]">
        <RailwayVisual />
        <div className="relative z-10 text-center max-w-md px-8">
          <div className={`transition-all duration-1000 ${introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <img
              src="/assets/indian_railways_logo.png"
              alt="Indian Railways"
              className="w-20 h-20 object-contain mx-auto mb-5 drop-shadow-sm"
            />
            <h1 className="text-3xl font-black tracking-tight text-[#173B73] mb-1">PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration</h1>
            <p className="text-sm font-bold text-[#1F4380] mb-1 tracking-wide">RailOpt AI</p>
            <p className="text-xs text-[#5B6575] font-medium mb-6 leading-relaxed">
              Intelligent Railway Maintenance<br />&amp; Block Optimization System
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#168A55] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#168A55] animate-pulse" />CRIS CONNECTED
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#168A55] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#168A55] animate-pulse" />AI ENGINE
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#D98C00] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D98C00] animate-pulse" />LIVE TELEMETRY
              </span>
            </div>
            <div className="mt-8 py-3 px-5 rounded-xl bg-[#F4F6F8] border border-[#D9DEE7] inline-block">
              <p className="text-[10px] font-mono text-[#5B6575] tracking-widest uppercase">
                Ministry of Railways &bull; Indian Railways
              </p>
              <p className="text-[9px] font-mono text-[#5B6575]/70 mt-1">
                CRIS / COIS Integration &bull; G&amp;SR Appendix-A Compliant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 bg-grid-pattern-light opacity-40 pointer-events-none" />

        <div className={`w-full max-w-md relative z-10 ${introComplete ? 'login-fade-in' : 'opacity-0'}`}>

          {/* Back Navigation */}
          {onBackToDivision ? (
            <button onClick={onBackToDivision} className="mb-6 flex items-center gap-1.5 text-xs font-mono text-[#173B73] hover:text-[#1F4380] transition-colors group">
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              <span>CHANGE DIVISION ({divName.toUpperCase()})</span>
            </button>
          ) : onBackToGateway ? (
            <button onClick={onBackToGateway} className="mb-6 flex items-center gap-1.5 text-xs font-mono text-[#173B73] hover:text-[#1F4380] transition-colors group">
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              <span>CHANGE ZONAL COMMAND CENTER</span>
            </button>
          ) : null}

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src="/assets/indian_railways_logo.png" alt="Indian Railways" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-black tracking-tight text-[#173B73]">PRAGATI : Predictive Rail Asset-availability & Grid-Aligned Traffic Integration</h1>
              <span className="text-[9px] font-mono text-[#168A55] uppercase tracking-widest font-bold">OFFICER GATEWAY</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl border border-[#D9DEE7] shadow-lg overflow-hidden">
            {/* Card navy header */}
            <div className="bg-[#173B73] px-6 py-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-200" />
                  <span className="text-xs font-mono font-bold text-blue-200 uppercase tracking-widest">Secure Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {selectedZone && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#10274C] text-blue-300 border border-blue-600/40">
                      ZONE: {zoneCode}
                    </span>
                  )}
                  {selectedDivision && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                      DIV: {divCode}
                    </span>
                  )}
                </div>
              </div>
              <h2 className="text-lg font-black text-white mt-2 tracking-tight uppercase">{zoneName}</h2>
              <p className="text-[11px] font-mono text-blue-300 mt-0.5">{divName.toUpperCase()} DIVISION &bull; AUTHORIZED PERSONNEL ONLY</p>
            </div>

            <div className="p-6">
              {/* Error */}
              {displayError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-[#C62828]/30 flex items-start gap-2.5 animate-shake">
                  <AlertOctagon className="w-4 h-4 text-[#C62828] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#C62828] leading-relaxed">{displayError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-2 uppercase tracking-wider font-mono">
                    Employee ID
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B6575]" />
                    <input
                      type="text"
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      placeholder="e.g. OFF-WCR-DOM-01"
                      autoComplete="username"
                      className="w-full py-3 pl-11 pr-4 bg-[#F4F6F8] border border-[#D9DEE7] rounded-xl text-sm text-[#172033] placeholder-[#5B6575]/60 focus:outline-none focus:border-[#173B73] focus:ring-2 focus:ring-[#173B73]/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-2 uppercase tracking-wider font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B6575]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      autoComplete="current-password"
                      className="w-full py-3 pl-11 pr-12 bg-[#F4F6F8] border border-[#D9DEE7] rounded-xl text-sm text-[#172033] placeholder-[#5B6575]/60 focus:outline-none focus:border-[#173B73] focus:ring-2 focus:ring-[#173B73]/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B6575] hover:text-[#173B73] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#173B73] hover:bg-[#1F4380] text-white text-sm font-bold flex items-center justify-center gap-2.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-blue-300 border-t-white animate-spin" />
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
              <div className="mt-5">
                <button
                  onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-xs text-[#5B6575] hover:text-[#173B73] hover:bg-[#F4F6F8] transition-all border border-[#D9DEE7]"
                >
                  <span className="font-mono font-bold uppercase tracking-wider text-[10px]">Demo Officer Accounts</span>
                  {showDemoCredentials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showDemoCredentials && (
                  <div className="mt-2 space-y-1.5 login-fade-in">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => handleSelectDemo(acc)}
                        className={`w-full text-left p-2.5 rounded-lg border ${acc.color} bg-white hover:bg-[#F4F6F8] transition-all text-xs`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-[#172033] text-[11px]">{acc.roleName}</span>
                            <span className="ml-2 font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#F4F6F8] text-[#5B6575] border border-[#D9DEE7]">{acc.badge}</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#5B6575]">{acc.id}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-[#D9DEE7] text-center">
                <p className="text-[10px] font-mono text-[#5B6575] uppercase tracking-widest">
                  Authorized Personnel Only
                </p>
                <p className="text-[9px] font-mono text-[#5B6575]/60 mt-1">
                  System Access Monitored &bull; Session Validity: 24 Hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
