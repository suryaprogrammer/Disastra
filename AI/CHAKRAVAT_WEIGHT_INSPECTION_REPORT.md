# Chakravat Weight Inspection Report

## 1. ZIP Verification
- **Status:** PASS
- **File:** `D:\Disastra\AI\downloads\TyphoonSat\chakravat-weights-v1.0.zip`
- **Size:** 363,022,266 bytes

## 2. SHA256 Result
- **Expected Hash:** `899effb7ea19bd51396f78debbfe35adb8503c5e0000530ed58967cbc8e7d251`
- **Actual Hash:** `899effb7ea19bd51396f78debbfe35adb8503c5e0000530ed58967cbc8e7d251`
- **Match:** YES (PASS)

## 3. Extracted File Inventory
Extracted successfully to: `D:\Disastra\AI\temp\chakravat_v1_inspection`
- `README.txt` (425 bytes)
- `artifacts\detector.pt` (45,733,813 bytes)
- `artifacts\ensemble_cone.joblib` (27,099,652 bytes)
- `artifacts\gru_forecaster.pt` (140,844 bytes)
- `artifacts\intensity_gridsat.pt` (111,355,947 bytes)
- `artifacts\intensity_vision.pt` (111,355,631 bytes)
- `artifacts\landfall_model.joblib` (2,009,792 bytes)
- `artifacts\prediction_models.joblib` (3,505,733 bytes)
- `artifacts\scene_classifier.pt` (111,367,983 bytes)

## 4. Model Files Discovered
- `detector.pt`
- `ensemble_cone.joblib`
- `gru_forecaster.pt`
- `intensity_gridsat.pt`
- `intensity_vision.pt`
- `landfall_model.joblib`
- `prediction_models.joblib`
- `scene_classifier.pt`

## 5. Identified Cyclone Detector
- **Detector File:** `artifacts\detector.pt`

## 6. Framework
- **Framework Type:** PyTorch custom model (state_dict only).
- It is NOT a full Ultralytics YOLO checkpoint or YOLOv5 checkpoint object.

## 7. Checkpoint Structural Verification
- **detector.pt:** Contains a standard PyTorch `state_dict`. Successfully loaded into memory via `torch.load()`.
- **gru_forecaster.pt:** Failed to load due to `weights_only` strictness regarding numpy multiarrays, but clearly a PyTorch file.
- **Other .pt files:** Structurally valid `state_dict` dictionaries.

## 8. Compatibility with Disastra
- **Ultralytics Compatible:** NO
- **Direct Drop-in Replacement:** NO. The `detector.pt` file cannot be directly loaded using `ultralytics.YOLO()`. 
- **Inference Ready:** NO. Loading this model requires the exact Python architecture definition (classes, layers) from the Chakravat repository to instantiate the model before calling `.load_state_dict()`.

## 9. Exact Next Step
- Do NOT attempt to run inference yet.
- We must acquire the original `Chakravat-cycldtc` source code / repository to obtain the architecture definitions required to reconstruct the PyTorch model and load the `state_dict`.

## 10. Safety Status
- MODEL MODIFIED: NO
- DATASET MODIFIED: NO
- TRAINING: NOT PERFORMED
- RETRAINING: NOT PERFORMED
- AUGMENTATION: NOT PERFORMED
- FAKE INFERENCE: NO
- FAKE RESULTS: NO
- EXISTING MODELS: UNCHANGED
