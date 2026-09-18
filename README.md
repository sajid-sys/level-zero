# GridWise – Smart Campus Energy Optimization System

An enterprise-grade microservice and interactive operations dashboard built for the **BUP CSE Fest 2026 Hackathon**. GridWise schedules 24-hour campus energy flow by translating unstructured human operator directives into formal linear programming constraints, minimizing grid electricity costs while safeguarding battery longevity, respecting time-of-use tariffs, and guaranteeing physical grid limits.

---

## Key Capabilities

1. **Deterministic Guardrails & LLM Interpretation**:
   - Single batched query interprets 1–3 operator notes simultaneously.
   - Extracts half-open intervals $[t_{\text{start}}, t_{\text{end}})$, solar reduction factors ($X\%$ reduction $\rightarrow 1 - X/100$), minimum reserves, and grid ceilings.
   - Deterministic rule-based offline fallback parser ensures 100% service uptime even under network or provider outages.
   - Enforces `no_op` rule (`applies: false`, `structured_adjustment: null`) for informational or irrelevant notes.

2. **Linear Programming Energy Optimizer**:
   - Formulated with SciPy HiGHS solver in $\mathcal{O}(\text{ms})$ runtime ($p95 < 0.25\text{s}$).
   - Enforces energy balance ($P_{\text{grid}} + P_{\text{solar}} - b_{\text{flow}} = P_{\text{demand}}$).
   - Strict end-of-day battery neutrality ($E_{\text{after}}[23] = E_{\text{initial}}$).
   - Dynamic rate limits and directive windows (no-charge, no-discharge, reserve buffers, grid caps).

3. **Independent Replay Validation Engine**:
   - Zero-trust architecture: every optimization plan is independently simulated across all 24 hours before returning HTTP 200.
   - Recalculates total grid, total cost (BDT), and peak grid import within $10^{-3}$ tolerance.
   - Rejects any plan violating physical constraints or directives.

4. **Interactive Campus Operations Dashboard**:
   - Modern React + TypeScript + Vite + Tailwind CSS + Recharts UI.
   - Preset selector for all 10 standard benchmark sample cases.
   - Visual battery SoC trajectory and energy flow charts.
   - Live client-side consistency verification panel and raw JSON inspector.

---

## Required API Endpoints

### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok"
}
```

### 2. Energy Optimization
```http
POST /optimize-energy
Content-Type: application/json
```
**Request Body:**
```json
{
  "scenario_id": "GRID-101",
  "operator_notes": [
    "Expect an 80% reduction in rooftop solar between 11 AM and 2 PM due to maintenance."
  ],
  "battery": {
    "capacity_kwh": 500,
    "initial_energy_kwh": 200,
    "minimum_energy_kwh": 50,
    "max_charge_kwh_per_hour": 100,
    "max_discharge_kwh_per_hour": 100
  },
  "hours": [
    {
      "hour": 0,
      "demand_kwh": 100.0,
      "solar_kwh": 0.0,
      "tariff_bdt_per_kwh": 7.0
    }
    // ... exactly 24 records, hours 0 to 23
  ]
}
```

**Response Body:**
```json
{
  "scenario_id": "GRID-101",
  "directive_interpretation": [
    {
      "note_index": 0,
      "applies": true,
      "directive_type": "solar_reduction",
      "structured_adjustment": {
        "hours": [11, 12, 13],
        "factor": 0.2
      },
      "explanation": "Solar generation reduced to 20% during hours 11:00 to 14:00."
    }
  ],
  "hourly_plan": [
    {
      "hour": 0,
      "grid_kwh": 100.0,
      "solar_used_kwh": 0.0,
      "battery_action": "idle",
      "battery_kwh": 0.0,
      "battery_energy_after_kwh": 200.0
    }
  ],
  "total_grid_kwh": 1250.0,
  "total_cost_bdt": 9850.0,
  "peak_grid_kwh": 115.0,
  "plan_summary": "Cost-optimal 24-hour schedule generated using Linear Programming..."
}
```

---

## Local Setup & Quickstart

### Backend

```bash
# 1. Clone repository and navigate to backend
git clone <repo-url>
cd gridwise

# 2. Set up Python virtual environment
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run automated test suite
python -m pytest backend/tests -v

# 5. Start API server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to explore the dashboard.

---

## Running with Docker

```bash
# Build and start container
docker-compose up --build -d

# Verify health
curl http://localhost:8000/health
```

---

## Automated Regression Tests

Run all 14 unit and regression tests including the 10 benchmark public sample cases:
```bash
python -m pytest backend/tests -v
```

Output:
```text
backend/tests/test_api.py::test_health PASSED
backend/tests/test_api.py::test_optimize_energy_invalid_hours_count PASSED
backend/tests/test_api.py::test_optimize_energy_negative_demand PASSED
backend/tests/test_api.py::test_optimize_energy_battery_initial_below_min PASSED
backend/tests/test_api.py::test_optimize_energy_empty_notes PASSED
backend/tests/test_api.py::test_optimize_energy_too_many_notes PASSED
backend/tests/test_guardrails.py::test_time_window_normalization PASSED
backend/tests/test_guardrails.py::test_solar_factor_normalization PASSED
backend/tests/test_guardrails.py::test_battery_reserve_normalization PASSED
backend/tests/test_guardrails.py::test_grid_cap_normalization PASSED
backend/tests/test_guardrails.py::test_heuristic_no_op PASSED
backend/tests/test_guardrails.py::test_guardrail_sanitizes_invalid_hours PASSED
backend/tests/test_optimizer.py::test_optimizer_baseline PASSED
backend/tests/test_public_cases.py::test_all_10_public_sample_cases PASSED
======================= 14 passed in 0.24s =======================
```
