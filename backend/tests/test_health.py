from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "name": "Disastra API",
        "version": "0.1.0",
        "status": "running"
    }

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "Disastra Backend"
    assert "flood_model" in data
    assert data["flood_model"]["loaded"] == True

def test_missing_image():
    response = client.post("/api/analyze/flood")
    assert response.status_code == 422 # FastAPI validation error for missing required field

def test_invalid_image_type():
    response = client.post(
        "/api/analyze/flood",
        files={"file": ("test.txt", b"not an image", "text/plain")}
    )
    assert response.status_code == 415
    assert "Unsupported file type" in response.json()["detail"]
