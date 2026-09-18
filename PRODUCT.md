# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React (frontend) • FastAPI, SciPy HiGHS LP, OpenRouter/Gemini, MongoDB Atlas (backend)

## Users

BUP CSE Fest Hackathon Judges, Technical Evaluators, and Campus Microgrid Dispatchers assessing energy cost optimization and AI directive parsing.

## Product Purpose

GridWise automates campus microgrid scheduling by converting 24-hour load/solar profiles and natural language operator directives into cost-minimizing, physically validated battery dispatch plans under strict physical constraints.

## Positioning

Combines semantic LLM directive parsing (Gemini Flash with deterministic regex fallback) with an exact 72-variable SciPy HiGHS Linear Program enforcing battery neutrality ({23} = E_0$) and an independent zero-trust replay simulator verifying constraints to 10^-3 precision.

## Operating Context

Evaluated during fast-paced hackathon judging and live demonstrations. The user needs instantaneous scenario switching (10 official benchmark cases), editable 24h load tables, clear visual proof of constraint satisfaction, and scannable financial and physical KPIs.

## Capabilities and Constraints

- Strict adherence to official judge API contract: exact field names in /health and /optimize-energy.
- 10 benchmark scenarios (SAMPLE-01 through SAMPLE-10) pre-loaded in memory.
- Live telemetry: P95 solve latency, API status badge, MongoDB run persistence indicator.
- Architecture: **Tabbed High-Density Workstation**:
  - **Tab 1: Scenario & Load Profiler** (Operator Notes, Battery Specs, 24h Solar/Load Table, Input Distribution Chart)
  - **Tab 2: Dispatch & SoC Analytics** (Executive KPI Bar, LLM Directive Badges, Energy Flow Chart, Battery SoC Curve, 24h Dispatch Timeline)
  - **Tab 3: Constraint Audit & Raw Inspector** (Zero-Trust Replay Audit, 24h Dispatch Plan Table, Raw JSON Request/Response Inspector)
- Visual Style: **Swiss Precision Studio (Clean Light)** — Ultra-clean white/slate architectural palette, crisp typography, subtle structural borders, purposeful energy accents (solar amber, battery emerald, grid violet), and zero decorative noise.

## Brand Commitments

- Name: GridWise (Campus Smart Energy Optimization System)
- Professional engineering tone: High legibility, tabular numerals, disciplined layout, no cartoonish elements or fake metrics.

## Evidence on Hand

- 10 official benchmark test cases from public_samples.json.
- Live backend API running at http://localhost:8000 (FastAPI + SciPy).
- Live MongoDB Atlas run database logging.

## Product Principles

1. **Truth Over Decoration**: Every chart, badge, and number maps directly to LP optimization output or physical verification.
2. **Instant Scannability**: Executive KPIs (Cost in BDT, Peak Grid, Total Grid, Solve Time) always visible without visual fatigue.
3. **Frictionless Exploration**: Single-click benchmark loading, real-time input editing, and instant re-optimization.
4. **Architectural Discipline**: Balanced typographic hierarchy, tabular numbers for all metrics, and crisp structural alignment.
