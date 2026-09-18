import React from 'react';
import { Battery, ShieldCheck } from 'lucide-react';
import type { BatteryConfig } from '../types/energy';

interface BatteryFormProps {
  battery: BatteryConfig;
  onChange: (b: BatteryConfig) => void;
}

export const BatteryForm: React.FC<BatteryFormProps> = ({ battery, onChange }) => {
  const updateField = (field: keyof BatteryConfig, val: number) => {
    onChange({
      ...battery,
      [field]: Math.max(0, val),
    });
  };

  const socPercentage = battery.capacity_kwh > 0
    ? Math.round((battery.initial_energy_kwh / battery.capacity_kwh) * 100)
    : 0;

  const minSocPercentage = battery.capacity_kwh > 0
    ? Math.round((battery.minimum_energy_kwh / battery.capacity_kwh) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Battery className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Battery Storage System
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Initial SoC: {socPercentage}%</span>
        </div>
      </div>

      {/* Visual Battery Bar */}
      <div className="mt-4 mb-4">
        <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200 relative overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, socPercentage))}%` }}
          />
          {/* Base reserve marker */}
          <div
            className="absolute top-0 bottom-0 border-r-2 border-dashed border-amber-600"
            style={{ left: `${minSocPercentage}%` }}
            title={`Min Reserve Floor: ${battery.minimum_energy_kwh} kWh (${minSocPercentage}%)`}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-amber-500 inline-block" />
            Min Reserve ({battery.minimum_energy_kwh} kWh)
          </span>
          <span className="font-semibold text-slate-700">
            Capacity ({battery.capacity_kwh} kWh)
          </span>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Capacity
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={battery.capacity_kwh}
              onChange={(e) => updateField('capacity_kwh', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-slate-400 font-mono text-slate-900 font-semibold tabular-nums text-xs"
            />
            <span className="ml-1.5 text-[10px] text-slate-400 font-mono">kWh</span>
          </div>
        </div>

        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Initial Energy (E₀)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={battery.initial_energy_kwh}
              onChange={(e) => updateField('initial_energy_kwh', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-slate-400 font-mono text-slate-900 font-semibold tabular-nums text-xs"
            />
            <span className="ml-1.5 text-[10px] text-slate-400 font-mono">kWh</span>
          </div>
        </div>

        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Min Reserve
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={battery.minimum_energy_kwh}
              onChange={(e) => updateField('minimum_energy_kwh', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-slate-400 font-mono text-slate-900 font-semibold tabular-nums text-xs"
            />
            <span className="ml-1.5 text-[10px] text-slate-400 font-mono">kWh</span>
          </div>
        </div>

        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Max Charge Rate
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={battery.max_charge_kwh_per_hour}
              onChange={(e) => updateField('max_charge_kwh_per_hour', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-slate-400 font-mono text-slate-900 font-semibold tabular-nums text-xs"
            />
            <span className="ml-1.5 text-[10px] text-slate-400 font-mono">kW</span>
          </div>
        </div>

        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Max Discharge Rate
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={battery.max_discharge_kwh_per_hour}
              onChange={(e) => updateField('max_discharge_kwh_per_hour', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-slate-400 font-mono text-slate-900 font-semibold tabular-nums text-xs"
            />
            <span className="ml-1.5 text-[10px] text-slate-400 font-mono">kW</span>
          </div>
        </div>

        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            End-of-Day Neutrality
          </span>
          <div className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center justify-between">
            <span>E₂₃ = E₀</span>
            <span>Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
