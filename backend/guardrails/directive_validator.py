from typing import List, Dict, Any, Optional
from backend.schemas import DirectiveInterpretation, BatteryInput


ALLOWED_DIRECTIVE_TYPES = {
    "solar_reduction",
    "minimum_battery_reserve",
    "no_charge_window",
    "no_discharge_window",
    "max_grid_window",
    "no_op"
}


class GuardrailValidationError(Exception):
    pass


def validate_and_sanitize_directives(
    raw_directives: List[Dict[str, Any]],
    operator_notes: List[str],
    battery: BatteryInput
) -> List[DirectiveInterpretation]:
    """
    Deterministically validates and sanitizes LLM interpretations.
    Ensures:
      - Exactly one interpretation per note
      - Correct note_index order
      - Only allowed directive types
      - no_op has applies=False, structured_adjustment=None
      - Other directives have applies=True, structured_adjustment != None
      - Hours are sorted, unique, and strictly in range 0..23
      - Numeric limits are valid and non-negative
    """
    if len(raw_directives) != len(operator_notes):
        raise GuardrailValidationError(
            f"Expected {len(operator_notes)} interpretations, got {len(raw_directives)}"
        )

    validated_list: List[DirectiveInterpretation] = []

    for idx, (raw, note_text) in enumerate(zip(raw_directives, operator_notes)):
        # 1. Validate note_index
        raw_idx = raw.get("note_index", idx)
        if raw_idx != idx:
            raw_idx = idx

        # 2. Validate directive_type
        dtype = raw.get("directive_type")
        if dtype not in ALLOWED_DIRECTIVE_TYPES:
            # Unsupported directive type -> must become no_op
            dtype = "no_op"

        explanation = raw.get("explanation", "").strip()
        if not explanation:
            explanation = "Automated interpretation."

        # 3. Handle no_op
        if dtype == "no_op":
            validated_list.append(
                DirectiveInterpretation(
                    note_index=idx,
                    applies=False,
                    directive_type="no_op",
                    structured_adjustment=None,
                    explanation=explanation or "This note does not affect the 24-hour energy schedule."
                )
            )
            continue

        # 4. For applicable directives, check structured_adjustment
        adj = raw.get("structured_adjustment")
        if not isinstance(adj, dict):
            # Invalid adjustment payload -> fallback to no_op
            validated_list.append(
                DirectiveInterpretation(
                    note_index=idx,
                    applies=False,
                    directive_type="no_op",
                    structured_adjustment=None,
                    explanation=f"Malformed adjustment payload for {dtype}; treated as no_op."
                )
            )
            continue

        # Validate hours
        raw_hours = adj.get("hours")
        if not isinstance(raw_hours, list) or len(raw_hours) == 0:
            validated_list.append(
                DirectiveInterpretation(
                    note_index=idx,
                    applies=False,
                    directive_type="no_op",
                    structured_adjustment=None,
                    explanation=f"Missing valid hours for {dtype}; treated as no_op."
                )
            )
            continue

        # Clean hours: integer, unique, sorted, 0..23
        try:
            cleaned_hours = sorted(list(set(int(h) for h in raw_hours)))
        except (ValueError, TypeError):
            cleaned_hours = []

        if not cleaned_hours or any(h < 0 or h > 23 for h in cleaned_hours):
            validated_list.append(
                DirectiveInterpretation(
                    note_index=idx,
                    applies=False,
                    directive_type="no_op",
                    structured_adjustment=None,
                    explanation=f"Hours out of range [0, 23] for {dtype}; treated as no_op."
                )
            )
            continue

        sanitized_adj = {"hours": cleaned_hours}

        # Specific type validations
        if dtype == "solar_reduction":
            factor = adj.get("factor")
            if factor is None:
                # Malformed -> fallback to no_op
                validated_list.append(
                    DirectiveInterpretation(
                        note_index=idx, applies=False, directive_type="no_op",
                        structured_adjustment=None, explanation="Missing factor for solar_reduction."
                    )
                )
                continue
            factor = float(factor)
            factor = max(0.0, min(1.0, round(factor, 4)))
            sanitized_adj["factor"] = factor

        elif dtype == "minimum_battery_reserve":
            reserve = adj.get("minimum_energy_kwh")
            if reserve is None:
                reserve = adj.get("min_reserve_kwh")  # tolerant
            if reserve is None:
                validated_list.append(
                    DirectiveInterpretation(
                        note_index=idx, applies=False, directive_type="no_op",
                        structured_adjustment=None, explanation="Missing reserve energy for minimum_battery_reserve."
                    )
                )
                continue
            reserve = float(reserve)
            if reserve < 0 or reserve > battery.capacity_kwh:
                validated_list.append(
                    DirectiveInterpretation(
                        note_index=idx, applies=False, directive_type="no_op",
                        structured_adjustment=None, explanation=f"Reserve {reserve} kWh outside valid range [0, {battery.capacity_kwh}]."
                    )
                )
                continue
            sanitized_adj["minimum_energy_kwh"] = round(reserve, 4)

        elif dtype == "max_grid_window":
            max_grid = adj.get("max_grid_kwh")
            if max_grid is None:
                max_grid = adj.get("max_grid_kw")
            if max_grid is None or float(max_grid) < 0:
                validated_list.append(
                    DirectiveInterpretation(
                        note_index=idx, applies=False, directive_type="no_op",
                        structured_adjustment=None, explanation="Missing or negative grid limit."
                    )
                )
                continue
            sanitized_adj["max_grid_kwh"] = round(float(max_grid), 4)

        # Validated successfully
        validated_list.append(
            DirectiveInterpretation(
                note_index=idx,
                applies=True,
                directive_type=dtype,
                structured_adjustment=sanitized_adj,
                explanation=explanation
            )
        )

    return validated_list
