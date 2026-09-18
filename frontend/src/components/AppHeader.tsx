import React from 'react';
import { Zap, Activity, RefreshCw, FolderOpen, Play, Loader2 } from 'lucide-react';

interface AppHeaderProps {
  apiOnline: boolean | null;
  onOpenSampleModal: () => void;
  onReset: () => void;
  isOptimizing: boolean;
  onOptimize: () => void;
  scenarioId: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  apiOnline,
  onOpenSampleModal,
  onReset,
  isOptimizing,
  onOptimize,
  scenarioId,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Telemetry */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-5 h-5 text-emerald-400 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">GridWise</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                  Optimizer v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Campus Smart Microgrid Operations Console
              </p>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-200" />

          {/* Active Scenario Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Scenario:</span>
            <span className="font-mono font-bold text-slate-800">{scenarioId}</span>
          </div>
        </div>

        {/* Right: Controls & Primary Action */}
        <div className="flex items-center space-x-2.5">
          {/* API Health Pill */}
          <div
            className="flex items-center px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium"
            title={apiOnline === true ? 'FastAPI & HiGHS LP Solver Connected' : 'API Unreachable'}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                apiOnline === true
                  ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                  : apiOnline === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <Activity className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <span className="text-slate-700 font-mono text-[11px]">
              {apiOnline === true ? 'ONLINE' : apiOnline === false ? 'OFFLINE' : 'CHECKING'}
            </span>
          </div>

          {/* Benchmark Cases Modal Trigger */}
          <button
            type="button"
            onClick={onOpenSampleModal}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-400 shadow-2xs transition cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span className="hidden sm:inline">Load Sample</span>
            <span className="sm:hidden">Samples</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            disabled={isOptimizing}
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition cursor-pointer"
            title="Reset to default benchmark case"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Primary Optimization CTA */}
          <button
            type="button"
            onClick={onOptimize}
            disabled={isOptimizing}
            className="inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shadow-xs transition disabled:opacity-60 cursor-pointer"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                <span>Optimizing…</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                <span>Optimize 24h</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

