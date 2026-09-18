import React from 'react';
import type { HourlyPlanEntry } from '../types/energy';

interface HourlyPlanTableProps {
  hourlyPlan: HourlyPlanEntry[];
}

export const HourlyPlanTable: React.FC<HourlyPlanTableProps> = ({ hourlyPlan }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            24-Hour Dispatch Plan Matrix
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Optimal hourly generation, import, and storage trajectory</p>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          24 Hourly Vectors
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3">Hour</th>
              <th className="py-2.5 px-3 text-right text-indigo-700">Grid Import (kWh)</th>
              <th className="py-2.5 px-3 text-right text-amber-700">Solar Used (kWh)</th>
              <th className="py-2.5 px-3 text-center">Battery Mode</th>
              <th className="py-2.5 px-3 text-right">Battery Power (kW)</th>
              <th className="py-2.5 px-3 text-right text-emerald-700">Storage E_t (kWh)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            {hourlyPlan.map((p) => {
              let actionBadge = 'bg-slate-100 text-slate-600 border-slate-200';
              if (p.battery_action === 'charge') actionBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              if (p.battery_action === 'discharge') actionBadge = 'bg-indigo-50 text-indigo-800 border-indigo-200';

              return (
                <tr key={p.hour} className="hover:bg-slate-50/80 transition">
                  <td className="py-2 px-3 font-bold text-slate-900">
                    {String(p.hour).padStart(2, '0')}:00
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-indigo-950 tabular-nums">
                    {p.grid_kwh.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-amber-950 tabular-nums">
                    {p.solar_used_kwh.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${actionBadge}`}>
                      {p.battery_action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-800 tabular-nums">
                    {p.battery_action === 'idle' ? '0.0' : p.battery_kwh.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-800 tabular-nums">
                    {p.battery_energy_after_kwh.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
