import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import type { HourlyPlanEntry, BatteryConfig } from '../types/energy';

interface BatterySocChartProps {
  hourlyPlan: HourlyPlanEntry[];
  battery: BatteryConfig;
}

export const BatterySocChart: React.FC<BatterySocChartProps> = ({ hourlyPlan, battery }) => {
  const chartData = hourlyPlan.map((p) => ({
    hour: `${p.hour}:00`,
    energy: p.battery_energy_after_kwh,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Battery State of Charge Trajectory
          </h2>
          <p className="text-xs text-slate-500 font-medium">Stored Energy across 24 Hours</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              domain={[0, battery.capacity_kwh * 1.05]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <ReferenceLine
              y={battery.capacity_kwh}
              label={{ value: `Max Capacity (${battery.capacity_kwh} kWh)`, fill: '#94a3b8', fontSize: 10 }}
              stroke="#94a3b8"
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={battery.minimum_energy_kwh}
              label={{ value: `Base Reserve (${battery.minimum_energy_kwh} kWh)`, fill: '#f43f5e', fontSize: 10 }}
              stroke="#f43f5e"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="energy"
              name="Battery Stored Energy (kWh)"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 3, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
