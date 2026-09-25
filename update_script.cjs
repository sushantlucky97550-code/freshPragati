const fs = require('fs');

const path = 'c:\\Pragati\\src\\pages\\ActiveMaintenancePage.jsx';
let content = fs.readFileSync(path, 'utf8');

const demoCorridors = `
const demoCorridors = [
  {
    id: 'WRK-101',
    corridor: 'NDLS — CNB',
    from: 'NDLS',
    to: 'CNB',
    departments: 'Engineering + TRD',
    type: 'Track Maintenance',
    status: 'ACTIVE',
    startTime: '10:00 IST',
    endTime: '14:00 IST',
    track: 'TRACK 1 (UP)',
    maintenanceStatus: 'IN PROGRESS',
    stations: ['NDLS', 'GZB', 'CNB']
  },
  {
    id: 'WRK-102',
    corridor: 'NDLS — AGC',
    from: 'NDLS',
    to: 'AGC',
    departments: 'TRD + S&T',
    type: 'OHE + Signal Maintenance',
    status: 'ACTIVE',
    startTime: '11:30 IST',
    endTime: '13:30 IST',
    track: 'TRACK 2 (DOWN)',
    maintenanceStatus: 'ISOLATION DONE',
    stations: ['NDLS', 'MTJ', 'AGC']
  },
  {
    id: 'WRK-103',
    corridor: 'CNB — PRYG',
    from: 'CNB',
    to: 'PRYG',
    departments: 'Engineering + S&T',
    type: 'Track + Signalling Maintenance',
    status: 'ACTIVE',
    startTime: '09:00 IST',
    endTime: '15:00 IST',
    track: 'TRACK 3 (FAST)',
    maintenanceStatus: 'WORK IN PROGRESS',
    stations: ['CNB', 'FTP', 'PRYG']
  }
];
`;

// Insert demoCorridors before the component
content = content.replace(
  "export const ActiveMaintenancePage = ({ onNavigate }) => {",
  demoCorridors + "\nexport const ActiveMaintenancePage = ({ onNavigate }) => {"
);

// State for selected corridor
content = content.replace(
  "const [selectedActiveWork, setSelectedActiveWork] = useState(null);",
  "const [selectedActiveWork, setSelectedActiveWork] = useState(demoCorridors[0]);"
);

// Add keyframes for animation in a style block inside the return
const listCode = `
      {/* ────────────────────────────────────────────────────────── */}
      {/* PART 1: LIVE CORRIDOR LIST                                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-4 font-mono select-none">
        <h2 className="text-[#173B73] font-bold text-lg">LIVE CORRIDORS (ACTIVE MAINTENANCE)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoCorridors.map((work, index) => (
            <div 
              key={work.id}
              onClick={() => setSelectedActiveWork(work)}
              className={\`p-4 rounded-xl border-2 cursor-pointer transition-all \${selectedActiveWork.id === work.id ? 'border-[#173B73] bg-[#EBF2FA] shadow-md' : 'border-[#D9DEE7] bg-white hover:border-[#173B73]/50'}\`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#173B73] font-bold text-lg">{index + 1}. {work.corridor}</span>
                <span className="px-2 py-1 bg-emerald-100 text-[#168A55] text-[10px] font-bold rounded">STATUS: {work.status}</span>
              </div>
              <div className="text-xs text-[#172033] space-y-1">
                <p><span className="font-bold">Work ID:</span> {work.id}</p>
                <p><span className="font-bold">From:</span> {work.from} <span className="font-bold">To:</span> {work.to}</p>
                <p><span className="font-bold">Type:</span> {work.type}</p>
                <p><span className="font-bold">Depts:</span> {work.departments}</p>
                <p><span className="font-bold">Time:</span> {work.startTime} - {work.endTime}</p>
                <p><span className="font-bold">Track:</span> {work.track}</p>
                <p><span className="font-bold text-amber-700">Maint. Status:</span> {work.maintenanceStatus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
`;

