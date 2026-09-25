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
          color: 'text-[#C62828] bg-red-50 border-[#C62828]/30',
          label: '🔴 EMERGENCY',
          badgeColor: 'red'
        };
      case 'BLOCK_UPDATE':
        return {
          icon: Clock,
          color: 'text-[#D98C00] bg-amber-50 border-amber-300',
          label: '🟠 BLOCK UPDATE',
          badgeColor: 'amber'
        };
      case 'APPROVAL':
        return {
          icon: ShieldAlert,
          color: 'text-[#173B73] bg-[#EBF2FA] border-[#D9DEE7]',
          label: '🟡 APPROVAL REQUIRED',
          badgeColor: 'yellow'
        };
      case 'WEATHER':
        return {
          icon: CloudRain,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          label: '🔵 AI WEATHER ALERT',
          badgeColor: 'cyan'
        };
      default:
        return {
          icon: CheckCircle2,
          color: 'text-[#168A55] bg-emerald-50 border-emerald-200',
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
    <div className="space-y-6 pb-16 w-full max-w-7xl mx-auto selection:bg-[#173B73] selection:text-white font-sans">
      {/* Official Header - White + Navy */}
      <div className="rounded-xl overflow-hidden border border-[#D9DEE7] shadow-md bg-white">
        <div className="bg-[#173B73] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-blue-200 uppercase tracking-widest mb-0.5">
                <span>{currentZone} &bull; {currentDivision} DIVISION &bull; LIVE ALERTS DISPATCH</span>
              </div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-300" />
                <span>Operational Control Center Notifications</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#C62828] border border-red-400/40 font-mono text-xs text-white font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-300 animate-ping" />
              <span>{unreadCount} UNREAD ALERTS</span>
            </div>
            {markAllNotificationsRead && (
              <button
                onClick={markAllNotificationsRead}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-mono text-xs font-bold border border-white/30 transition-colors"
              >
                MARK ALL READ
              </button>
            )}
          </div>
        </div>
        <div className="px-5 py-3">
          <p className="text-xs text-[#5B6575] font-medium">
            Real-time critical events, block timing updates, weather advisories, and departmental approval triggers
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 font-mono text-xs border-b border-[#D9DEE7]">
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
                ? 'bg-[#173B73] text-white border-[#173B73] shadow-md'
                : 'bg-white text-[#5B6575] border-[#D9DEE7] hover:border-[#173B73] hover:text-[#173B73]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterType === tab.id ? 'bg-white/20 text-white' : 'bg-[#F4F6F8] text-[#5B6575]'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notification Cards List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white border border-[#D9DEE7] font-mono text-sm text-[#5B6575]">
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
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white ${
                  isAck
                    ? 'border-[#D9DEE7] opacity-70'
                    : 'border-[#D9DEE7] shadow-sm hover:border-[#173B73] hover:shadow-md'
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
                      <span className="text-[11px] font-mono text-[#5B6575]">
                        {notif.timestamp}
                      </span>
                      {notif.workId && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF2FA] text-[#173B73] border border-[#D9DEE7]">
                          REF: {notif.workId}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#172033] font-mono mb-1">
                      {notif.title}
                    </h3>

                    <p className="text-xs text-[#5B6575] font-sans leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {isAck ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#168A55] border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>ACKNOWLEDGED</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(notif.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#EBF2FA] hover:bg-[#173B73] text-[#173B73] hover:text-white border border-[#D9DEE7] font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ACKNOWLEDGE</span>
                    </button>
                  )}

                  {notif.type === 'APPROVAL' && onNavigate && (
                    <button
                      onClick={() => onNavigate('todays-work')}
                      className="px-3 py-1.5 rounded-lg bg-[#173B73] hover:bg-[#1F4380] text-white font-mono text-xs font-bold transition-colors flex items-center gap-1"
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
