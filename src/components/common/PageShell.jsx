import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * PageShell — Wraps sub-pages with a "← Back to Command Center" header.
 * Provides consistent chrome for all module pages when navigated from the dashboard.
 */
export const PageShell = ({ title, icon: Icon, onBack, children }) => {
  return (
    <div className="space-y-4">
      {/* Back navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-command-surface border border-transparent hover:border-command-border transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Command Center</span>
        </button>

        {(Icon || title) && (
          <div className="flex items-center gap-2 text-sm">
            {Icon && <Icon className="w-4 h-4 text-slate-500" />}
            <span className="font-bold text-slate-300">{title}</span>
          </div>
        )}
      </div>

      {/* Page content */}
      {children}
    </div>
  );
};
