"""
Cyclone Cloud Training Script
For execution in arbitrary Cloud GPU environments (non-Colab specific)
"""
import os
import sys
import torch
import yaml
from ultralytics import YOLO

def check_gpu():
    if not torch.cuda.is_available():
        print("[FAIL] CUDA/GPU is unavailable. Cloud training requires a GPU.")
        sys.exit(1)
    print(f"[PASS] GPU Available: {torch.cuda.get_device_name(0)}")

def locate_dataset(dataset_path_override=None):
    if dataset_path_override and os.path.exists(dataset_path_override):
        return dataset_path_override

    # Try common local/cloud fallback paths
    possible_paths = [
        "Cyclone",
        "/workspace/Cyclone",
        "/data/Cyclone",
        r"D:\Disastra\AI\datasets\Cyclone"
    ]
    for p in possible_paths:
        if os.path.exists(p) and os.path.exists(os.path.join(p, "data.yaml")):
            return p
    
    print("[FAIL] Dataset is missing. Could not locate 'Cyclone' dataset folder.")
    sys.exit(1)

def prepare_runtime_yaml(dataset_path, output_dir):
    data_yaml = os.path.join(dataset_path, "data.yaml")
    if not os.path.exists(data_yaml):
        print(f"[FAIL] data.yaml is missing in {dataset_path}")
        sys.exit(1)
        
    with open(data_yaml, 'r') as f:
        cfg = yaml.safe_load(f)
        
    cfg['path'] = os.path.abspath(dataset_path)
    cfg['train'] = 'train/images'
    cfg['val'] = 'valid/images'
    cfg['test'] = 'test/images'
    
    os.makedirs(output_dir, exist_ok=True)
    runtime_yaml_path = os.path.join(output_dir, "cyclone_runtime.yaml")
    
    with open(runtime_yaml_path, 'w') as f:
        yaml.safe_dump(cfg, f)
        
    return runtime_yaml_path

def main():
    print("==================================================")
    print("       DISASTRA CYCLONE CLOUD TRAINING RUN        ")
    print("==================================================")
    
    # Configurables (can be replaced by argparse in production)
    DATASET_OVERRIDE = os.environ.get("CYCLONE_DATASET_PATH", None)
    MODEL_NAME = os.environ.get("CYCLONE_MODEL", "yolo26s.pt")
    OUTPUT_DIR = os.environ.get("CYCLONE_OUTPUT_DIR", "./cloud_training_output")
    
    check_gpu()
    dataset_path = locate_dataset(DATASET_OVERRIDE)
    print(f"[PASS] Dataset located at: {dataset_path}")
    
    runtime_yaml = prepare_runtime_yaml(dataset_path, OUTPUT_DIR)
    
    try:
        print(f"Loading model: {MODEL_NAME}")
        model = YOLO(MODEL_NAME)
    except Exception as e:
        print(f"[FAIL] Model cannot be loaded ({MODEL_NAME}). Error: {e}")
        sys.exit(1)
        
    print("[READY] Cloud training environment is verified and configured.")
    print("Training parameters: epochs=50, imgsz=640, batch=16, patience=10, pretrained=True")
    
    # NOTE: Training is intentionally NOT started automatically per safety rules.
    # To start training, uncomment the block below.
    """
    print("Starting training...")
    model.train(
        data=runtime_yaml,
        epochs=50,
        imgsz=640,
        batch=16,
        patience=10,
        pretrained=True,
        device=0,
        project=OUTPUT_DIR,
        name="run",
        exist_ok=True,
        val=True,
        save=True
    )
    print("Training complete.")
    """
    print("CYCLONE CLOUD TRAINING PACKAGE READY — TRAINING NOT STARTED.")

if __name__ == "__main__":
    main()
