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
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <Table className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            24-Hour Diurnal Energy Profile
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          24 Hourly Intervals (00:00 – 23:00)
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3">Hour</th>
              <th className="py-2.5 px-3">Window</th>
              <th className="py-2.5 px-3 text-right">Demand (kWh)</th>
              <th className="py-2.5 px-3 text-right text-amber-700">Solar (kWh)</th>
              <th className="py-2.5 px-3 text-right text-indigo-700">Tariff (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            {displayedHours.map((row) => (
              <tr key={row.hour} className="hover:bg-slate-50/80 transition">
                <td className="py-1.5 px-3 font-bold text-slate-900">{row.hour}</td>
                <td className="py-1.5 px-3 text-slate-500 font-sans text-[11px]">
                  {String(row.hour).padStart(2, '0')}:00 – {String((row.hour + 1) % 24).padStart(2, '0')}:00
                </td>
                <td className="py-1.5 px-3 text-right">
                  <input
                    type="number"
                    step="0.1"
                    value={row.demand_kwh}
                    onChange={(e) => handleRowChange(row.hour, 'demand_kwh', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-slate-400 text-right font-mono tabular-nums font-medium text-slate-800"
                  />
                </td>
                <td className="py-1.5 px-3 text-right">
                  <input
                    type="number"
                    step="0.1"
                    value={row.solar_kwh}
                    onChange={(e) => handleRowChange(row.hour, 'solar_kwh', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-amber-50/50 border border-amber-200 rounded focus:bg-white focus:ring-1 focus:ring-amber-500 text-right font-mono tabular-nums font-bold text-amber-900"
                  />
                </td>
                <td className="py-1.5 px-3 text-right">
                  <input
                    type="number"
                    step="0.1"
                    value={row.tariff_bdt_per_kwh}
                    onChange={(e) => handleRowChange(row.hour, 'tariff_bdt_per_kwh', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-indigo-50/50 border border-indigo-200 rounded focus:bg-white focus:ring-1 focus:ring-indigo-500 text-right font-mono tabular-nums font-semibold text-indigo-900"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3.5 text-center pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Collapse to First 8 Hours
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Expand Full 24 Hours ({hours.length} intervals)
            </>
          )}
        </button>
      </div>
    </div>
  );
};
