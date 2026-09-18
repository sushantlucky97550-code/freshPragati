import React from 'react';
import { Train, Clock, CheckCircle2, AlertTriangle, ArrowRight, CornerDownRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const AffectedTrainsTable = ({ affectedTrains = [] }) => {
  if (!affectedTrains || affectedTrains.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
          Zero Train Conflicts
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          No scheduled trains require regulation or diversion for this block window.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs min-w-[650px]">
        <thead className="bg-slate-100 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-4 py-3">Train No. & Name</th>
            <th className="px-3 py-3">Type / Priority</th>
            <th className="px-3 py-3">Scheduled Pass</th>
            <th className="px-3 py-3">Proposed Operational Action</th>
            <th className="px-3 py-3">Estimated Delay</th>
            <th className="px-3 py-3">Terminal Impact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
          {affectedTrains.map((train) => (
            <tr
              key={train.trainNo}
              className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Train className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {train.trainNo}
                    </div>
                    <div className="text-[11px] text-slate-500 font-sans truncate max-w-[160px]">
                      {train.name}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-3 py-3">
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-sans">
                  {train.category}
                </span>
              </td>

              <td className="px-3 py-3 font-bold text-slate-700 dark:text-slate-300">
                {train.scheduledPass}
              </td>

              <td className="px-3 py-3">
                <div className="space-y-0.5">
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded ${
                      train.actionRequired === 'REGULATE'
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400'
                        : train.actionRequired === 'DIVERSION_TO_3RD_LINE'
                        ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {train.actionRequired.replace(/_/g, ' ')}
                  </span>
                  <div className="text-[10px] text-slate-500 font-sans">
                    at {train.regulationStation}
                  </div>
                </div>
              </td>

              <td className="px-3 py-3">
                {train.delayMinutes > 0 ? (
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    +{train.delayMinutes} mins
                  </span>
                ) : (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    0 mins (Right Time)
                  </span>
                )}
              </td>

              <td className="px-3 py-3">
                <div className="space-y-0.5">
                  <span
                    className={`font-bold text-[11px] ${
                      train.netArrivalDelayAtDelhi === 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500'
                    }`}
                  >
                    {train.netArrivalDelayAtDelhi === 0 ? '0m (Slack Absorbed)' : `+${train.netArrivalDelayAtDelhi}m Delay`}
                  </span>
                  <div className="text-[10px] text-slate-400 font-sans italic">
                    {train.remarks}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
