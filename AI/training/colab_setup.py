"""
colab_setup.py
==============
Setup and helper utilities for running Disastra flood-segmentation
training in Google Colab.

HOW TO USE IN COLAB
-------------------
1. Mount Google Drive (optional, for persistent storage):

    from google.colab import drive
    drive.mount("/content/drive")

2. Upload train_disastra.py and colab_setup.py to /content/.

3. Run setup once:

    import colab_setup
    colab_setup.run_setup()

4. Launch training:

    colab_setup.launch_training(
        script_path="/content/train_disastra.py",
        data="/content/disastra_flood.yaml",
        epochs=50,
        batch=16,
        device="0",
    )

NOTES
-----
- No secrets or API keys are stored here.
- Update the dataset YAML path to the Colab-local path before training.
- GPU access requires: Runtime -> Change runtime type -> T4 GPU.
"""

import os
import subprocess
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Package installation
# ---------------------------------------------------------------------------

REQUIRED_PACKAGES = [
    "ultralytics",
    "torch",
    "torchvision",
    "pyyaml",
    "matplotlib",
    "seaborn",
    "pandas",
    "numpy",
    "Pillow",
    "tqdm",
    "psutil",
]


def install_packages(packages=None):
    """
    Install required Python packages using pip.

    Parameters
    ----------
    packages : list of package names. Defaults to REQUIRED_PACKAGES.
    """
    if packages is None:
        packages = REQUIRED_PACKAGES
    print("[colab_setup] Installing required packages ...")
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "--quiet", "--upgrade"] + packages
    )
    print("[colab_setup] Packages installed.")


# ---------------------------------------------------------------------------
# GPU verification
# ---------------------------------------------------------------------------

def check_gpu():
    """
    Print CUDA / GPU availability info.

    Returns True if a CUDA GPU is available, False otherwise.
    """
    import torch

    print("[colab_setup] GPU / CUDA check")
    print("-" * 40)
    if torch.cuda.is_available():
        device_name  = torch.cuda.get_device_name(0)
        device_count = torch.cuda.device_count()
        total_mem    = torch.cuda.get_device_properties(0).total_memory / 1024 ** 3
        print("  CUDA available  : YES")
        print("  Device          : " + device_name)
        print("  Device count    : " + str(device_count))
        print("  Total VRAM      : " + str(round(total_mem, 1)) + " GB")
        print("  PyTorch version : " + torch.__version__)
        return True
    else:
        print("  CUDA available  : NO")
        print("  [WARNING] No GPU detected. Training will be very slow.")
        print("  Go to Runtime -> Change runtime type -> Hardware Accelerator -> GPU")
        return False


# ---------------------------------------------------------------------------
# Dataset YAML helper
# ---------------------------------------------------------------------------

def prepare_dataset_yaml(source_yaml, colab_dataset_root, output_yaml="/content/disastra_flood.yaml"):
    """
    Generate a Colab-local copy of the Disastra dataset YAML with updated paths.

    Parameters
    ----------
    source_yaml         : Original YAML path (may be from Google Drive).
    colab_dataset_root  : Absolute path to dataset root on Colab.
    output_yaml         : Path where the updated YAML will be written.

    Returns
    -------
    Absolute path to the newly written YAML file (str).
    """
    import yaml

    source_yaml = Path(source_yaml)
    if not source_yaml.exists():
        raise FileNotFoundError(
            "Source dataset YAML not found: " + str(source_yaml) + ". "
            "Upload or mount the dataset before calling prepare_dataset_yaml()."
        )

    with open(source_yaml, "r") as fh:
        cfg = yaml.safe_load(fh)

    cfg["path"] = colab_dataset_root

    out = Path(output_yaml)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w") as fh:
        yaml.dump(cfg, fh, default_flow_style=False, allow_unicode=True)

    print("[colab_setup] Dataset YAML written to : " + str(out))
    print("[colab_setup] Dataset root set to     : " + colab_dataset_root)
    return str(out)


# ---------------------------------------------------------------------------
# Checkpoint helper
# ---------------------------------------------------------------------------

def ensure_model_checkpoint(model_name="yolov8n-seg.pt"):
    """
    Ensure the pretrained YOLO segmentation checkpoint is available.

    Ultralytics downloads the checkpoint automatically on first use.

    Parameters
    ----------
    model_name : Model file name (e.g. yolov8n-seg.pt).

    Returns
    -------
    The model name (str).
    """
    from ultralytics import YOLO

    print("[colab_setup] Ensuring model checkpoint: " + model_name)
    _ = YOLO(model_name)
    print("[colab_setup] Model ready: " + model_name)
    return model_name


