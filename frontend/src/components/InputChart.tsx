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
import type { HourInput } from '../types/energy';

interface InputChartProps {
  hours: HourInput[];
}

export const InputChart: React.FC<InputChartProps> = ({ hours }) => {
  const chartData = hours.map((h) => ({
    hour: `${h.hour}:00`,
    demand: h.demand_kwh,
    solar: h.solar_kwh,
    tariff: h.tariff_bdt_per_kwh,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Input Forecast Overview
        </h2>
        <span className="text-xs text-slate-400">Demand, Solar & Time-of-Use Tariff</span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Tariff (৳/kWh)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="demand"
              name="Campus Demand (kWh)"
              fill="#e0e7ff"
              stroke="#6366f1"
              strokeWidth={2}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="solar"
              name="Solar Forecast (kWh)"
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="stepAfter"
              dataKey="tariff"
              name="Tariff (BDT/kWh)"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
