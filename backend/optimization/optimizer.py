import numpy as np
from scipy.optimize import linprog
from typing import List, Tuple
from backend.schemas import HourInput, BatteryInput, HourlyPlanEntry, DirectiveInterpretation
from backend.optimization.directives import compile_directives, CompiledDirectives


class OptimizationError(Exception):
    pass


def optimize_energy_schedule(
    hours: List[HourInput],
    battery: BatteryInput,
    directives: List[DirectiveInterpretation]
) -> Tuple[List[HourlyPlanEntry], float, float, float, str]:
    """
    Formulates and solves the cost-minimization Linear Program using SciPy HiGHS.
    Variables for each hour h in 0..23:
      0..23:  grid[h] >= 0
      24..47: solar_used[h] >= 0
      48..71: battery_flow[h] (signed: >0 charge, <0 discharge)

    Total variables: 72
    """
    compiled = compile_directives(directives, battery)

    # 1. Objective function: Minimize sum(grid[h] * tariff[h])
    c = np.zeros(72)
    for h in range(24):
        c[h] = hours[h].tariff_bdt_per_kwh

    # 2. Equality constraints: A_eq * x = b_eq
    # - 24 energy balance equations: grid[h] + solar_used[h] - battery_flow[h] = demand[h]
    # - 1 battery neutrality equation: sum(battery_flow[0..23]) = 0 (E_after[23] = initial_energy)
    A_eq = np.zeros((25, 72))
    b_eq = np.zeros(25)

    for h in range(24):
        A_eq[h, h] = 1.0       # grid[h]
        A_eq[h, 24 + h] = 1.0  # solar_used[h]
        A_eq[h, 48 + h] = -1.0 # - battery_flow[h]
        b_eq[h] = hours[h].demand_kwh

    # Battery neutrality: sum_{i=0..23} battery_flow[i] = 0
    for h in range(24):
        A_eq[24, 48 + h] = 1.0
    b_eq[24] = 0.0

    # 3. Inequality constraints: A_ub * x <= b_ub
    # E_after[h] = initial_energy + sum_{i=0..h} battery_flow[i]
    # (a) E_after[h] <= capacity_kwh  ==>  sum_{i=0..h} battery_flow[i] <= capacity - initial
    # (b) E_after[h] >= min_energy[h] ==> -sum_{i=0..h} battery_flow[i] <= initial - min_energy[h]
    # (c) Grid caps: grid[h] <= max_grid_kwh[h] (if present)
    ineq_rows = []
    b_ub_list = []

    # Capacity constraints (24 rows)
    for h in range(24):
        row = np.zeros(72)
        for i in range(h + 1):
            row[48 + i] = 1.0
        ineq_rows.append(row)
        b_ub_list.append(battery.capacity_kwh - battery.initial_energy_kwh)

    # Minimum reserve constraints (24 rows)
    for h in range(24):
        row = np.zeros(72)
        for i in range(h + 1):
            row[48 + i] = -1.0
        ineq_rows.append(row)
        b_ub_list.append(battery.initial_energy_kwh - compiled.min_energy_reserve[h])

    # Grid caps (up to 24 rows)
    for h in range(24):
        if compiled.max_grid_kwh[h] is not None:
            row = np.zeros(72)
            row[h] = 1.0
            ineq_rows.append(row)
            b_ub_list.append(compiled.max_grid_kwh[h])

    A_ub = np.array(ineq_rows)
    b_ub = np.array(b_ub_list)

    # 4. Variable bounds
    bounds = []
    # Grid bounds: 0 <= grid[h] <= inf
    for h in range(24):
        bounds.append((0.0, None))

    # Solar used bounds: 0 <= solar_used[h] <= effective_solar[h]
    for h in range(24):
        effective_solar = hours[h].solar_kwh * compiled.solar_factor[h]
        bounds.append((0.0, max(0.0, effective_solar)))

    # Battery flow bounds: [-max_discharge, +max_charge]
    for h in range(24):
        lb = -battery.max_discharge_kwh_per_hour if compiled.allow_discharge[h] else 0.0
        ub = battery.max_charge_kwh_per_hour if compiled.allow_charge[h] else 0.0
        bounds.append((lb, ub))

    # 5. Solve LP with HiGHS
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method="highs")

    if not res.success:
        raise OptimizationError(f"Linear program failed to find optimal schedule: {res.message}")

    x = res.x
    grid_sol = x[0:24]
    solar_sol = x[24:48]
    flow_sol = x[48:72]

    # Build hourly plan
    hourly_plan: List[HourlyPlanEntry] = []
    current_energy = battery.initial_energy_kwh

    for h in range(24):
        flow = flow_sol[h]
        current_energy += flow
        
        # Clean rounding to avoid -0.0
        g = max(0.0, round(float(grid_sol[h]), 4))
        s = max(0.0, round(float(solar_sol[h]), 4))
        
        if flow > 1e-5:
            action = "charge"
            kwh = round(float(flow), 4)
        elif flow < -1e-5:
            action = "discharge"
            kwh = round(float(-flow), 4)
        else:
            action = "idle"
            kwh = 0.0

        hourly_plan.append(
            HourlyPlanEntry(
                hour=h,
                grid_kwh=g,
                solar_used_kwh=s,
                battery_action=action,
                battery_kwh=kwh,
                battery_energy_after_kwh=round(float(current_energy), 4)
            )
        )

    total_grid_kwh = round(float(sum(e.grid_kwh for e in hourly_plan)), 4)
    total_cost_bdt = round(float(sum(e.grid_kwh * hours[e.hour].tariff_bdt_per_kwh for e in hourly_plan)), 4)
    peak_grid_kwh = round(float(max(e.grid_kwh for e in hourly_plan)), 4)

    # Strategy summary
    active_directives = [d.directive_type for d in directives if d.applies]
    summary_parts = [
        f"Cost-optimal 24-hour schedule generated using Linear Programming.",
        f"Total grid import: {total_grid_kwh} kWh across 24 hours at total cost of ৳{total_cost_bdt:,.2f}.",
        f"Peak grid demand: {peak_grid_kwh} kWh."
    ]
    if active_directives:
        summary_parts.append(f"Successfully satisfied {len(active_directives)} operational directives: {', '.join(set(active_directives))}.")
    else:
        summary_parts.append("Operated under standard baseline parameters with zero active restrictions.")

    plan_summary = " ".join(summary_parts)

    return hourly_plan, total_grid_kwh, total_cost_bdt, peak_grid_kwh, plan_summary
