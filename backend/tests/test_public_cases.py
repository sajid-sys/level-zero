import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_all_10_public_sample_cases(sample_cases):
    for case_data in sample_cases:
        case_id = case_data["id"]
        expected_types = case_data["expected_directive_types"]
        payload = case_data["input"]

        response = client.post("/optimize-energy", json=payload)
        assert response.status_code == 200, f"Case {case_id} failed with code {response.status_code}: {response.text}"

        data = response.json()
        assert data["scenario_id"] == case_id
        assert len(data["hourly_plan"]) == 24
        assert len(data["directive_interpretation"]) == len(payload["operator_notes"])

        actual_types = [d["directive_type"] for d in data["directive_interpretation"]]
        assert actual_types == expected_types, f"Case {case_id} expected {expected_types}, got {actual_types}"

        # Verify no negative values
        assert data["total_grid_kwh"] >= 0
        assert data["total_cost_bdt"] >= 0
        assert data["peak_grid_kwh"] >= 0

        # Check end of day battery neutrality
        initial_e = payload["battery"]["initial_energy_kwh"]
        final_e = data["hourly_plan"][23]["battery_energy_after_kwh"]
        assert abs(final_e - initial_e) < 0.05, f"Case {case_id} violated neutrality: initial={initial_e}, final={final_e}"
