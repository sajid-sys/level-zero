from backend.schemas import BatteryInput
from backend.guardrails.normalization import (
    parse_time_window,
    parse_solar_factor,
    parse_battery_reserve,
    parse_max_grid
)
from backend.guardrails.directive_validator import validate_and_sanitize_directives
from backend.llm.interpreter import heuristic_parse_note

battery = BatteryInput(
    capacity_kwh=300,
    initial_energy_kwh=120,
    minimum_energy_kwh=60,
    max_charge_kwh_per_hour=75,
    max_discharge_kwh_per_hour=75
)

def test_time_window_normalization():
    assert parse_time_window("between 11 AM and 2 PM") == [11, 12, 13]
    assert parse_time_window("from 13:00 to 15:00") == [13, 14]
    assert parse_time_window("between 18:00 and 22:00") == [18, 19, 20, 21]
    assert parse_time_window("from 2 AM to 5 AM") == [2, 3, 4]

def test_solar_factor_normalization():
    # 80% reduction means 20% remaining
    assert parse_solar_factor("80% reduction in solar") == 0.2
    assert parse_solar_factor("reduced by 50%") == 0.5
    assert parse_solar_factor("solar drop to 20% capacity") == 0.2
    assert parse_solar_factor("cut rooftop PV down to 25% capacity") == 0.25

def test_battery_reserve_normalization():
    assert parse_battery_reserve("maintain minimum battery energy of 180 kWh") == 180.0
    assert parse_battery_reserve("reserve at least 150 kWh") == 150.0

def test_grid_cap_normalization():
    assert parse_max_grid("grid import capped at 65 kWh") == 65.0
    assert parse_max_grid("maximum grid import of 60 kWh") == 60.0

def test_heuristic_no_op():
    res = heuristic_parse_note("Facility cafeteria renovation is on schedule.", 0, battery)
    assert res["applies"] is False
    assert res["directive_type"] == "no_op"
    assert res["structured_adjustment"] is None

def test_guardrail_sanitizes_invalid_hours():
    raw = [{
        "note_index": 0,
        "applies": True,
        "directive_type": "no_charge_window",
        "structured_adjustment": {"hours": [23, 24, 25]},  # Out of range
        "explanation": "test"
    }]
    validated = validate_and_sanitize_directives(raw, ["Do not charge late night."], battery)
    # Must fallback to no_op safely
    assert validated[0].applies is False
    assert validated[0].directive_type == "no_op"
    assert validated[0].structured_adjustment is None
