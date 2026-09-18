import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
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
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Battery State-of-Charge (SoC) Trajectory
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Stored Energy (E_t) across 24 Hours with Neutrality Target</p>
        </div>
        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
          E₂₃ = {chartData[23]?.energy || 0} kWh (E₀ = {battery.initial_energy_kwh})
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis
              domain={[0, battery.capacity_kwh * 1.05]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
              }}
            />
            <ReferenceLine
              y={battery.capacity_kwh}
              label={{ value: `Max Capacity (${battery.capacity_kwh} kWh)`, fill: '#64748b', fontSize: 10 }}
              stroke="#94a3b8"
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={battery.minimum_energy_kwh}
              label={{ value: `Reserve Floor (${battery.minimum_energy_kwh} kWh)`, fill: '#e11d48', fontSize: 10 }}
              stroke="#f43f5e"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="energy"
              name="Stored Energy (kWh)"
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#059669' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
