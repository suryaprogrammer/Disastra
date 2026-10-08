# Disastra Risk & Severity Engine

## Model Evidence
- Detection Count: 1
- Maximum Confidence: 0.9339
- Water Area Ratio: 0.3156

## Risk Algorithm
- Rule-based deterministic scoring.
- Points awarded for detections, confidence levels, and normalized water segmentation mask area.

## Thresholds
- 0-19: LOW
- 20-39: MODERATE
- 40-69: HIGH
- 70-100: CRITICAL

## Real Test Image
- Image used: `00038_jpg.rf.416a2b6a274331b9674c4e5c6c2ae4a6.jpg`

## Actual Model Output
- Output successfully handled by `flood_service.py` including normalized mask area extraction without fabricating values.

## Actual Risk Result
- Risk Score: 85
- Risk Level: CRITICAL

## Unit Tests
- 6 unit tests PASSED.

## End-to-End Test
- PASSED (Server booted, model loaded, API hit, inference executed, risk returned).

## Limitations
This is a preliminary visual-risk engine based only on the available water segmentation model. It is NOT a complete flood-warning system. Weather, rainfall, geographic location, river levels, satellite metadata, and human verification will be added later.

## Safety Verification
MODEL MODIFIED: NO
DATASET MODIFIED: NO
TRAINING: NOT PERFORMED
RETRAINING: NOT PERFORMED
AUGMENTATION: NOT PERFORMED
FAKE INFERENCE: NO
FAKE RESULTS: NO
