# -*- coding: utf-8 -*-
"""
Disastra — Sample Image Selection Utility
==========================================
Copies a selection of sample images from the test dataset into
D:/Disastra/AI/results/samples for quick inspection and inference testing.

The ORIGINAL images in the dataset directory are NEVER modified or deleted.
Copies are placed in the output directory.

Usage:
    python select_sample.py [--count N] [--seed SEED] [--mode {random,first,spread}]

    --count   Number of samples to copy (default: 5)
    --seed    Random seed for reproducible selection (default: 42)
    --mode    Selection strategy:
                random  — pick N images at random  (default)
                first   — pick the first N images (alphabetical)
                spread  — pick N evenly spread across the full list
"""

import argparse
import shutil
import random
import sys
from pathlib import Path
from datetime import datetime


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SOURCE_DIR = Path(r"D:\Disastra\AI\datasets\test\images")
OUTPUT_DIR = Path(r"D:\Disastra\AI\results\samples")

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Disastra Sample Image Selection Utility",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--count",
        type=int,
        default=5,
        help="Number of sample images to copy (default: 5).",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducible selection (default: 42).",
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["random", "first", "spread"],
        default="random",
        help="Selection mode: random | first | spread (default: random).",
    )
    return parser.parse_args()


def gather_images(source_dir: Path) -> list[Path]:
    """Return all image files in source_dir sorted alphabetically."""
    if not source_dir.exists():
        print(f"[ERROR] Source directory not found: {source_dir}")
        sys.exit(1)

    images = sorted(
        p for p in source_dir.iterdir()
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    )

    if not images:
        print(f"[ERROR] No supported images found in: {source_dir}")
        sys.exit(1)

    return images


def select_images(images: list[Path], count: int, mode: str, seed: int) -> list[Path]:
    """Select 'count' images from 'images' using the given mode."""
    count = min(count, len(images))

    if mode == "first":
        return images[:count]

    elif mode == "spread":
        if count == 1:
            return [images[0]]
        step = (len(images) - 1) / (count - 1)
        indices = {round(i * step) for i in range(count)}
        return [images[i] for i in sorted(indices)][:count]

    else:  # random (default)
        rng = random.Random(seed)
        return sorted(rng.sample(images, count))


def copy_samples(selected: list[Path], output_dir: Path) -> list[Path]:
    """
    Copy selected images into output_dir.
    If a file with the same name already exists, it is overwritten.
    Returns list of destination paths.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    destinations = []

    for src in selected:
        dest = output_dir / src.name
        shutil.copy2(src, dest)   # copy2 preserves metadata; src is UNCHANGED
        destinations.append(dest)

    return destinations


def write_manifest(output_dir: Path, selected: list[Path], mode: str, seed: int) -> None:
    """Write a small text manifest recording what was copied and when."""
    manifest_path = output_dir / "sample_manifest.txt"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write("Disastra — Sample Selection Manifest\n")
        f.write("=" * 50 + "\n")
        f.write(f"Generated  : {timestamp}\n")
        f.write(f"Mode       : {mode}\n")
        f.write(f"Seed       : {seed}\n")
        f.write(f"Count      : {len(selected)}\n")
        f.write(f"Source dir : {SOURCE_DIR}\n")
        f.write(f"Output dir : {output_dir}\n")
        f.write("\nSelected images:\n")
        for p in selected:
            f.write(f"  {p.name}\n")

    print(f"  [Manifest] Written → {manifest_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    # Ensure UTF-8 output on Windows (avoids cp1252 UnicodeEncodeError)
    import io
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    args = parse_args()

    print()
    print("=" * 60)
    print("  Disastra — Sample Image Selection Utility")
    print("=" * 60)
    print(f"  Source dir : {SOURCE_DIR}")
    print(f"  Output dir : {OUTPUT_DIR}")
    print(f"  Count      : {args.count}")
    print(f"  Mode       : {args.mode}")
    print(f"  Seed       : {args.seed}")
    print("=" * 60)
    print()

    # --- Gather available images ---
    all_images = gather_images(SOURCE_DIR)
    print(f"[1/3] Found {len(all_images)} image(s) in source directory.")

    # --- Select ---
    selected = select_images(all_images, args.count, args.mode, args.seed)
    print(f"[2/3] Selected {len(selected)} image(s) using mode='{args.mode}':")
    for img in selected:
        print(f"  * {img.name}")

    # --- Copy (originals untouched) ---
    print(f"\n[3/3] Copying to: {OUTPUT_DIR}")
    destinations = copy_samples(selected, OUTPUT_DIR)
    for dest in destinations:
        size_kb = dest.stat().st_size / 1024
        print(f"  [OK] {dest.name}  ({size_kb:.1f} KB)")

    # --- Write manifest ---
    write_manifest(OUTPUT_DIR, selected, args.mode, args.seed)

    print()
    print("=" * 60)
    print(f"  [DONE] {len(destinations)} sample image(s) copied.")
    print(f"  [DONE] Originals in dataset are UNTOUCHED.")
    print(f"  [DONE] Samples saved to: {OUTPUT_DIR}")
    print("=" * 60)
    print()

    print("Next step — run inference on a sample:")
    print(
        f"  python D:\\Disastra\\AI\\inference\\predict.py"
        f" --model D:\\Disastra\\AI\\models\\best.pt"
        f" --image \"{destinations[0]}\""
    )
    print()


if __name__ == "__main__":
    main()
