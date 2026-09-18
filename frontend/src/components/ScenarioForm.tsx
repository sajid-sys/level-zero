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
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Scenario Configuration
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">1–3 Operator Notes</span>
      </div>

      <div className="mt-4 space-y-4">
        {/* Scenario ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Scenario ID
          </label>
          <input
            type="text"
            value={scenarioId}
            onChange={(e) => onScenarioIdChange(e.target.value)}
            placeholder="e.g. CAMPUS-GRID-2026"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-slate-800"
          />
        </div>

        {/* Operator Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Operator Directives ({operatorNotes.length}/3)
            </label>
            {operatorNotes.length < 3 && (
              <button
                type="button"
                onClick={handleAddNote}
                className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                Add Note
              </button>
            )}
          </div>

          <div className="space-y-3">
            {operatorNotes.map((note, idx) => (
              <div key={idx} className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    Note #{idx}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400">{note.length} chars</span>
                    {operatorNotes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNote(idx)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Remove note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => handleNoteChange(idx, e.target.value)}
                  placeholder="Enter natural language operator directive (e.g. Expect an 80% reduction in rooftop solar between 11 AM and 2 PM...)"
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
