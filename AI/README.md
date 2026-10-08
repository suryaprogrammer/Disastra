# Disastra — AI Module

> **Hackathon project — Flood instance segmentation using YOLOv8**

---

## ⚠️ Important Notice

> **Model training is NOT implemented yet.**
> The Disastra custom model (`best.pt`) has not been trained.
> All inference scripts are ready and waiting for a trained model file.
> Place `best.pt` at `D:\Disastra\AI\models\best.pt` when available.

---

## Dataset

| Property         | Value |
|------------------|-------|
| Location         | `D:\Disastra\AI\datasets\` |
| Config file      | `D:\Disastra\AI\datasets\disastra_flood.yaml` |
| Train images     | 4,810 |
| Validation images| 320 |
| Test images      | 107 |
| **Total images** | **5,237** |
| Missing labels   | 0 |
| Empty labels     | 0 |
| Corrupted images | 0 |
| Classes          | 1 |
| Class name       | `flood` |
| Annotation type  | YOLOv8 instance segmentation / polygon format |

### Dataset Rules

- **DO NOT** modify, rename, move, or delete any files under `datasets/`.
- **DO NOT** modify `data.yaml` or `disastra_flood.yaml`.
- The original Roboflow dataset must remain untouched at all times.

---

## Segmentation Approach

Disastra uses **YOLOv8 instance segmentation** (polygon masks) to:

1. Detect individual flood regions within an image.
2. Produce per-instance segmentation masks (polygon contours).
3. Report class name (`flood`) and confidence for each detection.
4. Save annotated images and mask data without touching the originals.

The model is trained from a Roboflow-exported dataset with 5,237 images
and YOLOv8-format polygon labels (`.txt` files alongside each image).

---

## Folder Structure

```
D:\Disastra\AI\
│
├── datasets\                    ← Original Roboflow dataset (DO NOT TOUCH)
│   ├── train\images\            ← 4,810 training images
│   ├── train\labels\            ← Matching polygon labels
│   ├── valid\images\            ← 320 validation images
│   ├── valid\labels\
│   ├── test\images\             ← 107 test images
│   ├── test\labels\
│   ├── data.yaml                ← Roboflow-generated config (DO NOT TOUCH)
│   └── disastra_flood.yaml      ← Project dataset config (DO NOT TOUCH)
│
├── models\                      ← Trained model weights (place best.pt here)
│   └── best.pt                  ← ⬅ NOT YET AVAILABLE
│
├── inference\
│   └── predict.py               ← Inference script (YOLO segmentation)
│
├── scripts\
│   ├── test_environment.py      ← Environment verification
│   └── select_sample.py         ← Sample image selection utility
│
├── training\                    ← Training outputs (runs/, logs, etc.)
│   └── runs\
│
├── results\                     ← Inference output (annotated images, masks)
│   └── samples\                 ← Sample images copied for testing
│
├── tests\                       ← Future unit/integration tests
│
└── README.md                    ← This file
```

---

## How to Run — Environment Verification

Verify that all required packages and directories are present:

```bash
cd D:\Disastra\AI
python scripts\test_environment.py
```

**Expected output:**

```
LOCAL ENVIRONMENT STATUS
  [PASS]  Python version
  [PASS]  PyTorch
  [PASS]  Ultralytics (YOLO)
  [PASS]  OpenCV (cv2)
  [PASS]  YOLO class import
  [PASS]  Dataset config (disastra_flood.yaml)
  [PASS]  Directory: datasets/train
  ...

  ✓  PASS  (N/N checks passed)
```

---

## How to Run — Sample Image Selection

Copy a few test images into `results\samples` for quick inspection:

```bash
# Default: 5 random images
python scripts\select_sample.py

# Pick 10 images, evenly spread across the test set
python scripts\select_sample.py --count 10 --mode spread

# Always pick the same images (reproducible)
python scripts\select_sample.py --count 5 --mode random --seed 123
```

| Option   | Default  | Description |
|----------|----------|-------------|
| `--count`| `5`      | Number of images to copy |
| `--mode` | `random` | `random` / `first` / `spread` |
| `--seed` | `42`     | Random seed (for `random` mode) |

---

## How to Run — Inference (Future)

> **Requires a trained model at `D:\Disastra\AI\models\best.pt`**

```bash
# Single image
python inference\predict.py \
    --model  D:\Disastra\AI\models\best.pt \
    --image  D:\Disastra\AI\results\samples\<image>.jpg

# Custom confidence threshold
python inference\predict.py \
    --model  models\best.pt \
    --image  results\samples\<image>.jpg \
    --conf   0.4

# GPU inference
python inference\predict.py \
    --model  models\best.pt \
    --image  results\samples\<image>.jpg \
    --device 0
```

### Inference Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Annotated image | `results\<name>_predicted_<timestamp>.jpg` | Original + overlaid masks |
| Mask polygons   | `results\masks\<name>_masks.txt`           | Normalised polygon coords (YOLO format) |

---

## Required Python Packages

```bash
pip install ultralytics torch opencv-python-headless numpy Pillow
```

---

## Model Training — Status

| Item | Status |
|------|--------|
| Dataset prepared | ✅ Complete |
| Dataset verified | ✅ Complete (5,237 images, 0 errors) |
| Model architecture | YOLOv8-seg (to be selected) |
| Training script | 🔲 Not yet implemented |
| Trained model (`best.pt`) | 🔲 Not yet available |
| Inference script | ✅ Ready (`inference/predict.py`) |

---

## Quick-Start Checklist

```
[ ] Run: python scripts\test_environment.py   — verify all dependencies
[ ] Run: python scripts\select_sample.py       — copy sample images
[ ] Train the model (future task)              — produces models\best.pt
[ ] Run: python inference\predict.py ...       — run flood segmentation
```
