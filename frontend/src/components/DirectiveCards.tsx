import React from 'react';
import type { DirectiveInterpretation, DirectiveType } from '../types/energy';
import { ShieldAlert, Sun, BatteryMedium, Ban, Gauge, HelpCircle } from 'lucide-react';

interface DirectiveCardsProps {
  directives: DirectiveInterpretation[];
}

const TYPE_CONFIG: Record<
  DirectiveType,
  { label: string; icon: React.FC<any>; bg: string; text: string; border: string }
> = {
  solar_reduction: {
    label: 'Solar Reduction',
    icon: Sun,
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  minimum_battery_reserve: {
    label: 'Minimum Battery Reserve',
    icon: BatteryMedium,
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  no_charge_window: {
    label: 'Charging Disabled',
    icon: Ban,
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
  },
  no_discharge_window: {
    label: 'Discharging Disabled',
    icon: Ban,
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  max_grid_window: {
    label: 'Grid Import Limit',
    icon: Gauge,
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  no_op: {
    label: 'No Schedule Impact',
    icon: HelpCircle,
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
};

export const DirectiveCards: React.FC<DirectiveCardsProps> = ({ directives }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Operator Directive Interpretation
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">LLM Guardrail Enforced</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {directives.map((d) => {
          const config = TYPE_CONFIG[d.directive_type] || TYPE_CONFIG.no_op;
          const Icon = config.icon;

          const hours = d.structured_adjustment?.hours;
          const timeRange =
            hours && hours.length > 0
              ? `${String(hours[0]).padStart(2, '0')}:00 → ${String(hours[hours.length - 1] + 1).padStart(2, '0')}:00`
              : null;

          return (
            <div
              key={d.note_index}
              className={`p-4 rounded-xl border ${config.border} ${config.bg} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Note #{d.note_index}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      d.applies ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {d.applies ? 'Applies: Yes' : 'Applies: No'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className={`w-4 h-4 ${config.text}`} />
                  <span className={`text-xs font-bold ${config.text}`}>{config.label}</span>
                </div>

                <p className="text-xs text-slate-700 mb-3">{d.explanation}</p>
              </div>

              {d.structured_adjustment && (
                <div className="pt-2 border-t border-slate-200/60 font-mono text-[11px] text-slate-600 space-y-1">
                  {timeRange && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Window:</span>
                      <span className="font-semibold text-slate-800">{timeRange}</span>
                    </div>
                  )}
                  {d.structured_adjustment.factor !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Remaining Factor:</span>
                      <span className="font-semibold text-amber-700">
                        {d.structured_adjustment.factor} ({Math.round(d.structured_adjustment.factor * 100)}% solar)
                      </span>
                    </div>
                  )}
                  {d.structured_adjustment.minimum_energy_kwh !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Required Reserve:</span>
                      <span className="font-semibold text-indigo-700">
                        {d.structured_adjustment.minimum_energy_kwh} kWh
                      </span>
                    </div>
                  )}
                  {d.structured_adjustment.max_grid_kwh !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Grid Cap:</span>
                      <span className="font-semibold text-blue-700">
                        {d.structured_adjustment.max_grid_kwh} kWh
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
