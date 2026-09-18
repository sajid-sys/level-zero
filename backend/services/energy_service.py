from backend.schemas import OptimizeEnergyRequest, OptimizeEnergyResponse
from backend.llm.interpreter import interpret_operator_notes
from backend.optimization.optimizer import optimize_energy_schedule
from backend.optimization.replay_validator import replay_and_validate_plan


from backend.database import save_optimization_log


async def process_energy_optimization(request: OptimizeEnergyRequest) -> OptimizeEnergyResponse:
    """
    Complete end-to-end processing pipeline:
      1. Interpret operator notes via LLM with deterministic guardrails
      2. Optimize 24-hour schedule via Linear Programming
      3. Independently replay and validate schedule
      4. Return official response structure
    """
    # Step 1: Interpret operator directives
    directives = await interpret_operator_notes(request.operator_notes, request.battery)

    # Step 2: Solve LP schedule
    hourly_plan, total_grid_kwh, total_cost_bdt, peak_grid_kwh, plan_summary = optimize_energy_schedule(
        request.hours,
        request.battery,
        directives
    )

    # Step 3: Replay validation (Strict rejection if invalid)
    replay_and_validate_plan(
        request.hours,
        request.battery,
        directives,
        hourly_plan,
        total_grid_kwh,
        total_cost_bdt,
        peak_grid_kwh
    )

    # Step 4: Construct validated response
    response = OptimizeEnergyResponse(
        scenario_id=request.scenario_id,
        directive_interpretation=directives,
        hourly_plan=hourly_plan,
        total_grid_kwh=total_grid_kwh,
        total_cost_bdt=total_cost_bdt,
        peak_grid_kwh=peak_grid_kwh,
        plan_summary=plan_summary
    )

    # Step 5: Save execution run to MongoDB asynchronously (non-blocking)
    save_optimization_log(
        scenario_id=request.scenario_id,
        request_data=request.model_dump(),
        response_data=response.model_dump(),
        duration_ms=0.0
    )

    return response