# ---------------------------------------------------------------------------
# Directory structure
# ---------------------------------------------------------------------------

def create_output_dirs(project="/content/runs/segment"):
    """
    Create the training output directory tree.

    Parameters
    ----------
    project : Root path for saving Ultralytics run folders.

    Returns
    -------
    Path object of the created directory.
    """
    p = Path(project)
    p.mkdir(parents=True, exist_ok=True)
    print("[colab_setup] Output directory ready: " + str(p))
    return p


# ---------------------------------------------------------------------------
# System info
# ---------------------------------------------------------------------------

def print_environment_info():
    """Print a summary of the Colab runtime environment."""
    import platform
    import torch

    print("=" * 50)
    print("  Colab Environment Information")
    print("=" * 50)
    print("  Python version  : " + sys.version.split()[0])
    print("  Platform        : " + platform.platform())

    try:
        import ultralytics
        print("  Ultralytics     : " + ultralytics.__version__)
    except ImportError:
        print("  Ultralytics     : not installed")

    print("  PyTorch         : " + torch.__version__)

    if torch.cuda.is_available():
        print("  CUDA version    : " + str(torch.version.cuda))
        print("  GPU             : " + torch.cuda.get_device_name(0))
    else:
        print("  CUDA            : unavailable")

    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,memory.total",
             "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=5,
        )
        if result.returncode == 0:
            print("  nvidia-smi      : " + result.stdout.strip())
    except Exception:
        pass

    print("=" * 50)


# ---------------------------------------------------------------------------
# One-shot convenience function
# ---------------------------------------------------------------------------

def run_setup(
    install=True,
    colab_dataset_root=None,
    source_yaml=None,
    output_yaml="/content/disastra_flood.yaml",
    model_name="yolov8n-seg.pt",
    project="/content/runs/segment",
):
    """
    Run the full Colab environment setup in one call.

    Parameters
    ----------
    install              : Install required Python packages.
    colab_dataset_root   : Dataset root path on Colab.
    source_yaml          : Original dataset YAML path.
    output_yaml          : Target path for the Colab-local dataset YAML.
    model_name           : YOLO segmentation checkpoint to pre-fetch.
    project              : Training output root directory.

    Returns
    -------
    dict with keys: data_yaml, model, project, gpu_available.
    """
    if install:
        install_packages()

    print_environment_info()
    gpu_ok = check_gpu()
    create_output_dirs(project)

    data_yaml = output_yaml
    if source_yaml and colab_dataset_root:
        data_yaml = prepare_dataset_yaml(source_yaml, colab_dataset_root, output_yaml)

    ensure_model_checkpoint(model_name)

    print("[colab_setup] Setup complete.")
    print("  Dataset YAML : " + data_yaml)
    print("  Model        : " + model_name)
    print("  Project dir  : " + project)
    print("  GPU ready    : " + str(gpu_ok))

    return {
        "data_yaml"    : data_yaml,
        "model"        : model_name,
        "project"      : project,
        "gpu_available": gpu_ok,
    }


# ---------------------------------------------------------------------------
# Training launcher helper
# ---------------------------------------------------------------------------

def launch_training(
    script_path="train_disastra.py",
    model="yolov8n-seg.pt",
    data="/content/disastra_flood.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    device="0",
    project="/content/runs/segment",
    name="disastra_flood_seg",
    workers=2,
    extra_args=None,
):
    """
    Launch training via subprocess for use from a Colab notebook cell.

    Parameters
    ----------
    script_path : Path to train_disastra.py in the Colab session.
    model       : Pretrained segmentation checkpoint.
    data        : Colab-local dataset YAML path.
    epochs      : Training epochs.
    imgsz       : Image size.
    batch       : Batch size.
    device      : Device string.
    project     : Output root directory.
    name        : Experiment name.
    workers     : DataLoader workers.
    extra_args  : Additional CLI flags as a list of strings.
    """
    cmd = [
        sys.executable, script_path,
        "--model",   model,
        "--data",    data,
        "--epochs",  str(epochs),
        "--imgsz",   str(imgsz),
        "--batch",   str(batch),
        "--device",  device,
        "--project", project,
        "--name",    name,
        "--workers", str(workers),
    ]
    if extra_args:
        cmd.extend(extra_args)

    print("[colab_setup] Launching training ...")
    print("  Command: " + " ".join(cmd))
    subprocess.run(cmd, check=True)

