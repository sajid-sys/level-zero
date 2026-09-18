import math
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, model_validator


class BatteryInput(BaseModel):
    capacity_kwh: float = Field(..., gt=0, description="Total battery capacity in kWh")
    initial_energy_kwh: float = Field(..., ge=0, description="Energy in battery at start of hour 0")
    minimum_energy_kwh: float = Field(..., ge=0, description="Base minimum allowable battery energy")
    max_charge_kwh_per_hour: float = Field(..., ge=0, description="Maximum charging rate per hour")
    max_discharge_kwh_per_hour: float = Field(..., ge=0, description="Maximum discharging rate per hour")

    @model_validator(mode="after")
    def validate_battery(self):
        for field_name in ["capacity_kwh", "initial_energy_kwh", "minimum_energy_kwh", "max_charge_kwh_per_hour", "max_discharge_kwh_per_hour"]:
            val = getattr(self, field_name)
            if not math.isfinite(val):
                raise ValueError(f"Battery {field_name} must be a finite number")

        if self.minimum_energy_kwh > self.capacity_kwh:
            raise ValueError("minimum_energy_kwh cannot exceed capacity_kwh")
        if self.initial_energy_kwh > self.capacity_kwh:
            raise ValueError("initial_energy_kwh cannot exceed capacity_kwh")
        if self.initial_energy_kwh < self.minimum_energy_kwh:
            raise ValueError("initial_energy_kwh cannot be less than minimum_energy_kwh")
        return self


class HourInput(BaseModel):
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0 to 23)")
    demand_kwh: float = Field(..., ge=0, description="Campus demand in kWh")
    solar_kwh: float = Field(..., ge=0, description="Forecasted solar generation in kWh")
    tariff_bdt_per_kwh: float = Field(..., ge=0, description="Electricity tariff in BDT per kWh")

    @model_validator(mode="after")
    def validate_finite(self):
        for f in ["demand_kwh", "solar_kwh", "tariff_bdt_per_kwh"]:
            val = getattr(self, f)
            if not math.isfinite(val):
                raise ValueError(f"Hour {self.hour} {f} must be a finite number")
        return self


class OptimizeEnergyRequest(BaseModel):
    scenario_id: str = Field(..., min_length=1, description="Unique scenario identifier")
    operator_notes: List[str] = Field(..., min_length=1, max_length=3, description="1 to 3 operator notes")
    hours: List[HourInput] = Field(..., description="Exactly 24 hourly inputs from hour 0 to 23")
    battery: BatteryInput = Field(..., description="Battery configuration")

    @model_validator(mode="after")
    def validate_scenario(self):
        # Validate operator notes
        for i, note in enumerate(self.operator_notes):
            if not note or not note.strip():
                raise ValueError(f"Operator note at index {i} cannot be empty")

        # Validate exactly 24 unique hours 0..23
        if len(self.hours) != 24:
            raise ValueError(f"hours array must contain exactly 24 entries, got {len(self.hours)}")

        hour_indices = [h.hour for h in self.hours]
        if len(set(hour_indices)) != 24 or sorted(hour_indices) != list(range(24)):
            raise ValueError("hours array must contain exactly 24 unique hours numbered 0 through 23 in sequence")

        return self


DirectiveType = Literal[
    "solar_reduction",
    "minimum_battery_reserve",
    "no_charge_window",
    "no_discharge_window",
    "max_grid_window",
    "no_op"
]


class DirectiveInterpretation(BaseModel):
    note_index: int = Field(..., ge=0, description="Index of the corresponding operator note")
    applies: bool = Field(..., description="Whether this directive impacts the schedule")
    directive_type: DirectiveType = Field(..., description="Classification of the directive")
    structured_adjustment: Optional[Dict[str, Any]] = Field(None, description="Extracted numerical bounds and hours")
    explanation: str = Field(..., description="Human-readable explanation of the interpretation")


class HourlyPlanEntry(BaseModel):
    hour: int = Field(..., ge=0, le=23)
    grid_kwh: float = Field(..., ge=0)
    solar_used_kwh: float = Field(..., ge=0)
    battery_action: Literal["charge", "discharge", "idle"]
    battery_kwh: float = Field(..., ge=0)
    battery_energy_after_kwh: float = Field(..., ge=0)


class OptimizeEnergyResponse(BaseModel):
    scenario_id: str
    directive_interpretation: List[DirectiveInterpretation]
    hourly_plan: List[HourlyPlanEntry]
    total_grid_kwh: float
    total_cost_bdt: float
    peak_grid_kwh: float
    plan_summary: str


class HealthResponse(BaseModel):
    status: str = "ok"
