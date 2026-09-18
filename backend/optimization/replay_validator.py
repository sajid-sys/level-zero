import math
from typing import List
from backend.schemas import HourInput, BatteryInput, HourlyPlanEntry, DirectiveInterpretation
from backend.optimization.directives import compile_directives


class ReplayValidationError(Exception):
    pass


def replay_and_validate_plan(
    hours: List[HourInput],
    battery: BatteryInput,
    directives: List[DirectiveInterpretation],
    hourly_plan: List[HourlyPlanEntry],
    reported_grid_kwh: float,
    reported_cost_bdt: float,
    reported_peak_grid_kwh: float,
    tol: float = 1e-3
) -> None:
    """
    Independently steps through all 24 hours and re-verifies:
      1. Energy balance at each hour
      2. Solar usage <= effective solar
      3. Battery charging / discharging limits and forbidden windows
      4. Battery SoC bounds and directive-specific reserves
      5. Grid import caps
      6. End-of-day battery neutrality
      7. Exact recalculation of total grid, total cost, and peak grid
    Rejects any plan that fails verification by raising ReplayValidationError.
    """
    if len(hourly_plan) != 24:
        raise ReplayValidationError(f"Expected 24 hourly plan entries, got {len(hourly_plan)}")

    compiled = compile_directives(directives, battery)
    current_energy = battery.initial_energy_kwh

    calc_grid_kwh = 0.0
    calc_cost_bdt = 0.0
    calc_peak_grid = 0.0

    for h in range(24):
        entry = hourly_plan[h]
        if entry.hour != h:
            raise ReplayValidationError(f"Hour mismatch at index {h}: expected {h}, got {entry.hour}")

        hour_data = hours[h]
        demand = hour_data.demand_kwh
        tariff = hour_data.tariff_bdt_per_kwh
        effective_solar = hour_data.solar_kwh * compiled.solar_factor[h]

        grid = entry.grid_kwh
        solar_used = entry.solar_used_kwh
        action = entry.battery_action
        battery_kwh = entry.battery_kwh
        energy_after = entry.battery_energy_after_kwh

        # 1. Non-negativity
        if grid < -tol or solar_used < -tol or battery_kwh < -tol or energy_after < -tol:
            raise ReplayValidationError(f"Hour {h}: negative physical quantities detected")

        # 2. Solar usage constraint
        if solar_used > effective_solar + tol:
            raise ReplayValidationError(
                f"Hour {h}: solar used ({solar_used}) exceeds effective solar ({effective_solar})"
            )

        # 3. Grid caps
        if compiled.max_grid_kwh[h] is not None:
            if grid > compiled.max_grid_kwh[h] + tol:
                raise ReplayValidationError(
                    f"Hour {h}: grid import ({grid}) exceeds cap ({compiled.max_grid_kwh[h]})"
                )

        # 4. Battery flow and actions
        if action == "charge":
            if not compiled.allow_charge[h]:
                raise ReplayValidationError(f"Hour {h}: charging occurred during no-charge window")
            if battery_kwh > battery.max_charge_kwh_per_hour + tol:
                raise ReplayValidationError(f"Hour {h}: charge rate ({battery_kwh}) exceeds max rate")
            flow = battery_kwh
        elif action == "discharge":
            if not compiled.allow_discharge[h]:
                raise ReplayValidationError(f"Hour {h}: discharging occurred during no-discharge window")
            if battery_kwh > battery.max_discharge_kwh_per_hour + tol:
                raise ReplayValidationError(f"Hour {h}: discharge rate ({battery_kwh}) exceeds max rate")
            flow = -battery_kwh
        elif action == "idle":
            if battery_kwh > tol:
                raise ReplayValidationError(f"Hour {h}: idle battery reported non-zero kWh ({battery_kwh})")
            flow = 0.0
        else:
            raise ReplayValidationError(f"Hour {h}: unknown battery action '{action}'")

        # 5. Energy balance: grid + solar_used = demand + flow (where flow > 0 is charging)
        balance_diff = abs(grid + solar_used - (demand + flow))
        if balance_diff > tol:
            raise ReplayValidationError(
                f"Hour {h}: energy balance violation (diff={balance_diff:.6f}, grid={grid}, solar={solar_used}, demand={demand}, flow={flow})"
            )

        # 6. Battery transition
        current_energy += flow
        if abs(current_energy - energy_after) > tol:
            raise ReplayValidationError(
                f"Hour {h}: battery state mismatch (computed={current_energy}, reported={energy_after})"
            )

        # 7. Capacity & Reserves
        if energy_after > battery.capacity_kwh + tol:
            raise ReplayValidationError(
                f"Hour {h}: battery energy ({energy_after}) exceeds capacity ({battery.capacity_kwh})"
            )
        min_allowed = compiled.min_energy_reserve[h]
        if energy_after < min_allowed - tol:
            raise ReplayValidationError(
                f"Hour {h}: battery energy ({energy_after}) fell below reserve requirement ({min_allowed})"
            )

        calc_grid_kwh += grid
        calc_cost_bdt += grid * tariff
        if grid > calc_peak_grid:
            calc_peak_grid = grid

    # 8. End of day neutrality: energy_after[23] == initial_energy_kwh
    if abs(current_energy - battery.initial_energy_kwh) > tol:
        raise ReplayValidationError(
            f"End-of-day battery neutrality violated (start={battery.initial_energy_kwh}, end={current_energy})"
        )

    # 9. Consistency with reported totals
    if abs(calc_grid_kwh - reported_grid_kwh) > 0.05:
        raise ReplayValidationError(
            f"Total grid mismatch: computed {calc_grid_kwh}, reported {reported_grid_kwh}"
        )
    if abs(calc_cost_bdt - reported_cost_bdt) > 0.05:
        raise ReplayValidationError(
            f"Total cost mismatch: computed {calc_cost_bdt}, reported {reported_cost_bdt}"
        )
    if abs(calc_peak_grid - reported_peak_grid_kwh) > 0.05:
        raise ReplayValidationError(
            f"Peak grid mismatch: computed {calc_peak_grid}, reported {reported_peak_grid_kwh}"
        )
