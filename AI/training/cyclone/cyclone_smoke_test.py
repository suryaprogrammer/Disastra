"""
Smoke test for Cyclone YOLO Object Detection
Intended to be run in Google Colab with NVIDIA Tesla T4 GPU
Can be pasted directly into Colab cells.
"""
import os
import sys
import torch
import yaml

def get_runs_dir():
    if os.path.exists("/content"):
        return "/content/Disastra/AI/training/runs/cyclone"
    return r"D:\Disastra\AI\training\runs\cyclone"

def find_dataset_path():
    possible_paths = [
        "/content/Cyclone",
        "/content/Disastra/AI/datasets/Cyclone",
        "/content/drive/MyDrive/Disastra/AI/datasets/Cyclone",
        r"D:\Disastra\AI\datasets\Cyclone"
    ]
    for path in possible_paths:
        if os.path.exists(path) and os.path.exists(os.path.join(path, "data.yaml")):
            return path
    return None

def create_colab_data_yaml(original_dataset_path):
    """
    Creates a temporary runtime YAML for YOLO to resolve paths correctly
    without modifying the original dataset data.yaml.
    """
    orig_yaml_path = os.path.join(original_dataset_path, "data.yaml")
    with open(orig_yaml_path, 'r') as f:
        data_cfg = yaml.safe_load(f)
    
    # Set explicit absolute path and fixed relative splits
    data_cfg['path'] = os.path.abspath(original_dataset_path)
    data_cfg['train'] = 'train/images'
    data_cfg['val'] = 'valid/images'
    data_cfg['test'] = 'test/images'
    
    # Use a generic /tmp directory or local directory for the generated yaml
    temp_yaml_dir = "/tmp" if os.path.exists("/tmp") else os.path.abspath(".")
    temp_yaml_path = os.path.join(temp_yaml_dir, "cyclone_colab_runtime.yaml")
    
    with open(temp_yaml_path, 'w') as f:
        yaml.safe_dump(data_cfg, f)
        
    return temp_yaml_path, data_cfg

def run_smoke_test():
    print("==================================================")
    print("      DISASTRA — CYCLONE MODEL SMOKE TEST        ")
    print("==================================================")
    
    # 1. Verify CUDA / GPU availability
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        print(f"[PASS] GPU Available: {gpu_name}")
    else:
        print("[FAIL] CUDA/GPU not available. Please enable T4 GPU in Google Colab.")
        return False

    # 2. Verify dataset path
    dataset_path = find_dataset_path()
    if not dataset_path:
        print("[FAIL] Cyclone dataset path not found. Ensure repository is cloned, Drive is mounted, or ZIP is extracted to /content/Cyclone.")
        return False
    print(f"[PASS] Dataset path verified: {dataset_path}")

    # Verify counts roughly
    for split in ['train', 'valid', 'test']:
        img_dir = os.path.join(dataset_path, split, 'images')
        if os.path.exists(img_dir):
            count = len(os.listdir(img_dir))
            print(f"[PASS] {split} images: {count}")
        else:
            print(f"[FAIL] {split} images directory missing.")

    # 3. Load & verify Cyclone data.yaml & classes
    orig_yaml_path = os.path.join(dataset_path, "data.yaml")
    with open(orig_yaml_path, 'r') as f:
        orig_cfg = yaml.safe_load(f)
        
    expected_classes = ['CS', 'Cyclone-Eye', 'D', 'DD', 'SCS', 'VSCS']
    if orig_cfg.get('nc') != 6:
        print(f"[FAIL] Expected 6 classes, found {orig_cfg.get('nc')}")
        return False
    if orig_cfg.get('names') != expected_classes:
        print(f"[FAIL] Expected class names {expected_classes}, found {orig_cfg.get('names')}")
        return False
    print(f"[PASS] data.yaml verified (6 classes: {orig_cfg.get('names')})")

    # Prepare runtime YAML for path resolution
    runtime_yaml_path, _ = create_colab_data_yaml(dataset_path)
    print(f"[PASS] Runtime dataset YAML created: {runtime_yaml_path}")

    # 4. Load YOLO model
    try:
        from ultralytics import YOLO
        # Request specified YOLO26 Small model loading, mapped to YOLO26s due to user instruction
        model = YOLO("yolo26s.pt")
        print("[PASS] YOLO26s (Small) model loaded successfully.")
    except ImportError:
        print("[FAIL] ultralytics package not installed. Run: pip install ultralytics")
        return False

    # 5. Run short smoke test (1 epoch) & 6. Save outputs separately
    runs_dir = get_runs_dir()
    os.makedirs(runs_dir, exist_ok=True)
    try:
        print("Starting 1-epoch smoke test training...")
        model.train(
            data=runtime_yaml_path,
            epochs=1,
            imgsz=640,
            batch=8,
            project=runs_dir,
            name="smoke_test",
            exist_ok=True,
            device=0
        )
        print("[PASS] Smoke test 1-epoch training finished.")
    except Exception as e:
        print(f"[FAIL] Smoke test training error: {e}")
        return False

    # 7. Validation predictions and metrics
    try:
        print("Running validation check...")
        metrics = model.val()
        map50_95 = metrics.box.map
        print(f"[PASS] Validation completed. mAP50-95: {map50_95:.4f}")
    except Exception as e:
        print(f"[FAIL] Validation error: {e}")
        return False

    # 8. Report final status
    print("\n=== CYCLONE SMOKE TEST RESULT: PASS ===")
    return True

if __name__ == "__main__":
    success = run_smoke_test()
    if not success:
        sys.exit(1)
