# -*- coding: utf-8 -*-
"""
Disastra — Local Environment Verification Script
=================================================
Checks all dependencies and directory structure required to run
YOLO segmentation inference for the Disastra flood detection project.

Usage:
    python test_environment.py

Reports PASS / NEEDS ATTENTION for each check and prints an overall status.
"""

import sys
import os
from pathlib import Path


# ---------------------------------------------------------------------------
# Colour helpers (cross-platform via ANSI — falls back gracefully on Windows)
# ---------------------------------------------------------------------------

def _ansi(code: str, text: str) -> str:
    """Wrap text in ANSI colour if stdout is a real terminal."""
    if sys.stdout.isatty():
        return f"\033[{code}m{text}\033[0m"
    return text


def green(t: str) -> str: return _ansi("92", t)
def red(t: str)   -> str: return _ansi("91", t)
def yellow(t: str)-> str: return _ansi("93", t)
def bold(t: str)  -> str: return _ansi("1",  t)


# ---------------------------------------------------------------------------
# Check helpers
# ---------------------------------------------------------------------------

PASS_LABEL    = "  [PASS]"
FAIL_LABEL    = "  [FAIL]"
WARN_LABEL    = "  [WARN]"
SKIP_LABEL    = "  [SKIP]"

results: list[tuple[str, bool, str]] = []   # (label, passed, detail)


def check(label: str, passed: bool, detail: str = "") -> bool:
    results.append((label, passed, detail))
    status = green(PASS_LABEL) if passed else red(FAIL_LABEL)
    detail_str = f"  → {detail}" if detail else ""
    print(f"{status}  {label}")
    if detail_str:
        print(f"         {detail_str}")
    return passed


def warn(label: str, detail: str = "") -> None:
    """A soft warning that doesn't count as a failure."""
    results.append((label, True, detail))   # treated as pass in summary
    detail_str = f"  → {detail}" if detail else ""
    print(f"{yellow(WARN_LABEL)}  {label}")
    if detail_str:
        print(f"         {detail_str}")


# ---------------------------------------------------------------------------
# Individual checks
# ---------------------------------------------------------------------------

def check_python_version() -> None:
    ver = sys.version_info
    full_ver = sys.version.split()[0]
    passed = ver >= (3, 8)
    detail = f"Python {full_ver}"
    if not passed:
        detail += "  (Python ≥ 3.8 required)"
    check("Python version", passed, detail)


def check_pytorch() -> None:
    try:
        import torch
        ver = torch.__version__
        cuda = torch.cuda.is_available()
        cuda_info = f"  CUDA available: {cuda}"
        if cuda:
            cuda_info += f"  (device: {torch.cuda.get_device_name(0)})"
        check("PyTorch", True, f"version {ver}{cuda_info}")
    except ImportError:
        check("PyTorch", False, "Not installed — run: pip install torch")


def check_ultralytics() -> None:
    try:
        import ultralytics
        ver = ultralytics.__version__
        check("Ultralytics (YOLO)", True, f"version {ver}")
    except ImportError:
        check("Ultralytics (YOLO)", False, "Not installed — run: pip install ultralytics")


def check_opencv() -> None:
    try:
        import cv2
        ver = cv2.__version__
        check("OpenCV (cv2)", True, f"version {ver}")
    except ImportError:
        check(
            "OpenCV (cv2)",
            False,
            "Not installed — run: pip install opencv-python-headless",
        )


def check_yolo_import() -> None:
    try:
        from ultralytics import YOLO  # noqa: F401
        check("YOLO class import", True, "from ultralytics import YOLO  ✓")
    except Exception as exc:
        check("YOLO class import", False, str(exc))


def check_numpy() -> None:
    try:
        import numpy as np
        check("NumPy", True, f"version {np.__version__}")
    except ImportError:
        check("NumPy", False, "Not installed — run: pip install numpy")


def check_pillow() -> None:
    try:
        from PIL import Image
        import PIL
        check("Pillow (PIL)", True, f"version {PIL.__version__}")
    except ImportError:
        warn("Pillow (PIL)", "Optional but recommended — pip install Pillow")


