"""
Disastra — Flood Segmentation Inference Script
================================================
Runs YOLOv8 instance segmentation inference on a single image.

Usage:
    python predict.py --model D:/Disastra/AI/models/best.pt --image path/to/image.jpg

    Optional:
        --output-dir   Directory where annotated results are saved (default: D:/Disastra/AI/results)
        --conf         Confidence threshold (default: 0.25)
        --device       Device to use: cpu | 0 | cuda (default: cpu)

NOTE:
    - The original input image is NEVER modified.
    - All outputs (annotated image + mask data) go to --output-dir.
    - model training is NOT performed here. Supply a pre-trained best.pt.
"""

import argparse
import sys
import os
from pathlib import Path
from datetime import datetime


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Disastra Flood Segmentation — YOLO Inference",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--model",
        type=str,
        default=r"D:\Disastra\AI\models\best.pt",
        help="Path to the trained YOLO segmentation model (.pt file).",
    )
    parser.add_argument(
        "--image",
        type=str,
        required=True,
        help="Path to the input image for inference.",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=r"D:\Disastra\AI\results",
        help="Directory where results (annotated image + masks) will be saved.",
    )
    parser.add_argument(
        "--conf",
        type=float,
        default=0.25,
        help="Confidence threshold for detections (0.0–1.0). Default: 0.25",
    )
    parser.add_argument(
        "--device",
        type=str,
        default="cpu",
        help="Inference device: 'cpu', '0' (GPU 0), 'cuda', etc. Default: cpu",
    )
    return parser.parse_args()


def validate_paths(model_path: Path, image_path: Path) -> None:
    """Abort early with helpful messages if required files are missing."""
    if not model_path.exists():
        print(f"\n[ERROR] Model file not found: {model_path}")
        print("  → Train the Disastra model first and place best.pt in:")
        print(f"    {model_path}")
        print("  → Model training is not implemented in this script.")
        sys.exit(1)

    if not image_path.exists():
        print(f"\n[ERROR] Input image not found: {image_path}")
        sys.exit(1)

    if not image_path.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}:
        print(f"\n[WARNING] Unusual file extension for image: {image_path.suffix}")
        print("  → Proceeding, but inference may fail on unsupported formats.")


def save_mask_data(results, output_dir: Path, stem: str) -> None:
    """
    Persist segmentation mask tensors as .txt files (normalised polygon coords).
    Each line: class_id x1 y1 x2 y2 … (same format as YOLO seg labels).
    """
    import numpy as np

    masks_dir = output_dir / "masks"
    masks_dir.mkdir(parents=True, exist_ok=True)

    mask_txt_path = masks_dir / f"{stem}_masks.txt"
    written = 0

    for result in results:
        if result.masks is None:
            continue

        # result.masks.xy  → list of (N, 2) numpy arrays in pixel coords
        img_h, img_w = result.orig_shape

        with open(mask_txt_path, "w") as f:
            for seg_idx, (cls_tensor, conf_tensor, xy_array) in enumerate(
                zip(result.boxes.cls, result.boxes.conf, result.masks.xy)
            ):
                cls_id = int(cls_tensor.item())
                conf = float(conf_tensor.item())

                # Normalise to [0, 1]
                xy_norm = xy_array.copy().astype(float)
                xy_norm[:, 0] /= img_w
                xy_norm[:, 1] /= img_h

                coords_flat = " ".join(f"{v:.6f}" for v in xy_norm.flatten())
                f.write(f"{cls_id} {coords_flat}  # conf={conf:.4f}\n")
                written += 1

    if written:
        print(f"  [Masks] Polygon data saved → {mask_txt_path}")
    else:
        print("  [Masks] No segmentation masks found in results (masks=None).")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    args = parse_args()

    model_path = Path(args.model).resolve()
    image_path = Path(args.image).resolve()
    output_dir = Path(args.output_dir).resolve()

    print("=" * 60)
    print("  Disastra — Flood Segmentation Inference")
    print("=" * 60)
    print(f"  Model      : {model_path}")
    print(f"  Image      : {image_path}")
    print(f"  Output dir : {output_dir}")
    print(f"  Conf thresh: {args.conf}")
    print(f"  Device     : {args.device}")
    print("=" * 60)

    # --- Validate inputs before loading anything heavy ---
    validate_paths(model_path, image_path)

    # --- Import YOLO (done here so --help works without torch installed) ---
    try:
        from ultralytics import YOLO
    except ImportError:
        print("\n[ERROR] 'ultralytics' package is not installed.")
        print("  Install it with:  pip install ultralytics")
        sys.exit(1)

    # --- Load model ---
    print("\n[1/4] Loading model …")
    model = YOLO(str(model_path))
    print(f"  Task : {model.task}")
    print(f"  Model: {model.info()}")

    # --- Run inference ---
    print("\n[2/4] Running segmentation inference …")
    results = model.predict(
        source=str(image_path),
        conf=args.conf,
        device=args.device,
        save=False,          # We handle saving ourselves
        verbose=False,
    )

    # --- Print detection summary ---
    print("\n[3/4] Detection results:")
    total_instances = 0

    for result in results:
        n = len(result.boxes) if result.boxes is not None else 0
        total_instances += n

        if n == 0:
            print("  → No flood instances detected above confidence threshold.")
            continue

        class_names = result.names  # {id: name}

        for i, (cls_tensor, conf_tensor) in enumerate(
            zip(result.boxes.cls, result.boxes.conf)
        ):
            cls_id   = int(cls_tensor.item())
            cls_name = class_names.get(cls_id, f"class_{cls_id}")
            conf     = float(conf_tensor.item())
            print(f"  [{i+1:02d}] class='{cls_name}'  confidence={conf:.4f}")

    print(f"\n  ▶ Total flood instances detected: {total_instances}")

    # --- Save annotated image ---
    print("\n[4/4] Saving outputs …")
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    stem = image_path.stem
    annotated_filename = f"{stem}_predicted_{timestamp}.jpg"
    annotated_path = output_dir / annotated_filename

    for result in results:
        # result.plot() returns an annotated BGR numpy array — original untouched
        annotated_bgr = result.plot()

        # Save via OpenCV
        try:
            import cv2
            cv2.imwrite(str(annotated_path), annotated_bgr)
            print(f"  [Annotated] Saved → {annotated_path}")
        except ImportError:
            print("[WARNING] OpenCV not installed; falling back to PIL for saving.")
            from PIL import Image as PILImage
            import numpy as np
            annotated_rgb = annotated_bgr[:, :, ::-1]  # BGR → RGB
            PILImage.fromarray(annotated_rgb).save(str(annotated_path))
            print(f"  [Annotated] Saved (via PIL) → {annotated_path}")

    # --- Save mask polygon data ---
    save_mask_data(results, output_dir, stem)

    print("\n" + "=" * 60)
    print(f"  ✓ Inference complete.")
    print(f"  ✓ {total_instances} flood instance(s) detected.")
    print(f"  ✓ Results saved to: {output_dir}")
    print("=" * 60)


if __name__ == "__main__":
    main()
