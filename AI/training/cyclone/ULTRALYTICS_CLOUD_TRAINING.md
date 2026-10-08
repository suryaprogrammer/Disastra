# Ultralytics Cloud Training Preparation

This document explains how to utilize Ultralytics Cloud/HUB for the Disastra Cyclone model training.

## Dataset Upload
1. Package the dataset into a ZIP file (e.g., `Cyclone.zip`).
2. Upload the dataset directly to Ultralytics HUB via the web interface or API.

## Dataset Configuration
- Ultralytics HUB natively understands `data.yaml` files. It will map the `train/`, `valid/`, and `test/` splits automatically.
- Total Images: 242
- Classes: 6 (`CS`, `Cyclone-Eye`, `D`, `DD`, `SCS`, `VSCS`)

## Model Selection
- We are aiming to use the `yolo26s.pt` model.
- **REQUIRES CONFIRMATION:** YOLO26 Small compatibility requires confirmation in the selected Roboflow/Ultralytics cloud workflow. If HUB strictly enforces standard version lists (v8, v9, v10), you must ensure `yolo26s.pt` is fully supported as a custom weights file.

## GPU Selection
Select a cloud-instance with a dedicated GPU (e.g., NVIDIA Tesla T4 or better). This dramatically reduces training time.

## Training Parameters
Recommended configuration for HUB:
- Epochs: 50
- Image Size (imgsz): 640
- Batch Size: 16
- Patience (Early Stopping): 10
- Pretrained: True (Start from pre-existing weights rather than from scratch).

## Checkpoint Saving
During training, Ultralytics automatically handles saving `best.pt` (weights that yield the highest validation metrics) and `last.pt` (the final epoch weights).

## Validation
Validation runs automatically after every training epoch against the `valid/` split to calculate mAP50, mAP50-95, Precision, and Recall.

## Test Evaluation
Once training is finalized, the model should be evaluated against the unseen `test/` split.

## Model Export/Download
Upon successful training, the `best.pt` file can be downloaded directly from the Ultralytics HUB dashboard for local integration.
