import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
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
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Diurnal Profile & Tariff Forecast
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Solar Generation vs Campus Demand & Time-of-Use Rate</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-amber-500" /> Solar
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-slate-800" /> Demand
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-sky-500" /> Tariff
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              label={{ value: 'Tariff (৳/kWh)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }}
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
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="solar"
              name="Solar Forecast (kWh)"
              fill="#fef3c7"
              stroke="#d97706"
              strokeWidth={1.5}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="demand"
              name="Campus Demand (kWh)"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="stepAfter"
              dataKey="tariff"
              name="Tariff (BDT/kWh)"
              stroke="#0ea5e9"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
