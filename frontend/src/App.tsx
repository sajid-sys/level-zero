import React, { useState, useEffect } from 'react';
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
import { Zap, AlertCircle, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const defaultSample = SAMPLE_CASES[0];

  const [request, setRequest] = useState<OptimizeEnergyRequest>(defaultSample.input);
  const [response, setResponse] = useState<OptimizeEnergyResponse | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);

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
  };

  const handleReset = () => {
    handleSelectSample(defaultSample);
  };

  const handleOptimize = async () => {
    setErrorMsg(null);
    setIsOptimizing(true);
    try {
      const result = await postOptimizeEnergy(request);
      setResponse(result.data);
      setDurationMs(result.durationMs);
    } catch (err: any) {
      setErrorMsg(err.message || 'Optimization request failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader
        apiOnline={apiOnline}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onReset={handleReset}
        isOptimizing={isOptimizing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold">Optimization Error</h4>
              <p className="text-xs mt-0.5 text-rose-700">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={handleOptimize}
              className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* TOP CONFIGURATION ROW */}
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

        {/* INPUT DATA & CHART */}
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

        {/* PRIMARY ACTION BUTTON */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-hidden focus:ring-4 focus:ring-emerald-200 shadow-lg shadow-emerald-600/20 transition disabled:opacity-60 cursor-pointer"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Interpreting directives and optimizing 24-hour schedule…
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2 fill-current" />
                Optimize Energy Schedule
              </>
            )}
          </button>
        </div>

        {/* OPTIMIZATION RESULTS SECTION */}
        {response && (
          <div className="space-y-6 pt-4 border-t border-slate-200">
            {/* KPI Cards */}
            <MetricCards response={response} durationMs={durationMs} />

            {/* Plan Strategy Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Optimization Strategy Summary
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {response.plan_summary}
              </p>
            </div>

            {/* Directive Interpretations */}
            <DirectiveCards directives={response.directive_interpretation} />

            {/* Charts: Energy Flow & Battery SoC */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnergyScheduleChart hourlyPlan={response.hourly_plan} hours={request.hours} />
              <BatterySocChart hourlyPlan={response.hourly_plan} battery={request.battery} />
            </div>

            {/* Battery Timeline */}
            <BatteryTimeline hourlyPlan={response.hourly_plan} />

            {/* Hourly Dispatch Plan Table */}
            <HourlyPlanTable hourlyPlan={response.hourly_plan} />

            {/* Client-Side Independent Verification */}
            <ValidationPanel response={response} hours={request.hours} battery={request.battery} />

            {/* Raw JSON Inspector */}
            <RawJsonViewer request={request} response={response} />
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
        GridWise AI Energy Optimizer • BUP CSE Fest 2026 Hackathon • Powered by FastAPI & SciPy Linear Programming
      </footer>
    </div>
  );
};

export default App;
