import React, { useState } from 'react';
import { useRailway } from '../context/RailwayContext';
import {
  Layers,
  Search,
  Filter,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Radio,
  Gauge,
  Calendar,
  Eye,
  ArrowRight
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';

export const RailwayAssetsPage = () => {
  const { assets, selectedCorridor } = useRailway();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-600 dark:text-red-400" />
              Railway Assets & Degradation Telemetry
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {assets.length} Monitored
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time health monitoring of Track Km, Bridges, Turnout Points, OHE Substations, and Electronic Interlocking
          </p>
        </div>
      </div>

      {/* 4 Asset Telemetry KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Asset Health"
          value="81.2"
          unit="/ 100"
          change="+0.8%"
          changeType="positive"
          subtitle="Health Index Mean"
          icon={Activity}
          accentColor="green"
        />
        <MetricCard
          title="Critical Degradation"
          value="1"
          unit="Section"
          change="TSR Imposed"
          changeType="negative"
          subtitle="Etawah Km 341"
          icon={AlertTriangle}
          accentColor="red"
        />
        <MetricCard
          title="USFD Testing Compliance"
          value="98.5"
          unit="%"
          change="On Schedule"
          changeType="positive"
          subtitle="Ultrasonic Testing"
          icon={CheckCircle2}
          accentColor="blue"
        />
        <MetricCard
          title="Turnout Interlocking"
          value="100"
          unit="%"
          change="Normal"
          changeType="neutral"
          subtitle="KAVACH Validated"
          icon={Radio}
          accentColor="purple"
        />
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search assets by name, ID, or km location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Permanent Way">Permanent Way (Track)</option>
            <option value="Structures & Civil">Bridges & Civil</option>
            <option value="Signalling & P-Way">Turnouts & Points</option>
            <option value="Electrical (TRD)">Electrical (TRD Substations)</option>
            <option value="Signalling & Telecom">Interlocking Systems</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  {asset.id}
                </span>
                <StatusBadge status={asset.status} size="xs" />
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {asset.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {asset.section} • {asset.category}
              </p>

              {/* Health Score Meter */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#111A2E] border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">Health Index</span>
                  <span
                    className={`font-bold ${
                      asset.healthScore > 80
                        ? 'text-emerald-500'
                        : asset.healthScore > 65
                        ? 'text-amber-500'
                        : 'text-red-500'
                    }`}
                  >
                    {asset.healthScore}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      asset.healthScore > 80
                        ? 'bg-emerald-500'
                        : asset.healthScore > 65
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${asset.healthScore}%` }}
                  />
                </div>
              </div>

              {/* Telemetry Preview */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <div>
                  <span className="text-slate-400 block text-[10px]">GMT Carried</span>
                  <strong>{asset.gmtCarried} GMT</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Active TSR</span>
                  <strong className={asset.activeTsr !== 'None' ? 'text-amber-500' : 'text-emerald-500'}>
                    {asset.activeTsr}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Last Inspection</span>
                  <span>{asset.lastMaintenance}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">USFD Tested</span>
                  <span>{asset.lastUsfdDate}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAsset(asset)}
              className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Telemetry & Sensors</span>
            </button>
          </div>
        ))}
      </div>

      {/* Asset Inspection Detail Modal */}
      <Modal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        title={selectedAsset ? `${selectedAsset.name} (${selectedAsset.id})` : ''}
        subtitle="Real-time sensor telemetry, USFD test readings, and maintenance history"
      >
        {selectedAsset && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-slate-800 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Health Index</span>
                <span className="font-bold text-base text-emerald-500">
                  {selectedAsset.healthScore}/100
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Rail Profile</span>
                <span className="font-bold">{selectedAsset.railProfile}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cumulative Wear</span>
                <span className="font-bold">{selectedAsset.gmtCarried} GMT</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Defect Count</span>
                <span className="font-bold text-amber-500">{selectedAsset.defectsCount}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-red-500" />
                Live Telemetry Sensors
              </h4>
              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                {Object.entries(selectedAsset.telemetry || {}).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <strong className="text-slate-800 dark:text-slate-100">{String(val)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 font-mono text-[11px]">
              <strong>Maintenance Recommendation: </strong>
              {selectedAsset.healthScore < 70
                ? 'High track geometry degradation. Priority 3.5h tamping window requested via Pragati.'
                : 'Asset within safe limits. Routine periodic inspection due on ' + selectedAsset.nextInspectionDue}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
