import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CloudRain,
  Clock,
  ShieldAlert,
  Radio,
  Check,
  Filter,
  Train,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { useRailway } from '../context/RailwayContext';

export const NotificationsPage = ({ onNavigate }) => {
  const { currentZone, currentDivision, notifications, markAllNotificationsRead } = useRailway();
  const [filterType, setFilterType] = useState('ALL');
  const [acknowledgedIds, setAcknowledgedIds] = useState([]);

  const getSeverityBadge = (type) => {
    switch (type) {
      case 'EMERGENCY':
        return {
          icon: Flame,
          color: 'text-red-400 bg-red-950/80 border-red-700/80',
          label: '🔴 EMERGENCY',
          badgeColor: 'red'
        };
      case 'BLOCK_UPDATE':
        return {
          icon: Clock,
          color: 'text-amber-400 bg-amber-950/80 border-amber-700/80',
          label: '🟠 BLOCK UPDATE',
          badgeColor: 'amber'
        };
      case 'APPROVAL':
        return {
          icon: ShieldAlert,
          color: 'text-yellow-400 bg-yellow-950/80 border-yellow-700/80',
          label: '🟡 APPROVAL REQUIRED',
          badgeColor: 'yellow'
        };
      case 'WEATHER':
        return {
          icon: CloudRain,
          color: 'text-cyan-400 bg-cyan-950/80 border-cyan-700/80',
          label: '🔵 AI WEATHER ALERT',
          badgeColor: 'cyan'
        };
      default:
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400 bg-emerald-950/80 border-emerald-700/80',
          label: '🟢 APPROVAL COMPLETE',
          badgeColor: 'emerald'
        };
    }
  };

  const handleAcknowledge = (id) => {
    setAcknowledgedIds(prev => [...prev, id]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read && !acknowledgedIds.includes(n.id)).length;

  return (
    <div className="space-y-6 pb-16 w-full max-w-7xl mx-auto selection:bg-red-700 selection:text-white font-sans">
      {/* Official Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#070D18] via-[#0A1426] to-[#070D18] border border-blue-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              {currentZone} • {currentDivision} DIVISION
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY & ALERTS DISPATCH
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono flex items-center gap-3">
            <Bell className="w-7 h-7 text-amber-400" />
            <span>Operational Control Center Notifications</span>
          </h1>

          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time critical events, block timing updates, weather advisories, and departmental approval triggers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-red-950/80 border border-red-700/60 font-mono text-xs text-red-300 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>{unreadCount} UNREAD ALERTS</span>
          </div>

          {markAllNotificationsRead && (
            <button
              onClick={markAllNotificationsRead}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold border border-slate-700 transition-colors"
            >
              MARK ALL READ
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 font-mono text-xs border-b border-slate-800">
        {[
          { id: 'ALL', label: 'ALL NOTIFICATIONS', count: notifications.length },
          { id: 'EMERGENCY', label: '🔴 EMERGENCY', count: notifications.filter(n => n.type === 'EMERGENCY').length },
          { id: 'BLOCK_UPDATE', label: '🟠 BLOCK UPDATES', count: notifications.filter(n => n.type === 'BLOCK_UPDATE').length },
          { id: 'APPROVAL', label: '🟡 APPROVALS', count: notifications.filter(n => n.type === 'APPROVAL').length },
          { id: 'WEATHER', label: '🔵 AI WEATHER', count: notifications.filter(n => n.type === 'WEATHER').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg border font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              filterType === tab.id
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-950/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notification Cards List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#091122]/60 border border-slate-800 font-mono text-sm text-slate-500">
            No notifications found under selected filter.
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const badge = getSeverityBadge(notif.type);
            const Icon = badge.icon;
            const isAck = acknowledgedIds.includes(notif.id);

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isAck
                    ? 'bg-[#080E1A]/40 border-slate-800/60 opacity-70'
                    : 'bg-[#0A1324] border-slate-700/80 shadow-md hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${badge.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {notif.timestamp}
                      </span>
                      {notif.workId && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-700/50">
                          REF: {notif.workId}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white font-mono mb-1">
                      {notif.title}
                    </h3>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {isAck ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>ACKNOWLEDGED</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(notif.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ACKNOWLEDGE</span>
                    </button>
                  )}

                  {notif.type === 'APPROVAL' && onNavigate && (
                    <button
                      onClick={() => onNavigate('todays-work')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>OPEN TASK</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {notif.type === 'EMERGENCY' && onNavigate && (
                    <button
                      onClick={() => onNavigate('emergency-work')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>VIEW EMERGENCY</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
