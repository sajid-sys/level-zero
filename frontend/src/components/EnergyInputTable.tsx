import React, { useState } from 'react';
import { Table, ChevronDown, ChevronUp } from 'lucide-react';
import type { HourInput } from '../types/energy';

interface EnergyInputTableProps {
  hours: HourInput[];
  onChange: (hours: HourInput[]) => void;
}

export const EnergyInputTable: React.FC<EnergyInputTableProps> = ({ hours, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRowChange = (hourIndex: number, field: keyof HourInput, val: number) => {
    const updated = [...hours];
    updated[hourIndex] = {
      ...updated[hourIndex],
      [field]: Math.max(0, val),
    };
    onChange(updated);
  };

  const displayedHours = isExpanded ? hours : hours.slice(0, 8);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Table className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            24-Hour Energy Profile
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">Exactly 24 Sequential Hours</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Hour</th>
              <th className="py-2.5 px-3">Time Window</th>
              <th className="py-2.5 px-3 text-emerald-700">Demand (kWh)</th>
              <th className="py-2.5 px-3 text-amber-700">Solar Forecast (kWh)</th>
              <th className="py-2.5 px-3 text-blue-700">Tariff (BDT/kWh)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {displayedHours.map((row) => (
              <tr key={row.hour} className="hover:bg-slate-50/70 transition">
                <td className="py-1.5 px-3 font-semibold text-slate-900">{row.hour}</td>
                <td className="py-1.5 px-3 text-slate-500 font-sans">
                  {String(row.hour).padStart(2, '0')}:00 – {String((row.hour + 1) % 24).padStart(2, '0')}:00
                </td>
                <td className="py-1.5 px-3">
                  <input
                    type="number"
                    step="0.1"
                    value={row.demand_kwh}
                    onChange={(e) => handleRowChange(row.hour, 'demand_kwh', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-emerald-500 text-right"
                  />
                </td>
                <td className="py-1.5 px-3">
                  <input
                    type="number"
                    step="0.1"
                    value={row.solar_kwh}
                    onChange={(e) => handleRowChange(row.hour, 'solar_kwh', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-amber-500 text-right"
                  />
                </td>
                <td className="py-1.5 px-3">
                  <input
                    type="number"
                    step="0.1"
                    value={row.tariff_bdt_per_kwh}
                    onChange={(e) => handleRowChange(row.hour, 'tariff_bdt_per_kwh', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 text-right"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Collapse 24-Hour Table
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              View All 24 Hours ({hours.length} entries)
            </>
          )}
        </button>
      </div>
    </div>
  );
};
