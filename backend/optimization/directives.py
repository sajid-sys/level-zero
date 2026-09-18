from typing import List, Dict, Any, Optional
from backend.schemas import DirectiveInterpretation, BatteryInput


class CompiledDirectives:
    def __init__(self, battery: BatteryInput):
        # For each of the 24 hours:
        self.solar_factor: List[float] = [1.0] * 24
        self.min_energy_reserve: List[float] = [battery.minimum_energy_kwh] * 24
        self.allow_charge: List[bool] = [True] * 24
        self.allow_discharge: List[bool] = [True] * 24
        self.max_grid_kwh: List[Optional[float]] = [None] * 24


def compile_directives(directives: List[DirectiveInterpretation], battery: BatteryInput) -> CompiledDirectives:
    """
    Translates validated directive interpretations into hour-by-hour operational limits.
    Safely merges overlapping directives (e.g. strictest limits take precedence).
    """
    compiled = CompiledDirectives(battery)

    for d in directives:
        if not d.applies or not d.structured_adjustment:
            continue

        hours = d.structured_adjustment.get("hours", [])
        dtype = d.directive_type

        if dtype == "solar_reduction":
            factor = d.structured_adjustment.get("factor", 1.0)
            for h in hours:
                if 0 <= h < 24:
                    compiled.solar_factor[h] = min(compiled.solar_factor[h], factor)

        elif dtype == "minimum_battery_reserve":
            reserve = d.structured_adjustment.get("minimum_energy_kwh", battery.minimum_energy_kwh)
            for h in hours:
                if 0 <= h < 24:
                    compiled.min_energy_reserve[h] = max(compiled.min_energy_reserve[h], reserve)

        elif dtype == "no_charge_window":
            for h in hours:
                if 0 <= h < 24:
                    compiled.allow_charge[h] = False

        elif dtype == "no_discharge_window":
            for h in hours:
                if 0 <= h < 24:
                    compiled.allow_discharge[h] = False

        elif dtype == "max_grid_window":
            grid_cap = d.structured_adjustment.get("max_grid_kwh")
            if grid_cap is not None:
                for h in hours:
                    if 0 <= h < 24:
                        if compiled.max_grid_kwh[h] is None:
                            compiled.max_grid_kwh[h] = grid_cap
                        else:
                            compiled.max_grid_kwh[h] = min(compiled.max_grid_kwh[h], grid_cap)

    return compiled
