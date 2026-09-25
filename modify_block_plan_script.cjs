const fs = require('fs');

const path = 'c:\\Pragati\\src\\pages\\BlockPlanChangesPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change versionHistory from const to useState
content = content.replace(
  "const versionHistory = [",
  "const [isModalOpen, setIsModalOpen] = useState(false);\n  const [modForm, setModForm] = useState({ reason: '', newDuration: '150 Mins', newEndTime: '14:00 IST' });\n\n  const [versionHistory, setVersionHistory] = useState(["
);

// Close the bracket for useState
content = content.replace(
  "  ];\n\n  return (",
  "  ]);\n\n  const handleModifySubmit = (e) => {\n    e.preventDefault();\n    const newVersion = {\n      planId: 'BP-WCR-1024',\n      version: versionHistory.length + 1,\n      corridor: 'BPL - SEH',\n      section: 'BPL - SEH (Km 12/4 - 18/6)',\n      window: `11:30 - ${modForm.newEndTime}`,\n      duration: modForm.newDuration,\n      reason: modForm.reason,\n      changedBy: 'DOM Sanjay Srivastava', // Or fetch from auth context if needed\n      changedAt: 'Today, Just Now',\n      changes: [\n        { field: 'Duration', from: versionHistory[0].duration, to: modForm.newDuration },\n        { field: 'End Time', from: versionHistory[0].window.split(' - ')[1], to: modForm.newEndTime }\n      ]\n    };\n    setVersionHistory([newVersion, ...versionHistory]);\n    setIsModalOpen(false);\n    setModForm({ reason: '', newDuration: '', newEndTime: '' });\n  };\n\n  return ("
);

// 2. Change onClick alert to open modal
content = content.replace(
  "onClick={() => alert('Change Block Plan workflow initiated.')}",
  "onClick={() => setIsModalOpen(true)}"
);

// 3. Add Modal UI at the bottom of the main div
const modalCode = `
      {/* Modification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#D9DEE7] rounded-xl shadow-xl p-6 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE7]">
              <h3 className="text-base font-bold text-[#173B73] flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                MODIFY BLOCK PLAN {selectedPlanId}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#5B6575] hover:text-[#172033]">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleModifySubmit} className="space-y-4">
              <div>
                <label className="text-[#172033] font-bold block mb-1">Reason for Modification</label>
                <textarea
                  required
                  rows={2}
                  value={modForm.reason}
                  onChange={(e) => setModForm({ ...modForm, reason: e.target.value })}
                  placeholder="e.g. Unforeseen track conditions requiring extended block..."
                  className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#172033] font-bold block mb-1">New Duration</label>
                  <input
                    required
                    type="text"
                    value={modForm.newDuration}
                    onChange={(e) => setModForm({ ...modForm, newDuration: e.target.value })}
                    placeholder="e.g. 150 Mins"
                    className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73]"
                  />
                </div>
                <div>
                  <label className="text-[#172033] font-bold block mb-1">New End Time</label>
                  <input
                    required
                    type="text"
                    value={modForm.newEndTime}
                    onChange={(e) => setModForm({ ...modForm, newEndTime: e.target.value })}
                    placeholder="e.g. 14:00 IST"
                    className="w-full py-2 px-3 bg-[#F4F6F8] border border-[#D9DEE7] rounded-lg text-[#172033] focus:outline-none focus:border-[#173B73]"
                  />
                </div>
              </div>
              
              <div className="pt-3 border-t border-[#D9DEE7] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#D9DEE7] text-[#5B6575] font-bold hover:bg-[#F4F6F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Modification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace(
  "    </div>\n  );\n};",
  modalCode + "\n    </div>\n  );\n};"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Update script completed successfully.');
