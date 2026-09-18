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
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Battery className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Battery Configuration
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Initial SoC: {socPercentage}%</span>
        </div>
      </div>

      {/* Visual Battery Bar */}
      <div className="mt-4 mb-4">
        <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200 relative overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, socPercentage))}%` }}
          />
          {/* Base reserve marker */}
          <div
            className="absolute top-0 bottom-0 border-r-2 border-dashed border-amber-500"
            style={{ left: `${minSocPercentage}%` }}
            title={`Min Reserve: ${battery.minimum_energy_kwh} kWh (${minSocPercentage}%)`}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>Min Reserve ({battery.minimum_energy_kwh} kWh)</span>
          <span>Capacity ({battery.capacity_kwh} kWh)</span>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-600 font-medium mb-1">Capacity (kWh)</label>
          <input
            type="number"
            value={battery.capacity_kwh}
            onChange={(e) => updateField('capacity_kwh', parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1">Initial Energy (kWh)</label>
          <input
            type="number"
            value={battery.initial_energy_kwh}
            onChange={(e) => updateField('initial_energy_kwh', parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1">Min Reserve (kWh)</label>
          <input
            type="number"
            value={battery.minimum_energy_kwh}
            onChange={(e) => updateField('minimum_energy_kwh', parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1">Max Charge (kWh/h)</label>
          <input
            type="number"
            value={battery.max_charge_kwh_per_hour}
            onChange={(e) => updateField('max_charge_kwh_per_hour', parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1">Max Discharge (kWh/h)</label>
          <input
            type="number"
            value={battery.max_discharge_kwh_per_hour}
            onChange={(e) => updateField('max_discharge_kwh_per_hour', parseFloat(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
          />
        </div>
      </div>
    </div>
  );
};
