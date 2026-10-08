from typing import Dict, Any, List

class RiskService:
    def calculate_risk(self, flood_result: dict) -> dict:
        detections = flood_result.get("detections", [])
        detection_count = len(detections)
        
        explanation = []
        
        # Base zero-detection rule
        if detection_count == 0:
            return {
                "risk_assessment": {
                    "risk_level": "LOW",
                    "risk_score": 0,
                    "water_detected": False
                },
                "evidence": {
                    "detection_count": 0,
                    "maximum_confidence": 0.0,
                    "average_confidence": 0.0,
                    "water_area_ratio": None
                },
                "explanation": ["No water detections returned by the model."],
                "method": {
                    "type": "deterministic_rule_engine",
                    "version": "1.0"
                }
            }

        # Calculate metrics
        confidences = [d.get("confidence", 0) for d in detections]
        max_conf = max(confidences) if confidences else 0
        avg_conf = sum(confidences) / len(confidences) if confidences else 0
        
        # For water area ratio, we sum the unique areas, but in YOLO instances they might overlap.
        # For this deterministic model, we'll take the sum of mask areas, capped at 1.0.
        # Or take the maximum mask area. Let's take the sum for now to reflect total water covered.
        areas = [d.get("mask_area_ratio") for d in detections if d.get("mask_area_ratio") is not None]
        total_water_ratio = min(sum(areas), 1.0) if areas else None

        score = 0
        
        # A) Detection evidence
        score += 20
        explanation.append(f"Base detection evidence (+20 points for {detection_count} detections).")
        
        # B) Maximum confidence
        if max_conf >= 0.80:
            score += 30
            explanation.append(f"High confidence detection >= 0.80 (+30 points).")
        elif max_conf >= 0.60:
            score += 20
            explanation.append(f"Moderate confidence detection >= 0.60 (+20 points).")
        elif max_conf >= 0.40:
            score += 10
            explanation.append(f"Low confidence detection >= 0.40 (+10 points).")
        else:
            score += 5
            explanation.append(f"Very low confidence detection < 0.40 (+5 points).")
            
        # C) Detection count
        if detection_count >= 5:
            score += 20
            explanation.append(f"Multiple detections >= 5 (+20 points).")
        elif detection_count >= 2:
            score += 15
            explanation.append(f"Multiple detections 2-4 (+15 points).")
        else:
            score += 10
            explanation.append(f"Single detection (+10 points).")
            
        # D) Water segmentation area
        if total_water_ratio is not None:
            pct = total_water_ratio * 100
            if pct > 40:
                score += 30
                explanation.append(f"Large water area > 40% (+30 points).")
            elif pct >= 20:
                score += 25
                explanation.append(f"Moderate water area 20-40% (+25 points).")
            elif pct >= 5:
                score += 15
                explanation.append(f"Small water area 5-20% (+15 points).")
            else:
                score += 5
                explanation.append(f"Very small water area < 5% (+5 points).")
        else:
            explanation.append("Water area ratio unavailable. No points assigned for area.")

        # Cap score at 100
        score = min(score, 100)
        
        # Determine risk level
        if score < 20:
            level = "LOW"
        elif score < 40:
            level = "MODERATE"
        elif score < 70:
            level = "HIGH"
        else:
            level = "CRITICAL"
            
        return {
            "risk_assessment": {
                "risk_level": level,
                "risk_score": score,
                "water_detected": True
            },
            "evidence": {
                "detection_count": detection_count,
                "maximum_confidence": round(max_conf, 4),
                "average_confidence": round(avg_conf, 4),
                "water_area_ratio": round(total_water_ratio, 4) if total_water_ratio is not None else None
            },
            "explanation": explanation,
            "method": {
                "type": "deterministic_rule_engine",
                "version": "1.0"
            }
        }

risk_service = RiskService()
