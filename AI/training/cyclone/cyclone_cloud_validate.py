"""
Cyclone Cloud Validation Script
Loads a trained best.pt model and evaluates it against validation and test sets.
"""
import os
import sys
import yaml
from ultralytics import YOLO

def locate_dataset(dataset_path_override=None):
    if dataset_path_override and os.path.exists(dataset_path_override):
        return dataset_path_override
    possible_paths = [
        "Cyclone",
        "/workspace/Cyclone",
        "/data/Cyclone",
        r"D:\Disastra\AI\datasets\Cyclone"
    ]
    for p in possible_paths:
        if os.path.exists(p) and os.path.exists(os.path.join(p, "data.yaml")):
            return p
    return None

def main():
    print("==================================================")
    print("      DISASTRA CYCLONE CLOUD VALIDATION RUN       ")
    print("==================================================")
    
    DATASET_OVERRIDE = os.environ.get("CYCLONE_DATASET_PATH", None)
    OUTPUT_DIR = os.environ.get("CYCLONE_OUTPUT_DIR", "./cloud_training_output")
    BEST_PT_PATH = os.path.join(OUTPUT_DIR, "run", "weights", "best.pt")
    
    if not os.path.exists(BEST_PT_PATH):
        print(f"[FAIL] best.pt not found at {BEST_PT_PATH}. Cannot validate.")
        sys.exit(1)
        
    dataset_path = locate_dataset(DATASET_OVERRIDE)
    if not dataset_path:
        print("[FAIL] Dataset not found. Cannot validate.")
        sys.exit(1)
        
    # We rely on the previously generated runtime yaml
    runtime_yaml = os.path.join(OUTPUT_DIR, "cyclone_runtime.yaml")
    if not os.path.exists(runtime_yaml):
        print(f"[FAIL] Runtime YAML not found at {runtime_yaml}. Please run training preparation first.")
        sys.exit(1)
        
    print(f"Loading best.pt from {BEST_PT_PATH}...")
    model = YOLO(BEST_PT_PATH)
    
    print("\n--- 1. RUNNING VALIDATION EVALUATION ---")
    val_metrics = model.val(data=runtime_yaml, split='val')
    print("Validation Precision:", val_metrics.box.map50)  # Example metric field
    print("Validation Recall:", val_metrics.box.map)     # Example metric field
    
    print("\n--- 2. RUNNING TEST EVALUATION ---")
    test_metrics = model.val(data=runtime_yaml, split='test')
    print("Test Precision:", test_metrics.box.map50)
    print("Test Recall:", test_metrics.box.map)
    
    print("\n--- 3. SAMPLE PREDICTIONS ---")
    test_images_dir = os.path.join(dataset_path, "test", "images")
    if os.path.exists(test_images_dir):
        import glob
        samples = glob.glob(os.path.join(test_images_dir, "*.jpg"))[:3]
        if samples:
            pred_dir = os.path.join(OUTPUT_DIR, "predictions")
            os.makedirs(pred_dir, exist_ok=True)
            print(f"Predicting on {len(samples)} sample images...")
            model.predict(source=samples, save=True, project=pred_dir, name="test_samples")
            print(f"Predictions saved to {pred_dir}")
            
    print("\nVALIDATION RUN COMPLETE.")

if __name__ == "__main__":
    main()
