"""
Full training script for Cyclone YOLO Object Detection
Intended to be run in Google Colab with NVIDIA Tesla T4 GPU
Can be pasted directly into Colab cells.
"""
import os
import sys
import torch
import yaml
from ultralytics import YOLO

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
    
    data_cfg['path'] = os.path.abspath(original_dataset_path)
    data_cfg['train'] = 'train/images'
    data_cfg['val'] = 'valid/images'
    data_cfg['test'] = 'test/images'
    
    temp_yaml_dir = "/tmp" if os.path.exists("/tmp") else os.path.abspath(".")
    temp_yaml_path = os.path.join(temp_yaml_dir, "cyclone_colab_runtime.yaml")
    
    with open(temp_yaml_path, 'w') as f:
        yaml.safe_dump(data_cfg, f)
        
    return temp_yaml_path

def run_training():
    print("==================================================")
    print("      DISASTRA — CYCLONE FULL MODEL TRAINING     ")
    print("==================================================")
    
    if not torch.cuda.is_available():
        print("[FAIL] CUDA/GPU not available. Please enable T4 GPU in Google Colab.")
        return False

    dataset_path = find_dataset_path()
    if not dataset_path:
        print("[FAIL] Cyclone dataset path not found.")
        return False

    runtime_yaml_path = create_colab_data_yaml(dataset_path)
    runs_dir = get_runs_dir()
    os.makedirs(runs_dir, exist_ok=True)

    print("Loading YOLO26s (Small) model architecture...")
    model = YOLO("yolo26s.pt") 

    print("Starting full training run (50 epochs)...")
    try:
        model.train(
            data=runtime_yaml_path,
            epochs=50,
            imgsz=640,
            batch=16,
            project=runs_dir,
            name="train_run",
            exist_ok=True,
            device=0,
            patience=10,
            pretrained=True,
            save=True
        )
        print(f"[SUCCESS] Training completed! Weights saved under: {os.path.join(runs_dir, 'train_run', 'weights')}")
        print("Outputs include best.pt and last.pt")
        return True
    except Exception as e:
        print(f"[FAIL] Training error: {e}")
        return False

if __name__ == "__main__":
    success = run_training()
    if not success:
        sys.exit(1)
