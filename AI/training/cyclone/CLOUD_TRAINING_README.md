# Disastra Cyclone Cloud Training Workflow

This document provides a high-level overview of the entire cloud GPU training pipeline for the Disastra Cyclone YOLO model, decoupling the process from Google Colab or Kaggle.

## The Complete Pipeline

```text
LOCAL DATASET
      ↓
ROBOFLOW / ULTRALYTICS CLOUD
      ↓
GPU TRAINING
      ↓
best.pt
      ↓
LOCAL MODEL VALIDATION
      ↓
DISASTRA BACKEND INTEGRATION
```

## Status
**Cloud training has NOT been started.** 

The dataset has been completely audited and confirmed intact (242 images, 6 exact classes). All configuration scripts and documentation files have been prepared. The project is awaiting the user to manually upload the dataset to their chosen platform (Roboflow or Ultralytics Cloud) and launch the training via the provided `cyclone_cloud_train.py` script or the platform's native interface.

For step-by-step instructions on each platform, refer to:
- `ROBOFLOW_TRAINING.md`
- `ULTRALYTICS_CLOUD_TRAINING.md`

For integration details after training completes, refer to:
- `CYCLONE_MODEL_INTEGRATION.md`
