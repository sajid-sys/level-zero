import React from 'react';
import { X, ArrowRight, BookOpen } from 'lucide-react';
import { SAMPLE_CASES } from '../data/sample_cases';
import type { SampleCase } from '../types/energy';

interface SampleCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleCase) => void;
}

export const SampleCaseModal: React.FC<SampleCaseModalProps> = ({ isOpen, onClose, onSelectSample }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Load Public Benchmark Scenario</h3>
              <p className="text-xs text-slate-500">Select one of the 10 official test cases</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto divide-y divide-slate-100 space-y-1">
          {SAMPLE_CASES.map((sample) => (
            <div
              key={sample.id}
              className="py-3 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer transition group"
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
            >
              <div className="pr-4">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {sample.id}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-800">{sample.title}</h4>
                </div>
                <p className="text-xs text-slate-500 mt-1">{sample.description}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {sample.expected_directive_types.map((type, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