// Replace the Real-Time Block Plan Change Broadcast Banner with the list
// Actually just insert it before the LIVE CORRIDOR DIGITAL TWIN
content = content.replace(
  "{/* ────────────────────────────────────────────────────────── */}\n      {/* 27. LIVE CORRIDOR DIGITAL TWIN                            */}\n      {/* ────────────────────────────────────────────────────────── */}",
  listCode + "\n\n      {/* ────────────────────────────────────────────────────────── */}\n      {/* 27. LIVE CORRIDOR DIGITAL TWIN                            */}\n      {/* ────────────────────────────────────────────────────────── */}"
);


// Replace the Digital Twin content
const digitalTwinStart = content.indexOf('<div className="rounded-2xl border-2 border-cyan-500/60 bg-[#070D18]');
const digitalTwinEnd = content.indexOf('      {/* ────────────────────────────────────────────────────────── */}\n      {/* 29. LIVE MAINTENANCE CONTROLS                             */}');

const newDigitalTwin = `
      <div className="rounded-2xl border-2 border-cyan-500/60 bg-[#070D18] p-6 shadow-2xl relative overflow-hidden font-mono select-none my-6">
        {/* Top Status Bar of Digital Twin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              LIVE CORRIDOR DIGITAL TWIN — {selectedActiveWork.corridor}
            </h2>
          </div>
          
          <div className="flex gap-4 text-xs text-white">
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Maintenance:</span>
              <span className="text-emerald-400 font-bold">{selectedActiveWork.status}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Track:</span>
              <span className="text-red-400 font-bold">RESTRICTED</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Trains:</span>
              <span className="text-cyan-400 font-bold">3</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Maintenance Teams:</span>
              <span className="text-amber-400 font-bold">2</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Block Status:</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
              <span className="block text-slate-400">Telemetry:</span>
              <span className="text-cyan-400 font-bold">SIMULATION</span>
            </div>
          </div>
        </div>

        {/* The Track Digital Twin SVG Diagram */}
        <div className="my-8 relative">
          <svg className="w-full h-80 rounded-xl bg-[#03060C] border border-slate-800/80" viewBox="0 0 1000 320">
            {/* Stations Background Pillars */}
            {selectedActiveWork.stations.map((st, i) => (
               <g key={st}>
                 <line x1={150 + i * 350} y1="20" x2={150 + i * 350} y2="300" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
                 <rect x={120 + i * 350} y="30" width="60" height="24" rx="4" fill="#0F172A" stroke="#334155" />
                 <text x={150 + i * 350} y="46" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">{st}</text>
               </g>
            ))}

            {/* TRACK 1 */}
            <line x1="40" y1="100" x2="960" y2="100" stroke="#475569" strokeWidth="3" />
            <line x1="40" y1="106" x2="960" y2="106" stroke="#475569" strokeWidth="3" />
            <text x="50" y="92" fill="#94A3B8" fontSize="10" fontWeight="bold">TRACK 1 ➔</text>
            
            {/* TRACK 2 */}
            <line x1="40" y1="170" x2="960" y2="170" stroke="#475569" strokeWidth="3" />
            <line x1="40" y1="176" x2="960" y2="176" stroke="#475569" strokeWidth="3" />
            <text x="50" y="162" fill="#94A3B8" fontSize="10" fontWeight="bold">TRACK 2 ➔</text>

            {/* TRACK 3 */}
            <line x1="40" y1="240" x2="960" y2="240" stroke="#475569" strokeWidth="3" />
            <line x1="40" y1="246" x2="960" y2="246" stroke="#475569" strokeWidth="3" />
            <text x="50" y="232" fill="#94A3B8" fontSize="10" fontWeight="bold">TRACK 3 ⬅</text>

            {/* Sleepers on tracks */}
            {Array.from({ length: 48 }).map((_, i) => (
              <g key={i}>
                <line x1={40 + i * 20} y1="96" x2={40 + i * 20} y2="110" stroke="#334155" strokeWidth="2" />
                <line x1={40 + i * 20} y1="166" x2={40 + i * 20} y2="180" stroke="#334155" strokeWidth="2" />
                <line x1={40 + i * 20} y1="236" x2={40 + i * 20} y2="250" stroke="#334155" strokeWidth="2" />
              </g>
            ))}

            {/* ACTIVE MAINTENANCE ZONE HIGHLIGHT */}
            <g transform={\`translate(0, \${selectedActiveWork.track.includes('1') ? 0 : selectedActiveWork.track.includes('2') ? 70 : 140})\`}>
              <rect
                x="300"
                y="85"
                width="250"
                height="36"
                rx="6"
                fill="#EF4444"
                fillOpacity="0.25"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              <text x="425" y="80" fill="#F87171" fontSize="10" fontWeight="bold" textAnchor="middle">
                ⚠ MAINTENANCE ACTIVE ({selectedActiveWork.from} ➔ {selectedActiveWork.to})
              </text>
              <circle cx="290" cy="80" r="5" fill="#EF4444" className="animate-pulse" />
              <line x1="290" y1="85" x2="290" y2="98" stroke="#EF4444" strokeWidth="2" />
              <text x="290" y="70" fill="#EF4444" fontSize="9" textAnchor="middle">STOP (RED)</text>
              
              <circle cx="560" cy="80" r="5" fill="#10B981" />
              <line x1="560" y1="85" x2="560" y2="98" stroke="#10B981" strokeWidth="2" />
              <text x="560" y="70" fill="#10B981" fontSize="9" textAnchor="middle">CLEAR (GREEN)</text>
            </g>
            
            <g transform={\`translate(0, \${selectedActiveWork.track.includes('1') ? 70 : selectedActiveWork.track.includes('2') ? 140 : 0})\`}>
              <circle cx="350" cy="80" r="5" fill="#EAB308" />
              <line x1="350" y1="85" x2="350" y2="98" stroke="#EAB308" strokeWidth="2" />
              <text x="350" y="70" fill="#EAB308" fontSize="9" textAnchor="middle">CAUTION (YELLOW)</text>
            </g>

            {/* ANIMATED TRAINS */}
            
            {/* Train 1: Normal Speed */}
            <g>
              <animateTransform attributeName="transform" type="translate" from="-100 92" to="1100 92" dur="20s" repeatCount="indefinite" />
              <rect x="0" y="0" width="60" height="22" rx="4" fill="#047857" stroke="#6EE7B7" strokeWidth="1.5" />
              <polygon points="60,4 70,11 60,18" fill="#10B981" />
              <text x="30" y="14" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">TR 12951</text>
              <text x="30" y="-5" fill="#10B981" fontSize="9" fontWeight="bold" textAnchor="middle">ON TIME</text>
            </g>

            {/* Train 2: Approaching Block, slower */}
            <g>
              <animateTransform attributeName="transform" type="translate" from="-100 162" to="250 162" dur="15s" repeatCount="indefinite" />
              <rect x="0" y="0" width="60" height="22" rx="4" fill="#B91C1C" stroke="#FCA5A5" strokeWidth="1.5" />
              <polygon points="60,4 70,11 60,18" fill="#F87171" />
              <text x="30" y="14" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">TR 12424</text>
              <text x="30" y="-5" fill="#F87171" fontSize="9" fontWeight="bold" textAnchor="middle">APPROACHING</text>
            </g>

            {/* Train 3: Opposite Direction */}
            <g>
              <animateTransform attributeName="transform" type="translate" from="1100 232" to="-100 232" dur="25s" repeatCount="indefinite" />
              <rect x="0" y="0" width="60" height="22" rx="4" fill="#D97706" stroke="#FCD34D" strokeWidth="1.5" />
              <polygon points="0,4 -10,11 0,18" fill="#FBBF24" />
              <text x="30" y="14" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">TR 12034</text>
              <text x="30" y="-5" fill="#FBBF24" fontSize="9" fontWeight="bold" textAnchor="middle">REGULATED</text>
            </g>
          </svg>
        </div>
      </div>
`;

content = content.substring(0, digitalTwinStart) + newDigitalTwin + content.substring(digitalTwinEnd);

fs.writeFileSync(path, content, 'utf8');
console.log('Update script completed successfully.');
