import React from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';

interface ScenarioFormProps {
  scenarioId: string;
  onScenarioIdChange: (id: string) => void;
  operatorNotes: string[];
  onNotesChange: (notes: string[]) => void;
}

export const ScenarioForm: React.FC<ScenarioFormProps> = ({
  scenarioId,
  onScenarioIdChange,
  operatorNotes,
  onNotesChange,
}) => {
  const handleNoteChange = (index: number, val: string) => {
    const updated = [...operatorNotes];
    updated[index] = val;
    onNotesChange(updated);
  };

  const handleAddNote = () => {
    if (operatorNotes.length < 3) {
      onNotesChange([...operatorNotes, '']);
    }
  };

  const handleRemoveNote = (index: number) => {
    if (operatorNotes.length > 1) {
      onNotesChange(operatorNotes.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Scenario Definition
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {operatorNotes.length} of 3 Directives
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {/* Scenario ID */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Scenario Identifier
            </label>
            <span className="text-[10px] text-slate-400 font-mono">ID string</span>
          </div>
          <input
            type="text"
            value={scenarioId}
            onChange={(e) => onScenarioIdChange(e.target.value)}
            placeholder="e.g. CAMPUS-GRID-2026"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-400 font-mono text-slate-900 font-semibold"
          />
        </div>

        {/* Operator Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Natural Language Operator Notes
            </label>
            {operatorNotes.length < 3 && (
              <button
                type="button"
                onClick={handleAddNote}
                className="inline-flex items-center text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
              >
                <Plus className="w-3 h-3 mr-0.5" />
                Add Directive
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {operatorNotes.map((note, idx) => (
              <div key={idx} className="relative rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5 font-mono">
                    <span className="w-4 h-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[10px]">
                      {idx}
                    </span>
                    Directive #{idx}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-mono">{note.length} ch</span>
                    {operatorNotes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNote(idx)}
                        className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                        title="Remove directive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => handleNoteChange(idx, e.target.value)}
                  placeholder="e.g., Expect 80% solar reduction between 11 AM and 2 PM due to inverter maintenance..."
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-400 text-slate-800 resize-none font-sans leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
