# Cyclone Model Training — Disastra AI

This directory contains the Python scripts for validating GPU, dataset environment, and executing training for the Cyclone detection model.

## Target Environment
- **Platform**: Google Colab
- **Hardware**: NVIDIA Tesla T4 GPU
- **Framework**: Ultralytics YOLOv8 (Small model / yolov8s)
- **Classes**: 6 (`CS`, `Cyclone-Eye`, `D`, `DD`, `SCS`, `VSCS`)

## Google Colab Usage

Follow these exact steps to run training on Google Colab:

**STEP 1:**
Upload `Cyclone.zip` (located at `D:\Disastra\AI\datasets\Cyclone.zip`) to your Google Colab instance.

**STEP 2:**
Extract the dataset to `/content` by running the following command in a Colab cell:
```bash
!unzip -q Cyclone.zip -d /content/
```

**STEP 3:**
Verify the dataset structure was extracted correctly:
- `/content/Cyclone/train/images`
- `/content/Cyclone/train/labels`
- `/content/Cyclone/valid/images`
- `/content/Cyclone/valid/labels`
- `/content/Cyclone/test/images`
- `/content/Cyclone/test/labels`
- `/content/Cyclone/data.yaml`

**STEP 4:**
Install dependencies and run the smoke test. You can paste the contents of `cyclone_smoke_test.py` directly into a Colab cell, or upload the file and run it:
```bash
!pip install ultralytics PyYAML torch
!python cyclone_smoke_test.py
```

**STEP 5:**
If the smoke test passes successfully, run the full training. You can paste the contents of `cyclone_train.py` directly into a cell, or run:
```bash
!python cyclone_train.py
```

## Output Locations
- Smoke test runs: `/content/Disastra/AI/training/runs/cyclone/smoke_test/`
- Full training runs: `/content/Disastra/AI/training/runs/cyclone/train_run/weights/` (`best.pt`, `last.pt`)
