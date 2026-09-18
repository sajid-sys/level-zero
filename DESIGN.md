---
name: GridWise Swiss Precision
description: Clean light architectural workstation for high-density campus microgrid optimization and I directive dispatch.
colors:
  canvas: "#f8fafc"
  surface: "#ffffff"
  surface-subtle: "#f1f5f9"
  border: "#e2e8f0"
  border-strong: "#cbd5e1"
  text-main: "#0f172a"
  text-secondary: "#475569"
  text-muted: "#94a3b8"
  solar: "#d97706"
  solar-subtle: "#fef3c7"
  battery: "#059669"
  battery-subtle: "#d1fae5"
  grid: "#4f46e5"
  grid-subtle: "#eef2ff"
  alert: "#e11d48"
  alert-subtle: "#ffe4e6"
typography:
  fontFamilySans: "Inter, system-ui, -apple-system, sans-serif"
  fontFamilyMono: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
---

# Design System

## Overview
GridWise Swiss Precision Studio is an architectural, high-density operations workstation designed for microgrid engineers and hackathon judges. It prioritizes instant cognitive scannability, tabular numeric alignment, structured energy color semantics (Amber for Solar, Emerald for Battery, Indigo for Grid), and zero decorative bloat.

## Colors
- Canvas and Structural Surfaces: Crisp #f8fafc background with bright #ffffff cards and #f1f5f9 inset headers.
- Borders and Dividers: Crisp #e2e8f0 single-pixel dividers and #cbd5e1 active borders.
- Energy Semantics:
  - Solar Generation: #d97706 (Amber-600) with #fef3c7 tag fills.
  - Battery Dispatch / Storage: #059669 (Emerald-600) with #d1fae5 tag fills.
  - Grid Import: #4f46e5 (Indigo-600) with #eef2ff tag fills.
  - Feasibility Pass: #059669 (Emerald).
  - Physical Violation: #e11d48 (Rose-600).

## Typography
- Main body and headings use clean modern sans-serif with tracked caps for field labels.
- Tabular numerals (font-variant-numeric: tabular-nums) applied to all numerical values, monetary units (BDT), kWh metrics, and hourly rows to prevent jitter.
- Strict typography scale: 24px/28px for headers, 14px for primary controls, 12px/13px for dense table cells, and 11px for status micro-labels.

## Layout
- Layout Model: Tabbed High-Density Workstation.
- Top Command Bar: Fixed-presence bar housing GridWise branding, live backend pulse (/health), 10-sample scenario selector, reset trigger, and the primary Run Energy Optimization action.
- Three Operational Tabs:
  1. Scenario and Profiler: Operator instructions, physical battery specs, 24h interactive demand/solar table, and diurnal distribution chart.
  2. Dispatch and Analytics: Executive KPI metric cards, LLM directive translation cards, 24h dispatch balance chart, battery SoC trajectory, and battery mode timeline.
  3. Verification and Inspector: Zero-trust physical replay verification panel (balance, battery bounds, rate limits, operator constraints), hourly dispatch plan data table, and raw JSON input/output viewer.

## Elevation and Depth
- Single-declaration elevation: Crisp 1px borders (border-slate-200) paired with subtle micro-shadows (shadow-xs / shadow-sm).
- No exaggerated blur halos or cartoonish heavy drop shadows.

## Shapes
- Cards and panels utilize rounded-xl (12-14px) with inner chips and controls at rounded-md (6-8px).

## Components
- Tab Navigation: Clean pill/segment switchers with crisp active contrast (bg-slate-900 text-white vs text-slate-600 hover:text-slate-900).
- Metric Tiles: Value-first typography with unambiguous physical units (kWh, BDT, ms), accompanied by delta or status indicators.
- Status Badges: Semi-transparent tinted pills with matching solid text and crisp SVG status icons.
- Tables: Compact zebra rows, sticky headers, right-aligned numbers, and visual mini-meters for battery SoC and power flows.

## Dos and Donts
- DO use tabular numerals (tabular-nums font-mono) for all energy, price, and timestamp data.
- DO maintain strict visual consistency for energy types (Amber = Solar, Emerald = Battery, Indigo = Grid).
- DONT use emojis as functional icons; use drawn SVG icons from lucide-react.
- DONT use gradient text or thick colored card borders.
- DONT hide critical physical constraints; show replay verification explicitly.
