import React from 'react';
import { DollarSign, BatteryCharging, Zap, Gauge, Timer } from 'lucide-react';
import type { OptimizeEnergyResponse } from '../types/energy';

interface MetricCardsProps {
  response: OptimizeEnergyResponse;
  durationMs: number | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ response, durationMs }) => {
  const finalEnergy = response.hourly_plan.length > 0
    ? response.hourly_plan[23].battery_energy_after_kwh
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Cost */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Grid Cost</span>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            ৳{response.total_cost_bdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 font-semibold">BDT</span>
        </div>
        <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Optimal LP dispatch
        </p>
      </div>

      {/* Total Grid Import */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Grid Import</span>
          <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {response.total_grid_kwh.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 font-semibold">kWh</span>
        </div>
        <p className="text-[11px] text-slate-600 font-medium mt-1">24-hour aggregate import</p>
      </div>

      {/* Peak Grid Draw */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peak Grid Draw</span>
          <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Gauge className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {response.peak_grid_kwh.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 font-semibold">kWh</span>
        </div>
        <p className="text-[11px] text-slate-600 font-medium mt-1">Single-hour maximum load</p>
      </div>

      {/* Final Battery Energy & Latency */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Final Battery Energy</span>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <BatteryCharging className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {finalEnergy.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 font-semibold">kWh</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[11px]">
          <span className="text-emerald-700 font-medium">✓ E₂₃ = E₀ Neutral</span>
          {durationMs !== null && (
            <span className="text-slate-500 font-mono flex items-center gap-0.5" title="LLM + Solver Roundtrip">
              <Timer className="w-3 h-3 text-slate-400" />
              {durationMs}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
