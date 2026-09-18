from backend.schemas import HourInput, BatteryInput
from backend.optimization.optimizer import optimize_energy_schedule
from backend.optimization.replay_validator import replay_and_validate_plan

def test_optimizer_baseline(sample_cases):
    case = sample_cases[0]["input"]
    hours = [HourInput(**h) for h in case["hours"]]
    battery = BatteryInput(**case["battery"])
    directives = []

    plan, total_grid, total_cost, peak_grid, summary = optimize_energy_schedule(hours, battery, directives)

    assert len(plan) == 24
    assert total_grid > 0
    assert total_cost > 0
    assert peak_grid > 0

    # Test replay validation succeeds
    replay_and_validate_plan(hours, battery, directives, plan, total_grid, total_cost, peak_grid)
