import pytest
import time
from unittest.mock import MagicMock, patch
from google.genai.errors import APIError
from app.services.gemini_service import gemini_service
from app.schemas.ai import AIRequestPayload, FloodContext, RiskContext

@pytest.fixture
def dummy_payload():
    return AIRequestPayload(
        observation_id="test-obs-123",
        flood=FloodContext(
            water_detected=True,
            detection_count=5,
            maximum_confidence=0.9,
            water_area_ratio=0.5,
            analysis_timestamp="2026-10-08T00:00:00Z"
        ),
        risk=RiskContext(risk_score=75, risk_level="HIGH"),
        weather=None,
        weather_status=None
    )

@pytest.fixture
def mock_client(monkeypatch):
    client_mock = MagicMock()
    monkeypatch.setattr(gemini_service, "client", client_mock)
    # Speed up tests by removing sleep
    monkeypatch.setattr("app.services.gemini_service.time.sleep", lambda x: None)
    return client_mock

def create_mock_response():
    resp = MagicMock()
    resp.text = """{
        "status": "SUCCESS",
        "situation_report": {
            "headline": "Test Headline",
            "situation_summary": "Summary",
            "critical_threats": [],
            "key_observations": [],
            "risk_context": "Risk",
            "confidence_note": "Confidence",
            "data_limitations": []
        },
        "response_recommendation": {
            "priority": "HIGH",
            "immediate_action": "Action",
            "recommended_actions": [],
            "monitoring_actions": []
        },
        "model": "model",
        "generated_at": "time"
    }"""
    return resp

class MockAPIError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message

def create_api_error(code, message):
    return MockAPIError(code, message)

def test_preferred_model_success(mock_client, dummy_payload):
    mock_client.models.generate_content.return_value = create_mock_response()
    
    result = gemini_service.generate_brief(dummy_payload)
    
    assert result.status == "SUCCESS"
    assert result.model == gemini_service.model_name
    assert mock_client.models.generate_content.call_count == 1
    # Verify the risk logic isn't changed in payload
    assert dummy_payload.risk.risk_score == 75

def test_preferred_model_temporary_503_then_success(mock_client, dummy_payload):
    mock_client.models.generate_content.side_effect = [
        create_api_error(503, "Service Unavailable"),
        create_mock_response()
    ]
    
    result = gemini_service.generate_brief(dummy_payload)
    
    assert result.status == "SUCCESS"
    assert result.model == gemini_service.model_name
    assert mock_client.models.generate_content.call_count == 2

def test_preferred_model_exhausted_fallback_succeeds(mock_client, dummy_payload, monkeypatch):
    monkeypatch.setattr("app.core.config.settings.GEMINI_MAX_RETRIES", 2)
    monkeypatch.setattr("app.core.config.settings.GEMINI_FALLBACK_MODELS", "gemini-3.7-flash")
    
    mock_client.models.generate_content.side_effect = [
        create_api_error(503, "Service Unavailable"), # attempt 1
        create_api_error(503, "Service Unavailable"), # attempt 2
        create_api_error(503, "Service Unavailable"), # attempt 3 (exhausted)
        create_mock_response() # fallback 3.7 success
    ]
    
    result = gemini_service.generate_brief(dummy_payload)
    
    assert result.status == "SUCCESS"
    assert result.model == "gemini-3.7-flash"
    assert mock_client.models.generate_content.call_count == 4

def test_multiple_fallback_failures(mock_client, dummy_payload, monkeypatch):
    monkeypatch.setattr("app.core.config.settings.GEMINI_MAX_RETRIES", 0) # 1 attempt per model
    monkeypatch.setattr("app.core.config.settings.GEMINI_FALLBACK_MODELS", "gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash-lite")
    
    mock_client.models.generate_content.side_effect = [
        create_api_error(503, "Unavailable"), # 3.8
        create_api_error(503, "Unavailable"), # 3.7
        create_api_error(503, "Unavailable"), # 3.6
        create_mock_response() # 3.5-lite success
    ]
    
    result = gemini_service.generate_brief(dummy_payload)
    
    assert result.model == "gemini-3.5-flash-lite"
    assert mock_client.models.generate_content.call_count == 4

def test_all_models_unavailable(mock_client, dummy_payload, monkeypatch):
    monkeypatch.setattr("app.core.config.settings.GEMINI_MAX_RETRIES", 0)
    monkeypatch.setattr("app.core.config.settings.GEMINI_FALLBACK_MODELS", "gemini-3.7-flash")
    
    mock_client.models.generate_content.side_effect = [
        create_api_error(503, "Unavailable"), # 3.8
        create_api_error(503, "Unavailable"), # 3.7
    ]
    
    with pytest.raises(ValueError) as excinfo:
        gemini_service.generate_brief(dummy_payload)
        
    assert "AI_UNAVAILABLE" in str(excinfo.value)

def test_non_retryable_error(mock_client, dummy_payload, monkeypatch):
    monkeypatch.setattr("app.core.config.settings.GEMINI_MAX_RETRIES", 2)
    
    # 403 Forbidden is non-transient
    mock_client.models.generate_content.side_effect = [
        create_api_error(403, "Permission Denied")
    ]
    
    with pytest.raises(ValueError) as excinfo:
        gemini_service.generate_brief(dummy_payload)
        
    assert "Permission Denied" in str(excinfo.value)
    # Should only try once
    assert mock_client.models.generate_content.call_count == 1
