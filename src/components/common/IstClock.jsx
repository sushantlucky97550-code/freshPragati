import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const IstClock = ({ showDate = true, className = '', variant = 'desktop' }) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const istTimeStr = time.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const istDateStr = time.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  if (variant === 'mobile') {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-emerald-500" />
        <span>{istTimeStr}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-slate-400">OPERATIONAL CLOCK:</span>
      <span className="text-emerald-400 font-bold tracking-widest bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
        {istTimeStr}
      </span>
      {showDate && <span className="text-slate-300">{istDateStr}</span>}
    </div>
  );
};
