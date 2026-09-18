import React from 'react';
import type { HourlyPlanEntry } from '../types/energy';

interface HourlyPlanTableProps {
  hourlyPlan: HourlyPlanEntry[];
}

export const HourlyPlanTable: React.FC<HourlyPlanTableProps> = ({ hourlyPlan }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            24-Hour Dispatch Plan
          </h2>
          <p className="text-xs text-slate-500 font-medium">Optimal hourly energy distribution</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Hour</th>
              <th className="py-2.5 px-3 text-blue-700">Grid (kWh)</th>
              <th className="py-2.5 px-3 text-amber-700">Solar Used (kWh)</th>
              <th className="py-2.5 px-3 text-center">Battery Action</th>
              <th className="py-2.5 px-3 text-right">Battery kWh</th>
              <th className="py-2.5 px-3 text-right text-emerald-700">Battery After (kWh)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {hourlyPlan.map((p) => {
              let actionBadge = 'bg-slate-100 text-slate-600';
              if (p.battery_action === 'charge') actionBadge = 'bg-emerald-100 text-emerald-800';
              if (p.battery_action === 'discharge') actionBadge = 'bg-purple-100 text-purple-800';

              return (
                <tr key={p.hour} className="hover:bg-slate-50/70 transition">
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {String(p.hour).padStart(2, '0')}:00
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800">{p.grid_kwh.toFixed(1)}</td>
                  <td className="py-2 px-3 font-medium text-slate-800">{p.solar_used_kwh.toFixed(1)}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${actionBadge}`}>
                      {p.battery_action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    {p.battery_action === 'idle' ? '0.0' : p.battery_kwh.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-800">
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
