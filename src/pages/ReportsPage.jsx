import React from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  Wrench,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';
import {
  blockHoursTrend,
  punctualityDelaySavings,
  machineUtilization,
  corridorPerformanceSummary
} from '../data/analyticsData';
import { useRailway } from '../context/RailwayContext';

export const ReportsPage = () => {
  const { addToast } = useRailway();

  const handleDownloadCSV = () => {
    // Generate realistic CSV content
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Month,Planned Block Hours,Granted Block Hours,AI Optimized Hours,Delay Minutes Saved\n" +
      blockHoursTrend
        .map((row, i) => `${row.month},${row.planned},${row.granted},${row.aiOptimizedGranted},${punctualityDelaySavings[i]?.savedMins || 2000}`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "RailOpt_Block_Planning_Report_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported RailOpt_Block_Planning_Report_2026.csv", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - White + Navy */}
      <div className="rounded-xl overflow-hidden border border-[#D9DEE7] shadow-sm bg-white">
        <div className="bg-[#173B73] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-blue-200 font-bold uppercase tracking-widest mb-0.5">
                FY 2026-27
              </div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Operational Reports & Analytics
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#10274C] hover:bg-[#1A3A6D] text-white border border-blue-600/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#F4F6F8] text-[#173B73] text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-[#D98C00]" />
              <span>Export CSV Dataset</span>
            </button>
          </div>
        </div>
        <div className="px-5 py-3 border-b border-[#D9DEE7]">
          <p className="text-xs text-[#5B6575] font-medium">
            Audit logs for block fulfillment, passenger punctuality preservation, and machine utilization efficiency
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Chart 1: Block Hours Planned vs Granted */}
        <div className="rounded-2xl border border-[#D9DEE7] bg-white p-5 shadow-sm min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Maintenance Block Hours: Planned vs Granted
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                AI optimization reduces block refusal rate by 82%
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-500 font-bold">+28% Granted</span>
          </div>

          <div className="h-64 sm:h-72 w-full min-w-0 relative">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={blockHoursTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="planned" name="Requisitioned Hours" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="granted" name="Conventional Granted" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aiOptimizedGranted" name="Pragati Granted" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Punctuality Loss Avoided */}
        <div className="rounded-2xl border border-[#D9DEE7] bg-white p-5 shadow-sm min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Cumulative Train Delay Minutes Avoided
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Preserving passenger punctuality through shadow block valleys
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-500 font-bold">13,850 Mins Saved</span>
          </div>

          <div className="h-64 sm:h-72 w-full min-w-0 relative">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <LineChart data={punctualityDelaySavings} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="manualDelayMins" name="Manual Planning Delays" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="aiAssistedDelayMins" name="Pragati Delays" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="savedMins" name="Net Minutes Saved" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Track Machine Utilization Breakdown */}
      <div className="rounded-2xl border border-[#D9DEE7] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Track Machine Deployment Efficiency
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Continuous action tamping, ballast cleaning, and tower wagon active vs idle hours
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Target: &gt; 80% Utilization</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono text-xs">
          {machineUtilization.map((m) => {
            const total = m.activeHours + m.idleHours + m.maintenanceHours;
            const pct = Math.round((m.activeHours / total) * 100);

            return (
              <div
                key={m.machine}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#111A2E] space-y-2"
              >
                <div className="font-bold text-slate-900 dark:text-white text-[11px] truncate font-sans">
                  {m.machine}
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold text-emerald-500">{pct}%</span>
                  <span className="text-[10px] text-slate-400">Active</span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                  <div>Active: <strong>{m.activeHours}h</strong></div>
                  <div>Idle Siding: <strong>{m.idleHours}h</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corridor Benchmark Table */}
      <div className="rounded-2xl border border-[#D9DEE7] bg-white shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
          Corridor Performance Benchmark
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono min-w-[650px]">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Corridor</th>
                <th className="px-3 py-3">Coaching Punctuality</th>
                <th className="px-3 py-3">Block Fulfillment</th>
                <th className="px-3 py-3">Shadow Block Share</th>
                <th className="px-3 py-3">Conflict Resolution Rate</th>
                <th className="px-3 py-3">Network Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {corridorPerformanceSummary.map((c) => (
                <tr key={c.corridor} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white font-sans">
                    {c.corridor}
                  </td>
                  <td className="px-3 py-3.5 font-bold text-emerald-500">
                    {c.punctuality}
                  </td>
                  <td className="px-3 py-3.5 font-bold text-sky-500">
                    {c.blockFulfillment}
                  </td>
                  <td className="px-3 py-3.5 font-bold text-amber-500">
                    {c.shadowBlockRatio}
                  </td>
                  <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300">
                    {c.conflictResolutionRate}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
