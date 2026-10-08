# Disastra – Flood Instance Segmentation Training

YOLOv8 instance segmentation training pipeline for the **Disastra** hackathon project.

---

## Files

| File | Purpose |
|---|---|
| `train_disastra.py` | Main training script (CLI + importable) |
| `colab_setup.py` | Colab environment setup utilities |
| `README.md` | This document |

---

## Required Packages

```
ultralytics>=8.0
torch
torchvision
pyyaml
matplotlib
seaborn
pandas
numpy
Pillow
tqdm
psutil
```

Install locally (in your virtual environment):

```bash
pip install ultralytics torch torchvision
```

---

## Dataset Configuration

| Field | Value |
|---|---|
| YAML path | `D:/Disastra/AI/datasets/disastra_flood.yaml` |
| Task | **segmentation** (instance segmentation / polygon) |
| Classes | 1 (`flood`) |
| Train images | 4,810 |
| Validation images | 320 |
| Test images | 107 |
| Annotation format | YOLOv8 polygon / instance mask |

**Do not modify** `disastra_flood.yaml`, `data.yaml`, images, or labels.

---

## Task

```
task = segmentation
```

This pipeline trains a **YOLOv8 instance segmentation** model.  
Detection-only models (`yolov8n.pt`, etc.) are **not** used.  
Only `*-seg.pt` checkpoints are valid (e.g. `yolov8n-seg.pt`).

---

## How to Run — Local (Dry-Run / Validation)

Verify the configuration without starting training:

```bash
cd D:\Disastra
python AI\training\train_disastra.py --dry-run
```

Or with a custom checkpoint:

```bash
python AI\training\train_disastra.py \
  --model yolov8s-seg.pt \
  --dry-run
```

---

## How to Run — Local Training (CPU only, not recommended)

> ⚠️ CPU training is extremely slow. Use Google Colab for GPU training.

```bash
python AI\training\train_disastra.py \
  --model   yolov8n-seg.pt \
  --data    "D:/Disastra/AI/datasets/disastra_flood.yaml" \
  --epochs  50 \
  --imgsz   640 \
  --batch   8 \
  --device  cpu \
  --project "D:/Disastra/AI/training/runs/segment" \
  --name    disastra_flood_seg \
  --workers 0
```

---

## How to Run — Google Colab (Recommended)

### Step 1 – Runtime setup

1. Open Google Colab: https://colab.research.google.com
2. **Runtime → Change runtime type → Hardware Accelerator → GPU (T4)**
3. Confirm with **Save**

### Step 2 – Upload files

Upload to Colab (`/content/`):
- `train_disastra.py`
- `colab_setup.py`
- The entire `datasets/` folder (or mount from Google Drive)
- `disastra_flood.yaml` (or create a Colab-local copy with `colab_setup.prepare_dataset_yaml`)

### Step 3 – Install dependencies

```python
import colab_setup
colab_setup.install_packages()
```

Or directly in a cell:

```bash
!pip install -q ultralytics
```

### Step 4 – Verify GPU

```python
colab_setup.check_gpu()
```

Expected output:
```
CUDA available : YES
Device         : Tesla T4
Total VRAM     : 15.8 GB
```

### Step 5 – Prepare dataset YAML (if dataset is on Drive)

```python
colab_setup.prepare_dataset_yaml(
    source_yaml="/content/drive/MyDrive/Disastra/AI/datasets/disastra_flood.yaml",
    colab_dataset_root="/content/drive/MyDrive/Disastra/AI/datasets",
    output_yaml="/content/disastra_flood.yaml",
)
```

### Step 6 – Run training

**Option A – via subprocess (recommended from notebook):**

```python
colab_setup.launch_training(
    script_path="/content/train_disastra.py",
    model="yolov8n-seg.pt",
    data="/content/disastra_flood.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    device="0",
    project="/content/runs/segment",
    name="disastra_flood_seg",
    workers=2,
)
```

**Option B – shell command in a cell:**

