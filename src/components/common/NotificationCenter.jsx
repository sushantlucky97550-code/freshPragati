import React from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  Flame,
  CloudRain,
  CheckCircle2,
  Clock,
  Check,
  ShieldAlert
} from 'lucide-react';
import { useRailway } from '../../context/RailwayContext';

export const NotificationCenter = ({ isOpen, onClose }) => {
  const { notifications } = useRailway();

  if (!isOpen) return null;

  const getSeverityBadge = (type) => {
    switch (type) {
      case 'EMERGENCY':
        return {
          icon: Flame,
          color: 'text-red-400 bg-red-950/80 border-red-700/80',
          label: '🔴 EMERGENCY'
        };
      case 'BLOCK_UPDATE':
        return {
          icon: Clock,
          color: 'text-amber-400 bg-amber-950/80 border-amber-700/80',
          label: '🟠 BLOCK UPDATE'
        };
      case 'APPROVAL':
        return {
          icon: ShieldAlert,
          color: 'text-yellow-400 bg-yellow-950/80 border-yellow-700/80',
          label: '🟡 APPROVAL'
        };
      case 'WEATHER':
        return {
          icon: CloudRain,
          color: 'text-cyan-400 bg-cyan-950/80 border-cyan-700/80',
          label: '🔵 AI WEATHER ALERT'
        };
      default:
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400 bg-emerald-950/80 border-emerald-700/80',
          label: '🟢 APPROVAL COMPLETE'
        };
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#070D18] border-l border-slate-800 shadow-2xl flex flex-col font-mono text-xs select-none">
      {/* Header */}
      <div className="p-4 bg-[#0A1220] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white uppercase">
            Control Room Alerts & Notifications
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications list */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No active alerts at this time.
          </div>
        ) : (
          notifications.map((item) => {
            const badge = getSeverityBadge(item.type);
            const Icon = badge.icon;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                </div>

                <div className="font-bold text-white text-xs pt-1">
                  {item.title}
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {item.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#0A1220] border-t border-slate-800 text-center text-[10px] text-slate-500">
        RAILOPT AI REAL-TIME AUDIT LOG
      </div>
    </div>
  );
};
