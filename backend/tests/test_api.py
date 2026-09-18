from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

def test_optimize_energy_invalid_hours_count(sample_cases):
    case = sample_cases[0]["input"].copy()
    case["hours"] = case["hours"][:23]  # Only 23 hours
    res = client.post("/optimize-energy", json=case)
    assert res.status_code in (400, 422)

def test_optimize_energy_negative_demand(sample_cases):
    case = sample_cases[0]["input"].copy()
    case["hours"][0]["demand_kwh"] = -10.0
    res = client.post("/optimize-energy", json=case)
    assert res.status_code in (400, 422)

def test_optimize_energy_battery_initial_below_min(sample_cases):
    case = sample_cases[0]["input"].copy()
    case["battery"]["initial_energy_kwh"] = 20.0
    case["battery"]["minimum_energy_kwh"] = 50.0  # initial < minimum
    res = client.post("/optimize-energy", json=case)
    assert res.status_code in (400, 422)

def test_optimize_energy_empty_notes(sample_cases):
    case = sample_cases[0]["input"].copy()
    case["operator_notes"] = []
    res = client.post("/optimize-energy", json=case)
    assert res.status_code in (400, 422)

def test_optimize_energy_too_many_notes(sample_cases):
    case = sample_cases[0]["input"].copy()
    case["operator_notes"] = ["Note 1", "Note 2", "Note 3", "Note 4"]
    res = client.post("/optimize-energy", json=case)
    assert res.status_code in (400, 422)
