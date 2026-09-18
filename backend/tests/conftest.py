import pytest
import json
from pathlib import Path
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def sample_cases():
    p = Path(__file__).resolve().parent.parent.parent / "sample_cases" / "public_samples.json"
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)
