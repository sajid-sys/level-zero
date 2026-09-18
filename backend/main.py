import logging
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder

from backend.schemas import HealthResponse, OptimizeEnergyRequest, OptimizeEnergyResponse
from backend.services.energy_service import process_energy_optimization
from backend.optimization.optimizer import OptimizationError
from backend.optimization.replay_validator import ReplayValidationError
from backend.guardrails.directive_validator import GuardrailValidationError

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("gridwise")

app = FastAPI(
    title="GridWise – Smart Campus Energy Optimizer API",
    description="Optimal 24-hour microgrid scheduling with LLM operator directive interpretation.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Request validation failed: {exc}")
    clean_errors = []
    for err in exc.errors():
        clean_errors.append({
            "loc": list(err.get("loc", [])),
            "msg": str(err.get("msg", "")),
            "type": str(err.get("type", ""))
        })
    return JSONResponse(
        status_code=422,
        content={"detail": clean_errors, "message": "Schema validation failed"}
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning(f"Domain validation failed: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={"message": str(exc)}
    )


@app.exception_handler(ReplayValidationError)
async def replay_error_handler(request: Request, exc: ReplayValidationError):
    logger.error(f"Replay validation error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": f"Optimization output failed independent replay verification: {str(exc)}"}
    )


@app.exception_handler(OptimizationError)
async def optimization_error_handler(request: Request, exc: OptimizationError):
    logger.error(f"Solver error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": f"Solver failed: {str(exc)}"}
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Judge health check endpoint."""
    return HealthResponse(status="ok")


@app.post("/optimize-energy", response_model=OptimizeEnergyResponse)
async def optimize_energy(request: OptimizeEnergyRequest):
    """Judge energy optimization endpoint."""
    logger.info(f"Received optimization request for scenario: {request.scenario_id}")
    try:
        response = await process_energy_optimization(request)
        logger.info(f"Successfully optimized scenario: {request.scenario_id}")
        return response
    except (ValueError, GuardrailValidationError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except (OptimizationError, ReplayValidationError) as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error in /optimize-energy")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Mount built frontend dist if available
from pathlib import Path
from fastapi.staticfiles import StaticFiles

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
