"""
Kaggle Training Script for Disastra Cyclone Model
=================================================
IMPORTANT: Do not modify original dataset files.
"""

import sys
import os
import glob
import yaml
import shutil
import torch
from ultralytics import YOLO

def main():
    print("==================================================")
    print("DISASTRA CYCLONE TRAINING (Kaggle Version)")
    print("==================================================")
    
    # CELL 1 — Environment
    print("Python version:", sys.version)
    print("PyTorch version:", torch.__version__)
    if torch.cuda.is_available():
        print("CUDA is available! GPU:", torch.cuda.get_device_name(0))
    else:
        print("FAIL: CUDA is unavailable. Please enable GPU.")
        raise SystemError("CUDA GPU is required but not found.")
        
    # CELL 3 — Locate Dataset
    def find_kaggle_dataset():
        possible_paths = [
            "/kaggle/input/disastra-cyclone/Cyclone",
            "/kaggle/input/disastra-cyclone"
        ]
        for p in possible_paths:
            if os.path.exists(p) and os.path.exists(os.path.join(p, "data.yaml")):
                return p
        return None

    dataset_path = find_kaggle_dataset()
    if dataset_path:
        print("\nKaggle dataset found at:", dataset_path)
    else:
        print("FAIL: Cyclone dataset not found.")
        raise FileNotFoundError("Dataset missing.")
        
    # CELL 4 — Validate Dataset
    required_paths = [
        "", "train/images", "train/labels", "valid/images", "valid/labels", 
        "test/images", "test/labels", "data.yaml"
    ]
    for rp in required_paths:
        full_p = os.path.join(dataset_path, rp)
        if os.path.exists(full_p):
            print(f"[PASS] {rp or 'Cyclone directory'} exists.")
        else:
            print(f"[FAIL] {rp or 'Cyclone directory'} missing.")
            
    # CELL 5 — Count Dataset
    print("\nDataset Counts:")
    for split in ['train', 'valid', 'test']:
        img_path = os.path.join(dataset_path, split, 'images')
        lbl_path = os.path.join(dataset_path, split, 'labels')
        imgs = len(os.listdir(img_path)) if os.path.exists(img_path) else 0
        lbls = len(os.listdir(lbl_path)) if os.path.exists(lbl_path) else 0
        print(f"{split} images: {imgs}")
        print(f"{split} labels: {lbls}")
        
    # CELL 6 — Validate Classes
    orig_yaml = os.path.join(dataset_path, "data.yaml")
    with open(orig_yaml, 'r') as f:
        cfg = yaml.safe_load(f)
    expected_classes = ['CS', 'Cyclone-Eye', 'D', 'DD', 'SCS', 'VSCS']
    actual_classes = cfg.get('names', [])
    if cfg.get('nc') == 6 and actual_classes == expected_classes:
        print("\n[PASS] 6 classes verified:", actual_classes)
    else:
        print("\n[FAIL] Class mismatch. Found:", actual_classes)
        
    # CELL 7 — Runtime YAML
    working_dir = "/kaggle/working"
    os.makedirs(working_dir, exist_ok=True)
    runtime_yaml_path = os.path.join(working_dir, "cyclone_kaggle_runtime.yaml")
    cfg['path'] = os.path.abspath(dataset_path)
    cfg['train'] = 'train/images'
    cfg['val'] = 'valid/images'
    cfg['test'] = 'test/images'
    with open(runtime_yaml_path, 'w') as f:
        yaml.safe_dump(cfg, f)
    print("Runtime YAML created at:", runtime_yaml_path)

    # CELL 8 — Load YOLO26s
    print("\nLoading YOLO26s...")
    model = YOLO("yolo26s.pt")
    print("[PASS] YOLO26s model loaded with pretrained weights.")
    
    # CELL 10 — Full Training
    print("\nStarting full training...")
    # NOTE: In a Kaggle environment, this script runs the full training automatically.
    # In the notebook, it is commented out.
    results = model.train(
        data=runtime_yaml_path,
        epochs=50,
        imgsz=640,
        batch=16,
        device=0,
        pretrained=True,
        patience=10,
        project="/kaggle/working/disastra_cyclone",
        name="cyclone_yolo26s",
        exist_ok=True,
        workers=2,
        plots=True,
        val=True
    )
    print("Full training finished.")
    
    # CELL 11 — Locate Checkpoints
    weights_dir = "/kaggle/working/disastra_cyclone/cyclone_yolo26s/weights/"
    best_pt = os.path.join(weights_dir, "best.pt")
    last_pt = os.path.join(weights_dir, "last.pt")
    
    print("\nChecking for checkpoints...")
    if os.path.exists(best_pt):
        print("Found best.pt at:", best_pt)
    else:
        print("best.pt not found.")
    if os.path.exists(last_pt):
        print("Found last.pt at:", last_pt)
        
    # CELL 12 & 13 — Validation and Test
    if os.path.exists(best_pt):
        best_model = YOLO(best_pt)
        print("\nRunning validation with best.pt...")
        val_metrics = best_model.val(data=runtime_yaml_path, split='val')
        print("Running test evaluation with best.pt...")
        test_metrics = best_model.val(data=runtime_yaml_path, split='test')
        
        # CELL 14 — Sample Prediction
        print("\nRunning inference on test images...")
        pred_dir = "/kaggle/working/disastra_cyclone/predictions/"
        os.makedirs(pred_dir, exist_ok=True)
        test_imgs_path = os.path.join(dataset_path, "test", "images")
        if os.path.exists(test_imgs_path):
            sample_imgs = [os.path.join(test_imgs_path, f) for f in os.listdir(test_imgs_path)][:3]
            if sample_imgs:
                best_model.predict(source=sample_imgs, save=True, project=pred_dir, name="samples")
    
    # CELL 15 — Package
    zip_path = "/kaggle/working/Disastra_Cyclone_YOLO26s"
    source_dir = "/kaggle/working/disastra_cyclone"
    if os.path.exists(source_dir):
        print("\nZipping training outputs...")
        shutil.make_archive(zip_path, 'zip', source_dir)
        print(f"Created archive: {zip_path}.zip")
        
    print("\nScript execution finished. Outputs available in /kaggle/working.")

if __name__ == "__main__":
    main()
