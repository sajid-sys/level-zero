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
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Optimized Dispatch Balance
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Solar Direct Consumption, Battery Discharge & Grid Import</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis
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
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area
              type="monotone"
              dataKey="grid"
              name="Grid Import"
              fill="#eef2ff"
              stroke="#4f46e5"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="solarUsed"
              name="Solar Utilized"
              fill="#fef3c7"
              stroke="#d97706"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="batteryDischarge"
              name="Battery Discharge"
              fill="#d1fae5"
              stroke="#059669"
              strokeWidth={1.5}
            />
            <Line
              type="monotone"
              dataKey="demand"
              name="Campus Demand"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
