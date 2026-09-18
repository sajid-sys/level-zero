import logging
import certifi
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from backend.config import MONGODB_URI

logger = logging.getLogger("gridwise.database")

_client: Optional[MongoClient] = None


def get_mongo_client() -> Optional[MongoClient]:
    global _client
    if _client is not None:
        return _client

    if not MONGODB_URI:
        return None

    try:
        _client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi("1"),
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
        )
        return _client
    except Exception as e:
        logger.warning(f"Could not initialize MongoDB client: {e}")
        return None


def test_mongo_connection() -> bool:
    """Pings MongoDB cluster to verify credentials and connectivity."""
    client = get_mongo_client()
    if not client:
        return False
    try:
        client.admin.command("ping")
        logger.info("Successfully connected and authenticated with MongoDB cluster.")
        return True
    except Exception as e:
        logger.warning(f"MongoDB ping failed: {e}")
        return False


def save_optimization_log(
    scenario_id: str,
    request_data: Dict[str, Any],
    response_data: Dict[str, Any],
    duration_ms: float
) -> None:
    """Safely records optimization execution history into MongoDB without blocking or raising errors."""
    try:
        client = get_mongo_client()
        if not client:
            return

        db = client["gridwise"]
        collection = db["optimization_runs"]

        record = {
            "scenario_id": scenario_id,
            "timestamp": datetime.now(timezone.utc),
            "duration_ms": duration_ms,
            "total_cost_bdt": response_data.get("total_cost_bdt"),
            "total_grid_kwh": response_data.get("total_grid_kwh"),
            "peak_grid_kwh": response_data.get("peak_grid_kwh"),
            "directives_count": len(response_data.get("directive_interpretation", [])),
            "request_payload": request_data,
            "response_payload": response_data,
        }
        collection.insert_one(record)
        logger.info(f"Saved optimization run for scenario '{scenario_id}' to MongoDB.")
    except Exception as e:
        logger.warning(f"Failed to record optimization run in MongoDB (non-blocking): {e}")
