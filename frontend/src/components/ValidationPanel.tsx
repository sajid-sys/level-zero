import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import type { OptimizeEnergyResponse, HourInput, BatteryConfig } from '../types/energy';

interface ValidationPanelProps {
  response: OptimizeEnergyResponse;
  hours: HourInput[];
  battery: BatteryConfig;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ response, hours, battery }) => {
  const plan = response.hourly_plan;

  // 1. Exactly 24 unique hours
  const has24Hours = plan.length === 24 && plan.every((p, idx) => p.hour === idx);

  // 2. Sum grid matches total_grid_kwh
  const sumGrid = plan.reduce((acc, p) => acc + p.grid_kwh, 0);
  const gridMatch = Math.abs(sumGrid - response.total_grid_kwh) < 0.05;

  // 3. Total cost matches sum(grid * tariff)
  const sumCost = plan.reduce((acc, p, idx) => acc + p.grid_kwh * (hours[idx]?.tariff_bdt_per_kwh || 0), 0);
  const costMatch = Math.abs(sumCost - response.total_cost_bdt) < 0.05;

  // 4. Peak grid matches maximum hourly grid
  const maxGrid = Math.max(...plan.map((p) => p.grid_kwh));
  const peakMatch = Math.abs(maxGrid - response.peak_grid_kwh) < 0.05;

  // 5. Battery neutrality: final equals initial
  const finalEnergy = plan.length > 0 ? plan[23].battery_energy_after_kwh : 0;
  const neutralityMatch = Math.abs(finalEnergy - battery.initial_energy_kwh) < 0.05;

  // 6. Non-negativity check
  const nonNegative = plan.every(
    (p) => p.grid_kwh >= 0 && p.solar_used_kwh >= 0 && p.battery_kwh >= 0 && p.battery_energy_after_kwh >= 0
  );

  const checks = [
    { label: '24 Sequential Hours Present', pass: has24Hours, detail: `${plan.length}/24 hours` },
    { label: 'Total Grid Import Match', pass: gridMatch, detail: `Reported: ${response.total_grid_kwh}, Sum: ${sumGrid.toFixed(1)}` },
    { label: 'Total Cost Match (BDT)', pass: costMatch, detail: `Reported: ৳${response.total_cost_bdt}, Sum: ৳${sumCost.toFixed(1)}` },
    { label: 'Peak Grid Draw Match', pass: peakMatch, detail: `Reported: ${response.peak_grid_kwh}, Max: ${maxGrid.toFixed(1)}` },
    { label: 'End-of-Day Neutrality', pass: neutralityMatch, detail: `Initial: ${battery.initial_energy_kwh} kWh, Final: ${finalEnergy} kWh` },
    { label: 'Non-Negative Physical Values', pass: nonNegative, detail: 'Zero negative values detected' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Client-Side Independent Verification
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">Zero-Trust Solution Checks</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {checks.map((c, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border flex items-start space-x-2.5 ${
              c.pass ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
            }`}
          >
            {c.pass ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800">{c.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    c.pass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                  }`}
                >
                  {c.pass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
