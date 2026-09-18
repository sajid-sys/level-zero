import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader } from './components/AppHeader';
import { ScenarioForm } from './components/ScenarioForm';
import { BatteryForm } from './components/BatteryForm';
import { EnergyInputTable } from './components/EnergyInputTable';
import { InputChart } from './components/InputChart';
import { MetricCards } from './components/MetricCards';
import { DirectiveCards } from './components/DirectiveCards';
import { EnergyScheduleChart } from './components/EnergyScheduleChart';
import { BatterySocChart } from './components/BatterySocChart';
import { BatteryTimeline } from './components/BatteryTimeline';
import { HourlyPlanTable } from './components/HourlyPlanTable';
import { ValidationPanel } from './components/ValidationPanel';
import { RawJsonViewer } from './components/RawJsonViewer';
import { SampleCaseModal } from './components/SampleCaseModal';

import { SAMPLE_CASES } from './data/sample_cases';
import type { OptimizeEnergyRequest, OptimizeEnergyResponse, SampleCase } from './types/energy';
import { checkApiHealth, postOptimizeEnergy } from './api/client';
import {
  AlertCircle,
  SlidersHorizontal,
  BarChart3,
  ShieldCheck,
  Play,
  Loader2,
  Sparkles,
} from 'lucide-react';

type TabId = 'profiler' | 'analytics' | 'audit';

export const App: React.FC = () => {
  const defaultSample = SAMPLE_CASES[0];

  const [request, setRequest] = useState<OptimizeEnergyRequest>(defaultSample.input);
  const [response, setResponse] = useState<OptimizeEnergyResponse | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>('profiler');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  // Health check polling
  useEffect(() => {
    let mounted = true;
    const pollHealth = async () => {
      const ok = await checkApiHealth();
      if (mounted) setApiOnline(ok);
    };
    pollHealth();
    const interval = setInterval(pollHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handlers
  const handleSelectSample = (sample: SampleCase) => {
    setRequest(JSON.parse(JSON.stringify(sample.input)));
    setResponse(null);
    setDurationMs(null);
    setErrorMsg(null);
    setActiveTab('profiler');
  };

  const handleReset = () => {
    handleSelectSample(defaultSample);
  };

  const handleOptimize = useCallback(async () => {
    setErrorMsg(null);
    setIsOptimizing(true);
    try {
      const result = await postOptimizeEnergy(request);
      setResponse(result.data);
      setDurationMs(result.durationMs);
      setActiveTab('analytics');
    } catch (err: any) {
      setErrorMsg(err.message || 'Optimization request failed.');
    } finally {
      setIsOptimizing(false);
    }
  }, [request]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to run optimization
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isOptimizing) {
          handleOptimize();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOptimize, isOptimizing]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AppHeader
        apiOnline={apiOnline}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onReset={handleReset}
        isOptimizing={isOptimizing}
        onOptimize={handleOptimize}
        scenarioId={request.scenario_id}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                Optimization Error
              </h4>
              <p className="text-xs mt-0.5 text-rose-700 font-medium">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={handleOptimize}
              className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Executive KPI Header (rendered when optimization result is available) */}
        {response && (
          <div className="space-y-4">
            <MetricCards response={response} durationMs={durationMs} />
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('profiler')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'profiler'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>1. Scenario & Load Profiler</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Dispatch & SoC Analytics</span>
              {response && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Constraint Audit & Raw Inspector</span>
              {response && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-semibold">
              Ctrl + Enter
            </kbd>
          </div>
        </div>

        {/* TAB 1: SCENARIO & LOAD PROFILER */}
        {activeTab === 'profiler' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScenarioForm
                scenarioId={request.scenario_id}
                onScenarioIdChange={(id) => setRequest({ ...request, scenario_id: id })}
                operatorNotes={request.operator_notes}
                onNotesChange={(notes) => setRequest({ ...request, operator_notes: notes })}
              />
              <BatteryForm
                battery={request.battery}
                onChange={(b) => setRequest({ ...request, battery: b })}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <EnergyInputTable
                  hours={request.hours}
                  onChange={(hours) => setRequest({ ...request, hours })}
                />
              </div>
              <div className="lg:col-span-6">
                <InputChart hours={request.hours} />
              </div>
            </div>

            {/* Run Action Bar */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Ready to solve: {request.scenario_id}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    72-variable HiGHS LP formulation with Gemini LLM directive translation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-bold text-xs text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-900" />
                    Executing LP Solve…
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Run 24h Optimization
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DISPATCH & SOC ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {!response ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Optimization Results Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Run the optimization from the top bar or load a benchmark case to view the 24-hour dispatch schedule and battery SoC trajectory.
                </p>
                <button
                  type="button"
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Run Optimization Now
                </button>
              </div>
            ) : (
              <>
                {/* Plan Strategy Summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Optimization Strategy Summary
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {response.plan_summary}
                  </p>
                </div>

                {/* LLM Directive Interpretations */}
                <DirectiveCards directives={response.directive_interpretation} />

                {/* Charts: Energy Flow & Battery SoC */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnergyScheduleChart hourlyPlan={response.hourly_plan} hours={request.hours} />
                  <BatterySocChart hourlyPlan={response.hourly_plan} battery={request.battery} />
                </div>

                {/* Battery 24h Action Heatstrip */}
                <BatteryTimeline hourlyPlan={response.hourly_plan} />
              </>
            )}
          </div>
        )}

        {/* TAB 3: CONSTRAINT AUDIT & RAW INSPECTOR */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {!response ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Audit Awaiting Optimization Run</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Run the optimizer to verify physical energy balance, battery capacity limits, and operator directive compliance.
                </p>
                <button
                  type="button"
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Run Optimization Now
                </button>
              </div>
            ) : (
              <>
                {/* Client-Side Independent Verification */}
                <ValidationPanel response={response} hours={request.hours} battery={request.battery} />

                {/* Hourly Dispatch Plan Matrix Table */}
                <HourlyPlanTable hourlyPlan={response.hourly_plan} />

                {/* Raw JSON Inspector */}
                <RawJsonViewer request={request} response={response} />
              </>
            )}
          </div>
        )}
      </main>

      {/* Public Sample Modal */}
      <SampleCaseModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSelectSample}
      />

      <footer className="mt-auto py-4 border-t border-slate-200 text-center text-xs text-slate-500">
        GridWise Campus Energy Optimizer • BUP CSE Fest 2026 Hackathon • Dual-Core LLM & SciPy Linear Programming Engine
      </footer>
    </div>
  );
};

export default App;