def check_dataset_config() -> None:
    yaml_path = Path(r"D:\Disastra\AI\datasets\disastra_flood.yaml")
    exists = yaml_path.exists()
    check(
        "Dataset config (disastra_flood.yaml)",
        exists,
        str(yaml_path) if exists else f"NOT FOUND at {yaml_path}",
    )

    if exists:
        # Optionally parse with PyYAML if available, else just read raw
        try:
            import yaml
            with open(yaml_path, "r") as f:
                cfg = yaml.safe_load(f)
            nc   = cfg.get("nc", "?")
            names = cfg.get("names", {})
            check(
                "Dataset YAML content",
                True,
                f"nc={nc}  names={names}",
            )
        except ImportError:
            # Fall back to raw read
            with open(yaml_path, "r") as f:
                content = f.read()
            passed = "nc:" in content and "flood" in content
            check("Dataset YAML content (raw check)", passed, "nc and flood class found" if passed else "Unexpected content")
        except Exception as exc:
            check("Dataset YAML content", False, str(exc))


def check_directories() -> None:
    base = Path(r"D:\Disastra\AI")

    dirs_required = {
        "datasets"         : base / "datasets",
        "datasets/train"   : base / "datasets" / "train" / "images",
        "datasets/valid"   : base / "datasets" / "valid" / "images",
        "datasets/test"    : base / "datasets" / "test"  / "images",
        "models"           : base / "models",
        "inference"        : base / "inference",
        "scripts"          : base / "scripts",
        "training"         : base / "training",
        "results"          : base / "results",
        "results/samples"  : base / "results" / "samples",
        "tests"            : base / "tests",
    }

    for label, path in dirs_required.items():
        check(f"Directory: {label}", path.exists(), str(path))


def check_model_file() -> None:
    model_path = Path(r"D:\Disastra\AI\models\best.pt")
    if model_path.exists():
        size_mb = model_path.stat().st_size / (1024 * 1024)
        check("Model file (best.pt)", True, f"{size_mb:.1f} MB  → {model_path}")
    else:
        warn(
            "Model file (best.pt)",
            "NOT YET AVAILABLE — train the Disastra model first; place best.pt at:\n"
            f"         {model_path}",
        )


def check_sample_images() -> None:
    test_img_dir = Path(r"D:\Disastra\AI\datasets\test\images")
    if test_img_dir.exists():
        images = list(test_img_dir.glob("*.jpg")) + list(test_img_dir.glob("*.png"))
        check(
            "Test images available",
            len(images) > 0,
            f"{len(images)} image(s) in {test_img_dir}",
        )
    else:
        check("Test images available", False, f"Directory not found: {test_img_dir}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    # Ensure UTF-8 output on Windows (avoids cp1252 UnicodeEncodeError)
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    print()
    print(bold("=" * 60))
    print(bold("  Disastra — Local Environment Verification"))
    print(bold("=" * 60))
    print()

    # --- Python & core packages ---
    print(bold("── Python & Core Packages ─────────────────────────────"))
    check_python_version()
    check_pytorch()
    check_ultralytics()
    check_opencv()
    check_numpy()
    check_pillow()
    print()

    # --- YOLO import ---
    print(bold("── YOLO Import ─────────────────────────────────────────"))
    check_yolo_import()
    print()

    # --- Dataset & file paths ---
    print(bold("── Dataset & Directory Structure ───────────────────────"))
    check_dataset_config()
    check_directories()
    print()

    # --- Optional model & data ---
    print(bold("── Model & Sample Data ─────────────────────────────────"))
    check_model_file()
    check_sample_images()
    print()

    # --- Summary ---
    passed   = sum(1 for _, ok, _ in results if ok)
    total    = len(results)
    failed   = [lbl for lbl, ok, _ in results if not ok]

    print(bold("=" * 60))
    print(bold("  LOCAL ENVIRONMENT STATUS"))
    print(bold("=" * 60))

    if not failed:
        print(green(f"  ✓  PASS  ({passed}/{total} checks passed)"))
    else:
        print(red(f"  ✗  NEEDS ATTENTION  ({passed}/{total} checks passed)"))
        print()
        print(red("  Failed checks:"))
        for lbl in failed:
            print(red(f"    • {lbl}"))

    print(bold("=" * 60))
    print()

    # Exit code: 0 = all pass, 1 = some failures
    sys.exit(0 if not failed else 1)


if __name__ == "__main__":
    main()
