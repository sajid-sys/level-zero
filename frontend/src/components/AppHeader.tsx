import React from 'react';
import { Zap, Activity, RefreshCw, FolderOpen } from 'lucide-react';

interface AppHeaderProps {
  apiOnline: boolean | null;
  onOpenSampleModal: () => void;
  onReset: () => void;
  isOptimizing: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  apiOnline,
  onOpenSampleModal,
  onReset,
  isOptimizing
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              GridWise AI Energy Optimizer
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Smart Campus Energy Operations Dashboard</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* API Health Pill */}
          <div className="flex items-center px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium">
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                apiOnline === true
                  ? 'bg-emerald-500 animate-pulse'
                  : apiOnline === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            <Activity className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <span className="text-slate-700">
              {apiOnline === true ? 'API Online' : apiOnline === false ? 'API Offline' : 'Checking…'}
            </span>
          </div>

          {/* Load Sample Button */}
          <button
            type="button"
            onClick={onOpenSampleModal}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs transition"
          >
            <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Load Sample
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            disabled={isOptimizing}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-hidden disabled:opacity-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Reset
          </button>
        </div>
      </div>
    </header>
  );
};
