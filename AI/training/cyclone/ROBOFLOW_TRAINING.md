# Cyclone Training Preparation for Roboflow

This document explains how to integrate the verified Disastra Cyclone dataset into Roboflow for cloud-based object detection training.

## 1. Dataset Upload Procedure
1. Create an account or log into [Roboflow](https://app.roboflow.com).
2. Create a new Object Detection workspace and project.
3. Upload the `D:\Disastra\AI\datasets\Cyclone` folder or `Cyclone.zip` directly to Roboflow.
4. Roboflow will automatically parse the `data.yaml` and directory structure.

## 2. Dataset Structure Verification
Roboflow natively supports the YOLO folder structure (`train/`, `valid/`, `test/`). Ensure that the final Roboflow import reflects the expected totals (242 total images).

## 3. Class Verification
The dataset should reflect exactly 6 classes:
- `CS`
- `Cyclone-Eye`
- `D`
- `DD`
- `SCS`
- `VSCS`
Verify these classes in the Roboflow dataset health dashboard after upload.

## 4. Train/Valid/Test Split Verification
Roboflow should automatically detect the existing splits:
- Train: 169 images
- Valid: 49 images
- Test: 24 images

## 5. Recommended Image Size
- Resize: **640x640** (Stretch or Fit with padding, depending on original aspect ratios, YOLO natively scales).

## 6. Recommended Augmentation Policy
- Rotation: ±15 degrees (cyclones rotate, but map orientation matters).
- Flip: Horizontal/Vertical flip (use with caution if geographic features are included, but purely for cloud formations, it provides useful variance).
- Blur: Up to 1.5px (to simulate lower quality satellite captures).

## 7. Model Selection
- Target Architecture: **YOLOv8 Small** (Roboflow often maps YOLO models via Ultralytics).
- **REQUIRES CONFIRMATION:** Verify if Roboflow explicitly supports a custom model name like `yolo26s.pt`. Typically, Roboflow uses standard YOLO versions (v8, v9, v10). YOLO26 Small compatibility requires confirmation in the selected Roboflow/Ultralytics cloud workflow.

## 8. Training Configuration
When using Roboflow Train or exporting to a cloud GPU environment via Roboflow notebook:
- Epochs: 50
- Batch size: 16
- Image Size: 640
- Early stopping patience: 10
- Pretrained weights: True

## 9. Validation Procedure
Roboflow automatically provides a validation curve (mAP50, Precision, Recall) during training on the `valid` split.

## 10. Export/Download Procedure
If training externally, export the dataset from Roboflow in "YOLOv8" format. If trained in Roboflow, proceed to download the trained weights.

## 11. How to obtain trained weights
Download the `best.pt` file from the Roboflow Training dashboard or via the Roboflow pip package after a successful training run.

## 12. Disastra Integration
The `best.pt` file will be stored locally in `D:\Disastra\AI\training\runs\cyclone\weights\best.pt` for local backend deployment (see `CYCLONE_MODEL_INTEGRATION.md`).