```bash
!python /content/train_disastra.py \
  --model   yolov8n-seg.pt \
  --data    /content/disastra_flood.yaml \
  --epochs  50 \
  --imgsz   640 \
  --batch   16 \
  --device  0 \
  --project /content/runs/segment \
  --name    disastra_flood_seg \
  --workers 2
```

**Option C – import and call directly:**

```python
import sys
sys.path.insert(0, "/content")

from train_disastra import train

train(
    model="yolov8n-seg.pt",
    data="/content/disastra_flood.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    device="0",
    project="/content/runs/segment",
    name="disastra_flood_seg",
    workers=2,
)
```

---

## Training Parameters

| Parameter | CLI flag | Default | Description |
|---|---|---|---|
| Model | `--model` | `yolov8n-seg.pt` | Pretrained *-seg checkpoint |
| Dataset YAML | `--data` | `D:/Disastra/AI/datasets/disastra_flood.yaml` | Dataset config |
| Epochs | `--epochs` | `50` | Total training epochs |
| Image size | `--imgsz` | `640` | Input resolution (px) |
| Batch size | `--batch` | `16` | Training batch size |
| Device | `--device` | `0` | `0`=first GPU, `cpu`=CPU |
| Project dir | `--project` | `D:/Disastra/AI/training/runs/segment` | Output root |
| Run name | `--name` | `disastra_flood_seg` | Experiment sub-folder |
| Workers | `--workers` | `4` | DataLoader processes |
| Resume | `--resume` | `False` | Resume from last.pt |
| Exist-ok | `--exist-ok` | `False` | Allow overwriting run dir |
| Dry-run | `--dry-run` | `False` | Validate only, no training |

### Checkpoint size recommendations

| Checkpoint | Parameters | Recommended for |
|---|---|---|
| `yolov8n-seg.pt` | ~3 M | Fastest training, prototyping |
| `yolov8s-seg.pt` | ~11 M | Balanced speed/accuracy |
| `yolov8m-seg.pt` | ~27 M | Higher accuracy |
| `yolov8l-seg.pt` | ~46 M | High accuracy (more VRAM) |
| `yolov8x-seg.pt` | ~70 M | Best accuracy (most VRAM) |

---

## Expected Output

After training completes, the run directory contains:

```
runs/segment/disastra_flood_seg/
├── weights/
│   ├── best.pt          ← Best model (use this for inference)
│   └── last.pt          ← Final epoch checkpoint
├── results.csv          ← Per-epoch metrics
├── results.png          ← Training curves plot
├── confusion_matrix.png
├── PR_curve.png
├── F1_curve.png
└── val_batch*.jpg       ← Validation prediction samples
```

---

## Retrieving best.pt

### From Colab to your local machine

**Option A – Download via Colab UI:**

```python
from google.colab import files
files.download("/content/runs/segment/disastra_flood_seg/weights/best.pt")
```

**Option B – Copy to Google Drive:**

```python
import shutil
shutil.copy(
    "/content/runs/segment/disastra_flood_seg/weights/best.pt",
    "/content/drive/MyDrive/Disastra/AI/models/best_flood_seg.pt"
)
```

**Option C – Shell command:**

```bash
!cp /content/runs/segment/disastra_flood_seg/weights/best.pt \
    /content/drive/MyDrive/Disastra/AI/models/
```

### Local training output

If trained locally, `best.pt` will be at:

```
D:\Disastra\AI\training\runs\segment\disastra_flood_seg\weights\best.pt
```

---

## Validation

After training, Ultralytics automatically runs validation on the `valid` split.
To run validation independently on the test split:

```python
from ultralytics import YOLO

model = YOLO("path/to/best.pt")
metrics = model.val(
    data="D:/Disastra/AI/datasets/disastra_flood.yaml",
    split="test",
)
print(metrics)
```

---

## Important Notes

- **Never modify** the source dataset (`datasets/` folder, YAML files, images, or labels).
- The `--dry-run` flag lets you validate configuration without starting training.
- On CPU, training will be prompted with a confirmation before starting.
- The script uses `if __name__ == "__main__":` guard — importing it never starts training.
