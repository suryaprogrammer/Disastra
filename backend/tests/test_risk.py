from app.services.risk_service import risk_service

def test_zero_detections():
    mock_flood_result = {"detections": []}
    result = risk_service.calculate_risk(mock_flood_result)
    assert result["risk_assessment"]["water_detected"] == False
    assert result["risk_assessment"]["risk_score"] == 0
    assert result["risk_assessment"]["risk_level"] == "LOW"

def test_one_high_confidence_detection():
    mock_flood_result = {
        "detections": [
            {"confidence": 0.85, "mask_area_ratio": 0.10}
        ]
    }
    result = risk_service.calculate_risk(mock_flood_result)
    # base(20) + conf(30) + count(10) + area(15) = 75
    assert result["risk_assessment"]["water_detected"] == True
    assert result["risk_assessment"]["risk_score"] == 75
    assert result["risk_assessment"]["risk_level"] == "CRITICAL"

def test_multiple_detections():
    mock_flood_result = {
        "detections": [
            {"confidence": 0.70, "mask_area_ratio": 0.02},
            {"confidence": 0.65, "mask_area_ratio": 0.04}
        ]
    }
    result = risk_service.calculate_risk(mock_flood_result)
    # total area = 0.06 (6%)
    # max conf = 0.70 (20 pts)
    # count = 2 (15 pts)
    # base = 20 pts
    # area 6% = 15 pts
    # total = 20 + 20 + 15 + 15 = 70
    assert result["risk_assessment"]["risk_score"] == 70
    assert result["risk_assessment"]["risk_level"] == "CRITICAL"

def test_low_confidence_detection():
    mock_flood_result = {
        "detections": [
            {"confidence": 0.35, "mask_area_ratio": 0.01}
        ]
    }
    result = risk_service.calculate_risk(mock_flood_result)
    # max conf = 0.35 (5 pts)
    # count = 1 (10 pts)
    # base = 20 pts
    # area 1% = 5 pts
    # total = 20 + 5 + 10 + 5 = 40
    assert result["risk_assessment"]["risk_score"] == 40
    assert result["risk_assessment"]["risk_level"] == "HIGH"

def test_missing_segmentation_area():
    mock_flood_result = {
        "detections": [
            {"confidence": 0.50}
        ]
    }
    result = risk_service.calculate_risk(mock_flood_result)
    # max conf = 0.50 (10 pts)
    # count = 1 (10 pts)
    # base = 20 pts
    # area = missing (0 pts)
    # total = 20 + 10 + 10 + 0 = 40
    assert result["risk_assessment"]["risk_score"] == 40
    assert result["risk_assessment"]["risk_level"] == "HIGH"

def test_score_boundary_conditions():
    mock_flood_result = {
        "detections": [
            {"confidence": 0.99, "mask_area_ratio": 0.80},
            {"confidence": 0.99, "mask_area_ratio": 0.80},
            {"confidence": 0.99, "mask_area_ratio": 0.80},
            {"confidence": 0.99, "mask_area_ratio": 0.80},
            {"confidence": 0.99, "mask_area_ratio": 0.80}
        ]
    }
    result = risk_service.calculate_risk(mock_flood_result)
    # total area > 100% (capped at 1.0) -> 30 pts
    # max conf = 0.99 (30 pts)
    # count = 5 (20 pts)
    # base = 20 pts
    # total = 30 + 30 + 20 + 20 = 100 (Capped at 100)
    assert result["risk_assessment"]["risk_score"] == 100
    assert result["risk_assessment"]["risk_level"] == "CRITICAL"
