"""
train_disastra.py
=================
GPU-ready YOLOv8 instance segmentation training script for the Disastra
flood detection project.

Usage (local):
    python train_disastra.py [OPTIONS]

Usage (Google Colab):
    See README.md for the full Colab workflow.

IMPORTANT:
    This script does NOT start training automatically.
    Training only runs when the script is executed directly or by calling train().
"""

import argparse
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants / Defaults
# ---------------------------------------------------------------------------

# Pretrained segmentation checkpoint (nano = fastest transfer learning).
# Swap to yolov8s-seg.pt / yolov8m-seg.pt for higher accuracy capacity.
DEFAULT_MODEL   = "yolov8n-seg.pt"
DEFAULT_DATA    = "D:/Disastra/AI/datasets/disastra_flood.yaml"
DEFAULT_EPOCHS  = 50
DEFAULT_IMGSZ   = 640
DEFAULT_BATCH   = 16
DEFAULT_DEVICE  = "0"          # first CUDA GPU; auto-falls back to cpu
DEFAULT_PROJECT = "D:/Disastra/AI/training/runs/segment"
DEFAULT_NAME    = "disastra_flood_seg"
DEFAULT_WORKERS = 4


# ---------------------------------------------------------------------------
# Argument parser
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    """Build and return the CLI argument parser."""
    p = argparse.ArgumentParser(
        prog="train_disastra.py",
        description=(
            "Disastra Flood Segmentation - YOLOv8 instance segmentation "
            "training script (GPU-ready, Colab-compatible)."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument(
        "--model", type=str, default=DEFAULT_MODEL,
        help=(
            "Pretrained YOLO segmentation checkpoint (.pt). "
            "Must be a *-seg model: yolov8n-seg.pt, yolov8s-seg.pt, "
            "yolov8m-seg.pt, yolov8l-seg.pt, yolov8x-seg.pt."
        ),
    )
    p.add_argument(
        "--data", type=str, default=DEFAULT_DATA,
        help="Path to the Disastra dataset YAML configuration file.",
    )
    p.add_argument(
        "--epochs", type=int, default=DEFAULT_EPOCHS,
        help="Total number of training epochs.",
    )
    p.add_argument(
        "--imgsz", type=int, default=DEFAULT_IMGSZ,
        help="Input image size in pixels (square).",
    )
    p.add_argument(
        "--batch", type=int, default=DEFAULT_BATCH,
        help="Batch size. Use -1 for Ultralytics auto-batch (requires CUDA).",
    )
    p.add_argument(
        "--device", type=str, default=DEFAULT_DEVICE,
        help=(
            "Training device: 0 = first CUDA GPU, cpu = CPU, "
            "0,1 = multi-GPU. Auto-falls back to cpu if CUDA is unavailable."
        ),
    )
    p.add_argument(
        "--project", type=str, default=DEFAULT_PROJECT,
        help="Root directory where training run folders are saved.",
    )
    p.add_argument(
        "--name", type=str, default=DEFAULT_NAME,
        help="Experiment / run name (sub-folder of --project).",
    )
    p.add_argument(
        "--workers", type=int, default=DEFAULT_WORKERS,
        help="Number of DataLoader worker processes.",
    )
    p.add_argument(
        "--resume", action="store_true", default=False,
        help="Resume training from the last saved checkpoint.",
    )
    p.add_argument(
        "--exist-ok", dest="exist_ok", action="store_true", default=False,
        help="Allow overwriting an existing run directory.",
    )
    p.add_argument(
        "--dry-run", dest="dry_run", action="store_true", default=False,
        help="Validate configuration and print parameters without training.",
    )
    return p


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def validate_environment() -> None:
    """Ensure required packages are importable."""
    missing = []
    for pkg in ("ultralytics", "torch"):
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)
    if missing:
        msg = "[ERROR] Missing required packages: " + ", ".join(missing)
        msg += " | Install with: pip install ultralytics torch"
        sys.exit(msg)


def validate_dataset(data_path: str) -> Path:
    """Verify the dataset YAML exists and return its resolved absolute Path."""
    p = Path(data_path)
    if not p.exists():
        msg = "[ERROR] Dataset YAML not found: " + str(p)
        msg += " | Ensure the dataset is prepared and the path is correct."
        sys.exit(msg)
    if p.suffix.lower() not in {".yaml", ".yml"}:
        sys.exit("[ERROR] Expected a .yaml/.yml file, got suffix: " + p.suffix)
    return p.resolve()


def validate_model_name(model_name: str) -> None:
    """Warn if the checkpoint does not look like a segmentation model."""
    if "seg" not in model_name.lower():
        print(
            "[WARNING] " + model_name + " does not appear to be a segmentation "
            "checkpoint. Ultralytics *-seg.pt variants are required for "
            "instance segmentation (e.g. yolov8n-seg.pt)."
        )


def resolve_device(requested: str) -> str:
    """
    Return the effective device string.

    Falls back to cpu with a warning when a CUDA device is requested
    but CUDA is not available.
    """
    import torch

    is_cuda_request = all(c.isdigit() or c in (",", " ") for c in requested.strip())
    if is_cuda_request and not torch.cuda.is_available():
        print(
            "[WARNING] CUDA device " + requested + " requested but CUDA is "
            "unavailable. Falling back to cpu. "
            "For GPU training run this script in Google Colab "
            "(Runtime -> Change runtime type -> T4 GPU)."
        )
        return "cpu"
    return requested


# ---------------------------------------------------------------------------
# Display helpers
# ---------------------------------------------------------------------------

def print_banner() -> None:
    print()
    print("=" * 62)
    print("  DISASTRA - Flood Instance Segmentation Training")
    print("  Engine : Ultralytics YOLOv8")
    print("  Task   : segmentation")
    print("=" * 62)


def print_config(args: argparse.Namespace, effective_device: str) -> None:
    import torch
    if torch.cuda.is_available():
        cuda_info = (
            "available - " + torch.cuda.get_device_name(0)
            + " (" + str(torch.cuda.device_count()) + " device(s))"
        )
    else:
        cuda_info = "unavailable"
    print()
    print("Training Configuration")
    print("-" * 42)
    print("  Model checkpoint : " + args.model)
    print("  Dataset YAML     : " + args.data)
    print("  Task             : segmentation")
    print("  Epochs           : " + str(args.epochs))
    print("  Image size       : " + str(args.imgsz) + " px")
    print("  Batch size       : " + str(args.batch))
    print("  Requested device : " + args.device)
    print("  Effective device : " + effective_device)
    print("  CUDA             : " + cuda_info)
    print("  Workers          : " + str(args.workers))
    print("  Project dir      : " + args.project)
    print("  Run name         : " + args.name)
    print("  Resume           : " + str(args.resume))
    print("  Exist-ok         : " + str(args.exist_ok))
    print()


# ---------------------------------------------------------------------------
# Core training function (callable independently of CLI)
# ---------------------------------------------------------------------------

def train(
    model=DEFAULT_MODEL,
    data=DEFAULT_DATA,
    epochs=DEFAULT_EPOCHS,
    imgsz=DEFAULT_IMGSZ,
    batch=DEFAULT_BATCH,
    device=DEFAULT_DEVICE,
    project=DEFAULT_PROJECT,
    name=DEFAULT_NAME,
    workers=DEFAULT_WORKERS,
    resume=False,
    exist_ok=False,
):
    """
    Load the pretrained segmentation model and start YOLOv8 training.

    This function is NOT called automatically on import.
    Call it explicitly or run the script from the command line.

    Parameters
    ----------
    model     : Pretrained segmentation checkpoint (*.pt or model name).
    data      : Absolute path to the Disastra dataset YAML.
    epochs    : Training epochs.
    imgsz     : Input image size in pixels.
    batch     : Batch size (-1 = auto).
    device    : Device string ('0', 'cpu', '0,1').
    project   : Root save directory.
    name      : Experiment name.
    workers   : DataLoader workers.
    resume    : Resume from last checkpoint.
    exist_ok  : Overwrite existing run folder.

    Returns
    -------
    Ultralytics training Results object.
    """
    from ultralytics import YOLO

    # 1. Load model
    print("[INFO] Loading pretrained segmentation model: " + model)
    yolo_model = YOLO(model)

    # 2. Resolve device
    effective_device = resolve_device(device)

    # 3. Create output directory
    Path(project).mkdir(parents=True, exist_ok=True)
    print("[INFO] Results will be saved to: " + project + "/" + name)

    # 4. Train
    print("[INFO] Starting training on device: " + effective_device)
    results = yolo_model.train(
        task="segment",       # instance segmentation -- required
        data=data,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=effective_device,
        project=project,
        name=name,
        workers=workers,
        resume=resume,
        exist_ok=exist_ok,
        save=True,            # save checkpoints
        save_period=5,        # checkpoint every 5 epochs
        val=True,             # run validation after training
        plots=True,           # generate training/validation plots
        verbose=True,
    )

    # 5. Post-training summary
    print()
    print("=" * 62)
    print("  Training complete!")
    print("=" * 62)
    run_dir = Path(project) / name
    best_pt = run_dir / "weights" / "best.pt"
    last_pt = run_dir / "weights" / "last.pt"
    print("  Results directory : " + str(run_dir))
    print("  Best model        : " + str(best_pt))
    print("  Last checkpoint   : " + str(last_pt))

    if best_pt.exists():
        print("[INFO] best.pt confirmed at: " + str(best_pt))
    else:
        candidates = sorted(Path(project).glob(name + "*/weights/best.pt"))
        if candidates:
            print("[INFO] best.pt found at: " + str(candidates[-1]))
        else:
            print("[WARNING] best.pt not found - check the run directory.")
    print()
    return results


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main() -> None:
    print_banner()
    validate_environment()

    parser = build_parser()
    args = parser.parse_args()

    # Validate dataset YAML existence
    resolved = validate_dataset(args.data)
    args.data = str(resolved)

    # Validate model name
    validate_model_name(args.model)

    # Resolve effective device
    effective_device = resolve_device(args.device)

    # Display configuration
    print_config(args, effective_device)

    # Dry-run mode: stop here
    if args.dry_run:
        print("[DRY-RUN] Configuration is valid. Training was NOT started.")
        print("[DRY-RUN] Remove --dry-run to begin training.")
        return

    # CPU guard
    if effective_device == "cpu":
        print("[WARNING] Training on CPU will be extremely slow.")
        print("[WARNING] It is strongly recommended to use Google Colab")
        print("[WARNING] with a GPU runtime (Runtime -> T4 GPU).")
        try:
            answer = input("Continue training on CPU? [y/N]: ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            answer = "n"
        if answer not in {"y", "yes"}:
            print("Training cancelled.")
            return

    train(
        model=args.model,
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=effective_device,
        project=args.project,
        name=args.name,
        workers=args.workers,
        resume=args.resume,
        exist_ok=args.exist_ok,
    )


# ---------------------------------------------------------------------------
# Guard -- training only runs when the script is EXECUTED, never on import.
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    main()

