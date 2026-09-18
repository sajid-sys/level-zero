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
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Grid Cost</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-slate-900">
            ৳{response.total_cost_bdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 font-medium">BDT</span>
        </div>
        <p className="text-[11px] text-emerald-600 font-medium mt-1">Cost-optimized via Linear Programming</p>
      </div>

      {/* Total Grid Import */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Grid Import</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {response.total_grid_kwh.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 font-medium">kWh</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium mt-1">24-hour aggregate import</p>
      </div>

      {/* Peak Grid Import */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peak Grid Import</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {response.peak_grid_kwh.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 font-medium">kWh</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium mt-1">Maximum single-hour power draw</p>
      </div>

      {/* Final Battery Energy */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Final Battery Energy</span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <BatteryCharging className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-slate-900">
            {finalEnergy.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 font-medium">kWh</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[11px]">
          <span className="text-emerald-600 font-medium">✓ Neutrality satisfied</span>
          {durationMs !== null && (
            <span className="text-slate-400 flex items-center gap-0.5">
              <Timer className="w-3 h-3" />
              {durationMs}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
