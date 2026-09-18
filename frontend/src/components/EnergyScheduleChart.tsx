import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import type { HourlyPlanEntry, HourInput } from '../types/energy';

interface EnergyScheduleChartProps {
  hourlyPlan: HourlyPlanEntry[];
  hours: HourInput[];
}

export const EnergyScheduleChart: React.FC<EnergyScheduleChartProps> = ({ hourlyPlan, hours }) => {
  const chartData = hourlyPlan.map((p, idx) => ({
    hour: `${p.hour}:00`,
    demand: hours[idx]?.demand_kwh || 0,
    grid: p.grid_kwh,
    solarUsed: p.solar_used_kwh,
    batteryCharge: p.battery_action === 'charge' ? p.battery_kwh : 0,
    batteryDischarge: p.battery_action === 'discharge' ? p.battery_kwh : 0,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Optimized Energy Flow Schedule
          </h2>
          <p className="text-xs text-slate-500 font-medium">Grid Import, Solar Utilization & Battery Dynamics</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Area
              type="monotone"
              dataKey="grid"
              name="Grid Import (kWh)"
              fill="#bfdbfe"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="solarUsed"
              name="Solar Used (kWh)"
              fill="#fef08a"
              stroke="#eab308"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="demand"
              name="Campus Demand (kWh)"
              stroke="#ef4444"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="step"
              dataKey="batteryDischarge"
              name="Battery Discharge (kWh)"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
