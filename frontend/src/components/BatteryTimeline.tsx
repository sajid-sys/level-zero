import React from 'react';
import type { HourlyPlanEntry } from '../types/energy';

interface BatteryTimelineProps {
  hourlyPlan: HourlyPlanEntry[];
}

export const BatteryTimeline: React.FC<BatteryTimelineProps> = ({ hourlyPlan }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            24-Hour Battery Dispatch Heatstrip
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Hourly Charge (kW in) & Discharge (kW out) Activity</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono font-medium">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Charge
          </span>
          <span className="flex items-center gap-1 text-indigo-700">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" /> Discharge
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-200" /> Idle
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1 text-center font-mono">
        {hourlyPlan.map((entry) => {
          let bg = 'bg-slate-50/80 text-slate-400 border-slate-200';
          if (entry.battery_action === 'charge') {
            bg = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
          } else if (entry.battery_action === 'discharge') {
            bg = 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold';
          }

          return (
            <div
              key={entry.hour}
              className={`p-1.5 rounded-md border text-[11px] flex flex-col justify-between min-h-[50px] transition ${bg}`}
              title={`Hour ${entry.hour}: ${entry.battery_action.toUpperCase()} ${entry.battery_kwh} kWh`}
            >
              <span className="text-[9px] text-slate-400 font-sans">h{entry.hour}</span>
              <span className="truncate tabular-nums">
                {entry.battery_action === 'idle' ? '—' : `${entry.battery_kwh}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
