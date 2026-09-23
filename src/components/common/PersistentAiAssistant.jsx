import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  Cpu,
  ShieldCheck,
  HelpCircle,
  Clock,
  Layers,
  Zap,
  CloudRain
} from 'lucide-react';
import { useRailway } from '../../context/RailwayContext';
import { useAuth } from '../../context/AuthContext';

export const PersistentAiAssistant = () => {
  const { currentZone, currentDivision, todayWorkTasks, activeWorkTasks } = useRailway();
  const { user: authUser } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'AI',
      text: `Greetings, ${authUser?.name || 'Officer'}. I am RailOpt AI Command Assistant for ${currentZone} • ${currentDivision} Division. How can I assist you with today's maintenance schedule or block optimization?`,
      time: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const quickPrompts = [
    'Explain task bundling logic',
    'Summarize today\'s maintenance work',
    'Explain weather warning impact',
    'How does sequential approval work?'
  ];

  const handleSend = (textToSend = inputQuery) => {
    const query = (textToSend || '').trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'USER',
      text: query,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Context-aware AI response generator
    setTimeout(() => {
      let aiReply = '';
      const q = query.toLowerCase();

      if (q.includes('bundle') || q.includes('group')) {
        aiReply = `Tasks are bundled when they share overlapping geographical sections (e.g. Bhopal to Sehore Km 12/4 - 18/6) on the same track. Combining P-Way tamping with S&T point machine calibration and TRD catenary tensioning within a single 2 to 3 hour window eliminates the need for 3 separate line possessions, saving ~180 minutes of corridor capacity.`;
      } else if (q.includes('today') || q.includes('schedule')) {
        aiReply = `Currently, there are ${todayWorkTasks.length} maintenance requisitions approved by DOM in Today's Maintenance Work queue for ${currentZone}. Block plans can now be generated on-demand for these specific tasks using the AI solver.`;
      } else if (q.includes('weather')) {
        aiReply = `Weather intelligence indicates convective showers (14 km/h winds, 38°C) along the Betwa basin. Rail neutral temperature (T_k) should be monitored for destressing, and OHE droppers should be checked prior to energization.`;
      } else if (q.includes('approval') || q.includes('approve')) {
        aiReply = `Sequential approvals require clearances from Engineering (P-Way), S&T, and TRD. Once all required departments certify clearance, the system automatically transitions the block plan into Currently Active Maintenance Work.`;
      } else {
        aiReply = `Understood. Analyzing operational state for ${currentZone} • ${currentDivision} Division. All safety rules under Indian Railways G&SR Chapter IV are enforced. Feel free to ask about corridor capacity, train conflicts, or live digital twin telemetry.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'AI',
          text: aiReply,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-900 hover:from-red-500 text-white font-mono font-bold text-xs flex items-center gap-2.5 shadow-2xl shadow-red-950/80 border border-red-500/50 hover:scale-105 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span>RailOpt AI Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
        </button>
      )}

      {/* Assistant Modal Window */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2rem)] h-[520px] rounded-2xl bg-[#09101E] border-2 border-cyan-500/70 shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0C1527] to-[#09101E] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 flex items-center justify-center">
                <Cpu className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">
                  RailOpt AI Assistant
                </h3>
                <div className="text-[10px] text-cyan-400">
                  {currentZone} • {currentDivision} DESK
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-black/30 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] whitespace-nowrap">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
            {messages.map(m => {
              const isAi = m.sender === 'AI';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                      isAi
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : 'bg-blue-600 text-white font-semibold'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">{m.time}</span>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask RailOpt AI about corridor, block or safety..."
              className="flex-1 py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 text-white rounded-xl font-bold flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
