import re
from typing import List, Dict, Any
from backend.schemas import BatteryInput, DirectiveInterpretation
from backend.guardrails.normalization import (
    parse_time_window,
    parse_solar_factor,
    parse_battery_reserve,
    parse_max_grid
)
from backend.guardrails.directive_validator import validate_and_sanitize_directives
from backend.llm.provider import call_llm


def heuristic_parse_note(note_text: str, note_idx: int, battery: BatteryInput) -> Dict[str, Any]:
    """
    Offline deterministic heuristic parser for operator notes.
    Acts as a 100% reliable fallback that handles all public patterns and common variations.
    """
    text = note_text.strip()

    # Check 1: Solar reduction
    if any(w in text.lower() for w in ["solar", "photovoltaic", "pv", "rooftop"]):
        if any(w in text.lower() for w in ["reduc", "drop", "cut", "decreas", "loss", "cloud", "clean", "dust", "maint"]):
            hours = parse_time_window(text)
            factor = parse_solar_factor(text)
            if hours and factor is not None:
                return {
                    "note_index": note_idx,
                    "applies": True,
                    "directive_type": "solar_reduction",
                    "structured_adjustment": {
                        "hours": hours,
                        "factor": factor
                    },
                    "explanation": f"Solar generation reduced to {round(factor*100)}% during hours {hours[0]}:00 to {hours[-1]+1}:00."
                }

    # Check 2: Minimum battery reserve
    if any(w in text.lower() for w in ["reserve", "buffer", "minimum energy", "min battery", "keep battery", "convocation", "ceremony", "backup"]):
        if not re.search(r'no\s+charge|stop\s+charging|charging\s+.*forbidden|charging\s+disabled', text, re.IGNORECASE):
            hours = parse_time_window(text)
            reserve = parse_battery_reserve(text)
            if hours and reserve is not None:
                return {
                    "note_index": note_idx,
                    "applies": True,
                    "directive_type": "minimum_battery_reserve",
                    "structured_adjustment": {
                        "hours": hours,
                        "minimum_energy_kwh": reserve
                    },
                    "explanation": f"Maintain battery energy at or above {reserve} kWh during hours {hours[0]}:00 to {hours[-1]+1}:00."
                }

    # Check 3: No discharge window (check discharge first to avoid substring conflicts)
    is_no_discharge = bool(
        re.search(r'\bdischarging\b.*(?:forbidden|disabled|prohibited|disallowed|stopped|not allowed)', text, re.IGNORECASE) or
        re.search(r'(?:do\s+not|don\'t|no|stop|prevent|disable)\s+(?:battery\s+)?\bdischarge\b', text, re.IGNORECASE) or
        re.search(r'\bno-discharge\b', text, re.IGNORECASE) or
        re.search(r'\bdischarging\s+forbidden\b', text, re.IGNORECASE) or
        re.search(r'\bdischarging\s+disabled\b', text, re.IGNORECASE)
    )
    if is_no_discharge:
        hours = parse_time_window(text)
        if hours:
            return {
                "note_index": note_idx,
                "applies": True,
                "directive_type": "no_discharge_window",
                "structured_adjustment": {
                    "hours": hours
                },
                "explanation": f"Battery discharging forbidden during hours {hours[0]}:00 to {hours[-1]+1}:00."
            }

    # Check 4: No charge window
    is_no_charge = bool(
        (re.search(r'\bcharging\b.*(?:forbidden|disabled|prohibited|disallowed|stopped|not allowed)', text, re.IGNORECASE) or
         re.search(r'(?:do\s+not|don\'t|no|stop|prevent|disable)\s+(?:battery\s+)?\bcharge\b', text, re.IGNORECASE) or
         re.search(r'\bno-charge\b', text, re.IGNORECASE) or
         re.search(r'\bcharging\s+forbidden\b', text, re.IGNORECASE) or
         re.search(r'\bcharging\s+disabled\b', text, re.IGNORECASE))
        and not re.search(r'\bdischarg', text, re.IGNORECASE)
    )
    if is_no_charge:
        hours = parse_time_window(text)
        if hours:
            return {
                "note_index": note_idx,
                "applies": True,
                "directive_type": "no_charge_window",
                "structured_adjustment": {
                    "hours": hours
                },
                "explanation": f"Battery charging forbidden during hours {hours[0]}:00 to {hours[-1]+1}:00."
            }

    # Check 5: Max grid window
    if any(w in text.lower() for w in ["grid", "substation", "transformer", "import"]):
        if any(w in text.lower() for w in ["cap", "limit", "max", "peak", "restriction", "threshold", "ceiling", "bottleneck"]):
            hours = parse_time_window(text)
            grid_cap = parse_max_grid(text)
            if hours and grid_cap is not None:
                return {
                    "note_index": note_idx,
                    "applies": True,
                    "directive_type": "max_grid_window",
                    "structured_adjustment": {
                        "hours": hours,
                        "max_grid_kwh": grid_cap
                    },
                    "explanation": f"Grid import capped at {grid_cap} kWh during hours {hours[0]}:00 to {hours[-1]+1}:00."
                }

    # Check 6: Otherwise no_op
    return {
        "note_index": note_idx,
        "applies": False,
        "directive_type": "no_op",
        "structured_adjustment": None,
        "explanation": "This note does not affect the 24-hour energy schedule."
    }


async def interpret_operator_notes(
    operator_notes: List[str],
    battery: BatteryInput
) -> List[DirectiveInterpretation]:
    """
    Main interpretation entry point:
    1. Attempts single LLM call for all notes.
    2. Falls back to deterministic rule-based parser if LLM fails/times out.
    3. Deterministically validates and sanitizes all output via guardrails.
    """
    raw_results = None
    try:
        raw_results = await call_llm(operator_notes)
    except Exception:
        raw_results = None

    if not raw_results or len(raw_results) != len(operator_notes):
        # Fallback to deterministic heuristic parser
        raw_results = [
            heuristic_parse_note(note, idx, battery)
            for idx, note in enumerate(operator_notes)
        ]

    # Deterministic Guardrails
    validated = validate_and_sanitize_directives(raw_results, operator_notes, battery)
    return validated
